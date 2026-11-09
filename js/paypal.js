/**
 * AuraSign - PayPal Sandbox Support Integration Module
 * Handles PayPal JS SDK dynamic loading, amount selection, order creation,
 * and server-side capture verification.
 * 
 * TEMPORARY INTEGRATION: Cleanly isolated for simple hackathon evaluation or removal.
 */

class PayPalSupportManager {
  constructor() {
    this.enabled = false;
    this.clientId = null;
    this.currency = 'USD';
    this.selectedAmount = '5.00';
    this.sdkLoaded = false;
    this.buttonsInstance = null;

    // DOM Elements
    this.sectionEl = document.getElementById('support-aurasign-section');
    this.headerSupportBtn = document.getElementById('btn-header-support');
    this.buttonContainer = document.getElementById('paypal-button-container');
    this.feedbackContainer = document.getElementById('paypal-feedback-container');
    this.selectedAmountDisplay = document.getElementById('paypal-selected-amount-display');
    this.customAmountInput = document.getElementById('paypal-custom-amount');
    this.presetButtons = document.querySelectorAll('.paypal-preset-btn');
  }

  async init() {
    try {
      const res = await fetch('/api/paypal/config', {
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) {
        this.disableIntegration();
        return;
      }

      const config = await res.json();
      if (!config.enabled || !config.clientId) {
        this.disableIntegration();
        return;
      }

      this.enabled = true;
      this.clientId = config.clientId;
      this.currency = config.currency || 'USD';

      this.enableUI();
      this.setupAmountEventListeners();
      await this.loadPayPalSDK();
    } catch (err) {
      console.warn('[AuraSign PayPal] Config check failed. PayPal module disabled.', err);
      this.disableIntegration();
    }
  }

  disableIntegration() {
    this.enabled = false;
    if (this.sectionEl) {
      this.sectionEl.classList.add('hidden');
    }
    if (this.headerSupportBtn) {
      this.headerSupportBtn.classList.add('hidden');
    }
  }

  enableUI() {
    if (this.sectionEl) {
      this.sectionEl.classList.remove('hidden');
    }
    if (this.headerSupportBtn) {
      this.headerSupportBtn.classList.remove('hidden');
      this.headerSupportBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.sectionEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
    this.updateAmountDisplay();
  }

  setupAmountEventListeners() {
    // Preset buttons
    this.presetButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const amount = btn.getAttribute('data-amount');
        if (amount) {
          this.setAmount(amount);
          if (this.customAmountInput) {
            this.customAmountInput.value = '';
          }
        }
      });
    });

    // Custom amount input
    if (this.customAmountInput) {
      this.customAmountInput.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val) && val >= 1.00 && val <= 500.00) {
          this.setAmount(val.toFixed(2), false);
        } else if (e.target.value === '') {
          this.setAmount('5.00', true);
        }
      });

      this.customAmountInput.addEventListener('blur', (e) => {
        const val = parseFloat(e.target.value);
        if (isNaN(val) || val < 1.00) {
          this.setAmount('5.00', true);
          e.target.value = '';
        } else if (val > 500.00) {
          this.setAmount('500.00', false);
          e.target.value = '500.00';
        }
      });
    }
  }

  setAmount(amount, updatePresets = true) {
    this.selectedAmount = parseFloat(amount).toFixed(2);

    // Update preset buttons styling
    this.presetButtons.forEach((btn) => {
      const btnAmount = parseFloat(btn.getAttribute('data-amount')).toFixed(2);
      if (updatePresets && btnAmount === this.selectedAmount) {
        btn.classList.add('border-neon-mint', 'bg-neon-mint/15', 'text-neon-mint', 'font-bold');
        btn.classList.remove('border-slate-700', 'bg-obsidian-panel', 'text-slate-300');
      } else {
        btn.classList.remove('border-neon-mint', 'bg-neon-mint/15', 'text-neon-mint', 'font-bold');
        btn.classList.add('border-slate-700', 'bg-obsidian-panel', 'text-slate-300');
      }
    });

    this.updateAmountDisplay();
  }

  updateAmountDisplay() {
    if (this.selectedAmountDisplay) {
      this.selectedAmountDisplay.textContent = `$${this.selectedAmount} ${this.currency}`;
    }
  }

  loadPayPalSDK() {
    return new Promise((resolve, reject) => {
      if (window.paypal && window.paypal.Buttons) {
        this.renderPayPalButtons();
        return resolve();
      }

      const script = document.createElement('script');
      script.id = 'paypal-js-sdk';
      // Load standard SDK for sandbox buttons
      script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(this.clientId)}&currency=${encodeURIComponent(this.currency)}&components=buttons&enable-funding=venmo,card`;
      script.async = true;

      script.onload = () => {
        this.sdkLoaded = true;
        this.renderPayPalButtons();
        resolve();
      };

      script.onerror = (err) => {
        console.error('[AuraSign PayPal] Failed to load PayPal JavaScript SDK:', err);
        this.showError('Unable to load PayPal Checkout SDK. Please check your network connection.');
        reject(err);
      };

      document.head.appendChild(script);
    });
  }

  renderPayPalButtons() {
    if (!window.paypal || !window.paypal.Buttons || !this.buttonContainer) {
      return;
    }

    // Clear any previous button instance
    this.buttonContainer.innerHTML = '';

    try {
      this.buttonsInstance = window.paypal.Buttons({
        style: {
          shape: 'rect',
          color: 'gold',
          layout: 'vertical',
          label: 'paypal',
          height: 44
        },

        createOrder: async () => {
          this.clearFeedback();
          this.showLoading('Connecting to PayPal Sandbox & creating order...');

          try {
            const response = await fetch('/api/paypal/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ amount: this.selectedAmount })
            });

            const data = await response.json();

            if (!response.ok || !data.orderId) {
              const errMsg = data.error || data.details || 'Failed to create order on server.';
              throw new Error(errMsg);
            }

            this.hideLoading();
            return data.orderId;
          } catch (error) {
            this.hideLoading();
            this.showError(`Order Creation Failed: ${error.message}`);
            throw error;
          }
        },

        onApprove: async (data) => {
          this.showLoading('Authorizing & verifying payment with AuraSign backend...');

          try {
            const response = await fetch('/api/paypal/capture-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: data.orderID })
            });

            const captureResult = await response.json();

            if (!response.ok || !captureResult.success) {
              const errMsg = captureResult.error || 'Payment capture failed server-side verification.';
              throw new Error(errMsg);
            }

            this.hideLoading();
            this.showSuccess(captureResult);
          } catch (error) {
            this.hideLoading();
            this.showError(`Capture Verification Failed: ${error.message}`);
          }
        },

        onCancel: (data) => {
          this.hideLoading();
          this.showCancel('Payment was cancelled in PayPal Sandbox. No test funds were transferred.');
        },

        onError: (err) => {
          this.hideLoading();
          const errDetail = err && err.message ? err.message : String(err);
          this.showError(`PayPal Sandbox Error: ${errDetail}`);
        }
      });

      this.buttonsInstance.render(this.buttonContainer);
    } catch (err) {
      console.error('[AuraSign PayPal] Error rendering PayPal Buttons:', err);
      this.showError(`Could not render PayPal Buttons: ${err.message}`);
    }
  }

  showLoading(message = 'Processing Sandbox Transaction...') {
    if (!this.feedbackContainer) return;
    this.feedbackContainer.innerHTML = `
      <div class="p-4 rounded-xl bg-obsidian-panel border border-violet-500/40 flex items-center gap-3 animate-pulse">
        <svg class="w-5 h-5 text-neon-mint animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        <div class="text-xs font-mono text-slate-200">
          <span class="font-bold text-neon-mint">[SANDBOX]</span> ${this.escapeHtml(message)}
        </div>
      </div>
    `;
    this.feedbackContainer.classList.remove('hidden');
  }

  hideLoading() {
    // If the feedback container has a loading indicator, clear it
    if (this.feedbackContainer && this.feedbackContainer.querySelector('.animate-spin')) {
      this.clearFeedback();
    }
  }

  showSuccess(result) {
    if (!this.feedbackContainer) return;

    const amountStr = result.amount ? `$${result.amount} ${result.currency || 'USD'}` : `$${this.selectedAmount} USD`;
    const orderIdStr = result.orderId || 'N/A';
    const captureIdStr = result.captureId || 'N/A';
    const payerNameStr = result.payerName || 'AuraSign Supporter';

    this.feedbackContainer.innerHTML = `
      <div class="p-5 rounded-xl bg-obsidian-panel border border-neon-mint/60 shadow-neon-mint flex flex-col gap-3">
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-full bg-neon-mint/20 border border-neon-mint flex items-center justify-center text-neon-mint shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div>
              <h4 class="text-sm font-bold text-white font-mono">Thank You for Supporting AuraSign!</h4>
              <p class="text-[11px] text-neon-mint font-mono mt-0.5">Sandbox Payment Captured & Verified Server-Side</p>
            </div>
          </div>
          <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-neon-mint/15 text-neon-mint border border-neon-mint/30 uppercase">
            Completed
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono bg-obsidian-dark/80 p-3 rounded-lg border border-slate-800">
          <div>
            <span class="text-slate-500 block text-[10px] uppercase">Verified Contribution</span>
            <span class="text-white font-bold text-sm text-glow-mint">${this.escapeHtml(amountStr)}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[10px] uppercase">Payer</span>
            <span class="text-slate-200">${this.escapeHtml(payerNameStr)}</span>
          </div>
          <div class="sm:col-span-2 border-t border-slate-800/80 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div class="truncate">
              <span class="text-slate-500 text-[10px] uppercase">PayPal Order ID: </span>
              <span class="text-slate-300 font-mono text-[11px] select-all">${this.escapeHtml(orderIdStr)}</span>
            </div>
            <div class="truncate">
              <span class="text-slate-500 text-[10px] uppercase">Capture ID: </span>
              <span class="text-violet-300 font-mono text-[11px] select-all">${this.escapeHtml(captureIdStr)}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between pt-1">
          <p class="text-[10px] text-slate-400 italic">
            Test simulation complete. Core AuraSign translation features remain fully active.
          </p>
          <button id="btn-paypal-reset" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-mono transition border border-slate-700">
            Make Another Contribution
          </button>
        </div>
      </div>
    `;
    this.feedbackContainer.classList.remove('hidden');

    const resetBtn = document.getElementById('btn-paypal-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.clearFeedback();
        this.renderPayPalButtons();
      });
    }

    // Trigger subtle success sound if audio engine is available
    if (window.AuraSign?.audio && typeof window.AuraSign.audio.playCelebrationChime === 'function') {
      window.AuraSign.audio.playCelebrationChime();
    }
  }

  showCancel(message) {
    if (!this.feedbackContainer) return;
    this.feedbackContainer.innerHTML = `
      <div class="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/50 flex items-center justify-between gap-3 text-xs font-mono text-amber-200">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <span>${this.escapeHtml(message)}</span>
        </div>
        <button id="btn-paypal-dismiss-cancel" class="text-amber-400 hover:text-white text-[11px] underline ml-2">Dismiss</button>
      </div>
    `;
    this.feedbackContainer.classList.remove('hidden');

    document.getElementById('btn-paypal-dismiss-cancel')?.addEventListener('click', () => {
      this.clearFeedback();
    });
  }

  showError(message) {
    if (!this.feedbackContainer) return;
    this.feedbackContainer.innerHTML = `
      <div class="p-3.5 rounded-xl bg-red-950/40 border border-red-500/60 flex items-center justify-between gap-3 text-xs font-mono text-red-200">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span class="break-words">${this.escapeHtml(message)}</span>
        </div>
        <button id="btn-paypal-retry" class="px-2.5 py-1 rounded bg-red-900/60 hover:bg-red-800 text-red-100 text-[11px] border border-red-700/60 shrink-0 ml-2">
          Retry
        </button>
      </div>
    `;
    this.feedbackContainer.classList.remove('hidden');

    document.getElementById('btn-paypal-retry')?.addEventListener('click', () => {
      this.clearFeedback();
      this.renderPayPalButtons();
    });
  }

  clearFeedback() {
    if (this.feedbackContainer) {
      this.feedbackContainer.innerHTML = '';
      this.feedbackContainer.classList.add('hidden');
    }
  }

  escapeHtml(str) {
    if (typeof str !== 'string') return String(str || '');
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
  const manager = new PayPalSupportManager();
  manager.init();
  window.AuraSignPayPal = manager;
});
