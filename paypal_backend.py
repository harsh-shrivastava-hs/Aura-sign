#!/usr/bin/env python3
"""
PayPal Sandbox Backend Service for AuraSign
Provides OAuth2 token caching, order creation, and server-side payment capture verification.
Designed for temporary hackathon integration with complete isolation and easy removal.
"""

import json
import os
import re
import time
import threading
import sys
from urllib.parse import urlparse

# Load environment variables from .env
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

try:
    import requests
except ImportError:
    requests = None

# Thread lock for token caching and duplicate capture tracking
_lock = threading.Lock()
_cached_token = None
_token_expires_at = 0
_captured_order_ids = set()

# Safe regex pattern for PayPal Order IDs (alphanumeric, hyphens, underscores)
ORDER_ID_PATTERN = re.compile(r'^[A-Za-z0-9_-]{10,40}$')


def is_paypal_enabled():
    """Check if PayPal integration is enabled via environment variables."""
    # Re-read environment dynamically to allow live runtime toggle without restart
    flag = os.getenv('ENABLE_PAYPAL', 'false').strip().lower()
    enabled = flag in ('true', '1', 'yes', 'on')
    client_id = os.getenv('PAYPAL_CLIENT_ID', '').strip()
    client_secret = os.getenv('PAYPAL_CLIENT_SECRET', '').strip()
    return enabled and bool(client_id) and bool(client_secret)


def get_paypal_credentials():
    """Retrieve PayPal credentials and base URL from environment."""
    client_id = os.getenv('PAYPAL_CLIENT_ID', '').strip()
    client_secret = os.getenv('PAYPAL_CLIENT_SECRET', '').strip()
    base_url = os.getenv('PAYPAL_BASE_URL', 'https://api-m.sandbox.paypal.com').strip().rstrip('/')
    return client_id, client_secret, base_url


def get_paypal_access_token():
    """
    Authenticate with PayPal OAuth 2.0 API using client credentials.
    Caches token in-memory until near-expiration.
    """
    global _cached_token, _token_expires_at

    with _lock:
        now = time.time()
        if _cached_token and now < (_token_expires_at - 60):
            return _cached_token

        client_id, client_secret, base_url = get_paypal_credentials()
        if not client_id or not client_secret:
            raise ValueError("PayPal credentials are missing from environment.")

        if requests is None:
            raise RuntimeError("The 'requests' Python library is required for PayPal backend operations.")

        token_url = f"{base_url}/v1/oauth2/token"
        headers = {
            'Accept': 'application/json',
            'Accept-Language': 'en_US'
        }
        data = {'grant_type': 'client_credentials'}

        try:
            resp = requests.post(
                token_url,
                auth=(client_id, client_secret),
                data=data,
                headers=headers,
                timeout=10
            )
        except requests.RequestException as e:
            raise RuntimeError(f"Network error connecting to PayPal OAuth: {e}")

        if resp.status_code != 200:
            error_data = resp.json() if resp.headers.get('content-type', '').startswith('application/json') else resp.text
            raise RuntimeError(f"PayPal OAuth error ({resp.status_code}): {error_data}")

        token_data = resp.json()
        _cached_token = token_data.get('access_token')
        expires_in = token_data.get('expires_in', 3600)
        _token_expires_at = now + expires_in
        return _cached_token


def get_paypal_config():
    """
    Return public configuration for frontend checkout button initialization.
    NEVER exposes the Client Secret.
    """
    client_id, _, base_url = get_paypal_credentials()
    enabled = is_paypal_enabled()
    return {
        "enabled": enabled,
        "clientId": client_id if enabled else None,
        "currency": "USD",
        "environment": "sandbox"
    }


def create_paypal_order(payload):
    """
    Create an order using PayPal Orders v2 REST API with strict input validation.
    """
    if not is_paypal_enabled():
        return 403, {"error": "PayPal integration is disabled.", "enabled": False}

    # Validate amount
    raw_amount = payload.get('amount') if isinstance(payload, dict) else None
    if raw_amount is None:
        return 400, {"error": "Missing 'amount' field in request body."}

    try:
        amount_float = float(str(raw_amount).strip())
    except (ValueError, TypeError):
        return 400, {"error": "Invalid contribution amount. Must be a valid numeric value."}

    # Contribution constraints: $1.00 minimum, $500.00 maximum
    if amount_float < 1.00 or amount_float > 500.00:
        return 400, {"error": "Contribution amount must be between $1.00 and $500.00 USD."}

    amount_str = f"{amount_float:.2f}"
    currency = "USD"

    try:
        token = get_paypal_access_token()
    except Exception as e:
        return 502, {"error": "Failed to authenticate with PayPal Sandbox.", "details": str(e)}

    _, _, base_url = get_paypal_credentials()
    url = f"{base_url}/v2/checkout/orders"

    order_payload = {
        "intent": "CAPTURE",
        "purchase_units": [
            {
                "reference_id": "aurasign_support",
                "description": "Support AuraSign - Neural Sign Language Translation Initiative",
                "amount": {
                    "currency_code": currency,
                    "value": amount_str
                }
            }
        ],
        "application_context": {
            "brand_name": "AuraSign",
            "landing_page": "NO_PREFERENCE",
            "shipping_preference": "NO_SHIPPING",
            "user_action": "PAY_NOW"
        }
    }

    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }

    try:
        resp = requests.post(url, headers=headers, json=order_payload, timeout=12)
    except requests.RequestException as e:
        return 504, {"error": "PayPal order creation request timed out or failed.", "details": str(e)}

    try:
        resp_data = resp.json()
    except Exception:
        return 502, {"error": "Received non-JSON response from PayPal Orders API.", "raw": resp.text}

    if resp.status_code in (200, 201):
        order_id = resp_data.get('id')
        return 201, {
            "orderId": order_id,
            "status": resp_data.get('status', 'CREATED'),
            "amount": amount_str,
            "currency": currency
        }
    else:
        return resp.status_code, {
            "error": "PayPal rejected order creation.",
            "details": resp_data.get('message') or resp_data.get('details') or resp_data
        }


def capture_paypal_order(payload):
    """
    Capture approved PayPal order and verify server-side payment completion.
    Protects against duplicate captures and unapproved/fraudulent confirmations.
    """
    global _captured_order_ids

    if not is_paypal_enabled():
        return 403, {"error": "PayPal integration is disabled.", "enabled": False}

    raw_order_id = payload.get('orderId') if isinstance(payload, dict) else None
    if not raw_order_id or not isinstance(raw_order_id, str):
        return 400, {"error": "Missing or invalid 'orderId' string in request."}

    order_id = raw_order_id.strip()
    if not ORDER_ID_PATTERN.match(order_id):
        return 400, {"error": "Order ID format is invalid."}

    # Protection against duplicate capture attempts
    with _lock:
        if order_id in _captured_order_ids:
            return 409, {
                "error": "This order has already been captured and processed.",
                "orderId": order_id,
                "duplicate": True
            }

    try:
        token = get_paypal_access_token()
    except Exception as e:
        return 502, {"error": "Failed to authenticate with PayPal Sandbox.", "details": str(e)}

    _, _, base_url = get_paypal_credentials()
    url = f"{base_url}/v2/checkout/orders/{order_id}/capture"
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }

    try:
        resp = requests.post(url, headers=headers, json={}, timeout=15)
    except requests.RequestException as e:
        return 504, {"error": "PayPal order capture request timed out or failed.", "details": str(e)}

    try:
        resp_data = resp.json()
    except Exception:
        return 502, {"error": "Received non-JSON response from PayPal Orders API.", "raw": resp.text}

    # Handle Successful Capture
    if resp.status_code in (200, 201):
        order_status = resp_data.get('status')
        if order_status == 'COMPLETED':
            pu_list = resp_data.get('purchase_units', [])
            capture_info = {}
            if pu_list:
                captures = pu_list[0].get('payments', {}).get('captures', [])
                if captures:
                    capture_info = captures[0]

            capture_id = capture_info.get('id', '')
            captured_amount = capture_info.get('amount', {}).get('value', '0.00')
            captured_currency = capture_info.get('amount', {}).get('currency_code', 'USD')
            payer_info = resp_data.get('payer', {})
            payer_name = payer_info.get('name', {}).get('given_name', 'Supporter')
            payer_email = payer_info.get('email_address', '')

            # Record successfully captured order
            with _lock:
                _captured_order_ids.add(order_id)

            return 200, {
                "success": True,
                "status": "COMPLETED",
                "orderId": order_id,
                "captureId": capture_id,
                "amount": captured_amount,
                "currency": captured_currency,
                "payerName": payer_name,
                "payerEmail": payer_email,
                "verified": True,
                "message": "Payment verified and captured successfully via PayPal Sandbox."
            }
        else:
            return 400, {
                "success": False,
                "status": order_status,
                "error": f"Payment capture did not complete. Status is {order_status}.",
                "orderId": order_id
            }

    # Handle known PayPal error codes
    details = resp_data.get('details', [])
    issue = details[0].get('issue') if details else resp_data.get('name')

    if issue == 'ORDER_ALREADY_CAPTURED':
        with _lock:
            _captured_order_ids.add(order_id)
        return 409, {
            "error": "This PayPal order has already been captured.",
            "orderId": order_id,
            "duplicate": True
        }
    elif issue == 'ORDER_NOT_APPROVED':
        return 422, {
            "error": "The payer has not yet approved this order in PayPal Sandbox.",
            "orderId": order_id
        }
    elif resp.status_code == 404 or issue == 'INVALID_RESOURCE_ID':
        return 404, {
            "error": "Order ID not found on PayPal Sandbox.",
            "orderId": order_id
        }
    else:
        return resp.status_code, {
            "error": resp_data.get('message') or "PayPal capture failed.",
            "details": resp_data
        }


def handle_paypal_request(handler, method, path):
    """
    Request router for AuraSignRequestHandler.
    Returns True if the path matched a PayPal API endpoint, False otherwise.
    """
    parsed = urlparse(path)
    clean_path = parsed.path.rstrip('/')

    if not clean_path.startswith('/api/paypal'):
        return False

    # Standard response helper
    def send_json(status_code, body):
        try:
            content = json.dumps(body).encode('utf-8')
            handler.send_response(status_code)
            handler.send_header('Content-Type', 'application/json')
            handler.send_header('Content-Length', str(len(content)))
            handler.end_headers()
            handler.wfile.write(content)
        except (BrokenPipeError, ConnectionResetError):
            pass

    # GET /api/paypal/config
    if clean_path == '/api/paypal/config' and method == 'GET':
        send_json(200, get_paypal_config())
        return True

    # POST endpoints require reading JSON body
    if method == 'POST':
        # Enforce max content length to protect against oversized payloads (16 KB)
        try:
            content_length = int(handler.headers.get('Content-Length', 0))
        except (ValueError, TypeError):
            content_length = 0

        if content_length > 16384:
            send_json(413, {"error": "Payload too large. Maximum 16KB allowed."})
            return True

        payload = {}
        if content_length > 0:
            try:
                body_bytes = handler.rfile.read(content_length)
                payload = json.loads(body_bytes.decode('utf-8'))
            except Exception as e:
                send_json(400, {"error": "Malformed JSON request body.", "details": str(e)})
                return True

        if clean_path == '/api/paypal/create-order':
            status, response_body = create_paypal_order(payload)
            send_json(status, response_body)
            return True

        elif clean_path == '/api/paypal/capture-order':
            status, response_body = capture_paypal_order(payload)
            send_json(status, response_body)
            return True

    # Any other /api/paypal/* route not recognized
    send_json(404, {"error": "PayPal endpoint not found."})
    return True
