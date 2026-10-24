#!/usr/bin/env python3
"""
AuraSign - Local High-Performance Development Server
Serves static assets with optimized CORS, MIME types, and cache headers.
"""

import http.server
import socketserver
import webbrowser
import os
import sys
import socket

DEFAULT_PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class AuraSignRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable CORS and permissions for webcam/microphone & MediaPipe WASM
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type')
        # Relaxed COOP/COEP to permit both camera and CDN workers
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def guess_type(self, path):
        # Ensure correct MIME types on all OS environments
        if path.endswith('.js') or path.endswith('.mjs'):
            return 'application/javascript'
        elif path.endswith('.css'):
            return 'text/css'
        elif path.endswith('.svg'):
            return 'image/svg+xml'
        elif path.endswith('.json'):
            return 'application/json'
        elif path.endswith('.wasm'):
            return 'application/wasm'
        return super().guess_type(path)

    def log_message(self, format, *args):
        # Quiet standard HTTP logs to keep terminal clean, logging only 4xx/5xx errors
        if len(args) > 1 and str(args[1]).startswith(('4', '5')):
            sys.stderr.write(f"[{self.log_date_time_string()}] {format % args}\n")

def find_available_port(start_port=DEFAULT_PORT, max_attempts=20):
    for port in range(start_port, start_port + max_attempts):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(('localhost', port)) != 0:
                return port
    return start_port

def print_banner(port, url):
    cyan = "\033[96m" if os.name != 'nt' or 'WT_SESSION' in os.environ else ""
    mint = "\033[92m" if os.name != 'nt' or 'WT_SESSION' in os.environ else ""
    violet = "\033[95m" if os.name != 'nt' or 'WT_SESSION' in os.environ else ""
    reset = "\033[0m" if os.name != 'nt' or 'WT_SESSION' in os.environ else ""

def run_server(port=None, auto_open=True):
    actual_port = find_available_port(port or DEFAULT_PORT)
    url = f"http://localhost:{actual_port}"

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", actual_port), AuraSignRequestHandler) as httpd:
        print_banner(actual_port, url)

        if auto_open:
            try:
                webbrowser.open(url)
            except Exception as e:
                print(f"Notice: Could not automatically open browser: {e}")

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down AuraSign server gracefully...")
            httpd.server_close()
            sys.exit(0)

if __name__ == '__main__':
    port_arg = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else DEFAULT_PORT
    auto_open_flag = '--no-browser' not in sys.argv
    run_server(port_arg, auto_open_flag)
