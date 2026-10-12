/**
 * AuraSign - Main Application Controller
 * Orchestrates HandTracker, SignRecognizer, ReverseTranslator,
 * AudioFeedback, UI states, Sentence Accumulator, and Accessibility.
 */

import { HandTracker } from './hand-tracker.js';
import { SignRecognizer } from './sign-recognizer.js';
import { ReverseTranslator } from './reverse-translator.js';
import { audioFeedback } from './audio-feedback.js';
import { SIGN_DICTIONARY } from './sign-database.js';

class AuraSignApp {
  constructor() {
    // State
    this.sentenceWords = [];
    this.signHistory = [];
    this.isMuted = false;
    this.isHighContrast = false;
    this.currentDetectedSign = null;

    // DOM Elements
    this.videoEl = document.getElementById('webcam-video');
    this.canvasEl = document.getElementById('overlay-canvas');
    this.cameraSplashEl = document.getElementById('camera-splash');
    
    // HUD elements
    this.hudStatusBadge = document.getElementById('hud-status-badge');
    this.hudStatusDot = document.getElementById('hud-status-dot');
    this.hudStatusText = document.getElementById('hud-status-text');
    this.hudFps = document.getElementById('hud-fps');
    this.hudHandBadge = document.getElementById('hud-hand-badge');
    this.hudHandText = document.getElementById('hud-hand-text');
    
    // Hold progress ring
    this.hudHoldContainer = document.getElementById('hud-hold-container');
    this.commitProgressRing = document.getElementById('commit-progress-ring');
    this.commitCountdownText = document.getElementById('commit-countdown-text');
    this.holdProgressBar = document.getElementById('hold-progress-bar');

    // Right Column typography & sentence elements
    this.activeSignText = document.getElementById('active-sign-text');
    this.activeSignDesc = document.getElementById('active-sign-desc');
    this.activeConfidenceVal = document.getElementById('active-confidence-val');
    this.sentenceDisplay = document.getElementById('sentence-display');
    this.sentenceWordCount = document.getElementById('sentence-word-count');
    this.historyStream = document.getElementById('history-stream');
    this.historyCount = document.getElementById('history-count');

    // Buttons & controls
    this.btnToggleCamera = document.getElementById('btn-toggle-camera');
    this.btnCameraText = document.getElementById('btn-camera-text');
    this.btnSplashStart = document.getElementById('btn-splash-start');
    this.btnSplashDemo = document.getElementById('btn-splash-demo');
    this.selectDemoGesture = document.getElementById('select-demo-gesture');
    this.btnRunDemo = document.getElementById('btn-run-demo');
    this.btnToggleMirror = document.getElementById('btn-toggle-mirror');
    this.btnToggleSkeleton = document.getElementById('btn-toggle-skeleton');
    this.labelSkeletonState = document.getElementById('label-skeleton-state');

    // Sentence actions
    this.btnManualCommit = document.getElementById('btn-manual-commit');
    this.btnSpeakSentence = document.getElementById('btn-speak-sentence');
    this.btnBackspace = document.getElementById('btn-backspace');
    this.btnClearSentence = document.getElementById('btn-clear-sentence');
    this.btnAddSpace = document.getElementById('btn-add-space');
    this.btnCopySentence = document.getElementById('btn-copy-sentence');
    this.ttsWaveContainer = document.getElementById('tts-wave-container');
    this.ttsSpeakerIcon = document.getElementById('tts-speaker-icon');

    // Header actions
    this.btnContrastToggle = document.getElementById('btn-contrast-toggle');
    this.btnSoundToggle = document.getElementById('btn-sound-toggle');
    this.iconSoundOn = document.getElementById('icon-sound-on');
    this.iconSoundOff = document.getElementById('icon-sound-off');
    this.btnGlossary = document.getElementById('btn-glossary');
    this.btnShortcuts = document.getElementById('btn-shortcuts');

    // Modals
    this.modalGlossary = document.getElementById('modal-glossary');
    this.btnCloseGlossary = document.getElementById('btn-close-glossary');
    this.btnCloseGlossary2 = document.getElementById('btn-close-glossary-2');
    this.glossaryGrid = document.getElementById('glossary-grid');
    this.modalShortcuts = document.getElementById('modal-shortcuts');
    this.btnCloseShortcuts = document.getElementById('btn-close-shortcuts');

    // Toast
    this.toastEl = document.getElementById('toast');
    this.toastMessage = document.getElementById('toast-message');
    this.toastIcon = document.getElementById('toast-icon');

    // Reverse Translation Elements
    this.flashcardsContainer = document.getElementById('flashcards-container');
    this.micStatusBadge = document.getElementById('mic-status-badge');
    this.reverseTranscriptText = document.getElementById('reverse-transcript-text');
    this.btnMicToggle = document.getElementById('btn-mic-toggle');
    this.btnMicText = document.getElementById('btn-mic-text');
    this.formReverseText = document.getElementById('form-reverse-text');
    this.inputReverseText = document.getElementById('input-reverse-text');

    // Circumference of the commit progress ring (r = 24 => 2 * pi * 24 ~= 150.79)
    this.ringCircumference = 150.79;
  }

  async init() {
    audioFeedback.init();

    // 1. Initialize Sign Recognizer
    this.recognizer = new SignRecognizer({
      holdDurationMs: 650,
      cooldownDurationMs: 1200,
      onSignDetected: (data) => this.handleSignDetected(data),
      onSignProgress: (data) => this.handleSignProgress(data),
      onSignCommitted: (data) => this.handleSignCommitted(data)
    });

    // 2. Initialize Hand Tracker
    this.tracker = new HandTracker({
      videoElement: this.videoEl,
      canvasElement: this.canvasEl,
      onResults: (res) => {
        if (res && res.landmarks) {
          this.hudHandBadge.classList.remove('hidden');
          this.hudHandText.textContent = `${(res.handedness || 'RIGHT').toUpperCase()} HAND`;
          this.recognizer.process(res.landmarks, res.handedness);
        } else {
          this.hudHandText.textContent = 'NO HAND';
          this.recognizer.process(null);
        }
      },
      onFpsUpdate: (fps) => {
        if (this.hudFps) this.hudFps.textContent = fps;
      },
      onStatusChange: (status) => this.updateTrackerStatus(status)
    });

    await this.tracker.init();

    // 3. Initialize Reverse Translator
    this.reverseTranslator = new ReverseTranslator({
      container: this.flashcardsContainer,
      micStatusElement: this.micStatusBadge,
      transcriptDisplay: this.reverseTranscriptText,
      onActiveCardChange: (card) => {
        // Optional callback when active card updates
      }
    });

    // Initial default demo cards in reverse translation panel
    this.reverseTranslator.translateTextToFlashcards("HELLO THANK YOU I LOVE YOU");

    // 4. Setup event listeners & glossary
    this.setupEventListeners();
    this.populateGlossary();

    // Show initial welcome tip
    this.showToast('AuraSign Ready! Start Camera or Launch Simulator.', '👋');
  }

  setupEventListeners() {
    // Start / Toggle Camera
    const handleStartCam = async () => {
      audioFeedback.ensureContext();
      const success = await this.tracker.startCamera();
      if (success) {
        this.cameraSplashEl.classList.add('hidden');
        this.btnCameraText.textContent = 'Stop Camera';
        this.btnToggleCamera.classList.replace('bg-neon-mint', 'bg-red-500');
        this.btnToggleCamera.classList.replace('text-obsidian-deep', 'text-white');
      }
    };

    const handleStopCam = () => {
      this.tracker.stopCamera();
      this.cameraSplashEl.classList.remove('hidden');
      this.btnCameraText.textContent = 'Start Camera';
      this.btnToggleCamera.classList.replace('bg-red-500', 'bg-neon-mint');
      this.btnToggleCamera.classList.replace('text-white', 'text-obsidian-deep');
    };

    this.btnToggleCamera.addEventListener('click', () => {
      if (this.tracker.isCameraRunning) {
        handleStopCam();
      } else {
        handleStartCam();
      }
    });

    this.btnSplashStart.addEventListener('click', handleStartCam);

    // Simulator / Demo Mode
    const handleRunDemo = () => {
      audioFeedback.ensureContext();
      const gesture = this.selectDemoGesture.value;
      this.tracker.startDemoMode(gesture);
      this.cameraSplashEl.classList.add('hidden');
      this.btnCameraText.textContent = 'Stop Camera';
      this.btnToggleCamera.classList.replace('bg-neon-mint', 'bg-red-500');
      this.btnToggleCamera.classList.replace('text-white', 'text-white');
      this.showToast(`Simulating ASL '${gesture}'`, '⚡');
    };

    this.btnSplashDemo.addEventListener('click', handleRunDemo);
    this.btnRunDemo.addEventListener('click', handleRunDemo);
    this.selectDemoGesture.addEventListener('change', () => {
      if (this.tracker.isDemoMode) {
        this.tracker.setDemoPreset(this.selectDemoGesture.value);
      }
    });

    // Mirror toggle
    this.btnToggleMirror.addEventListener('click', () => {
      const next = !this.tracker.mirrored;
      this.tracker.setMirror(next);
      if (next) {
        this.videoEl.classList.add('-scale-x-100');
        this.showToast('Camera mirrored', '🪞');
      } else {
        this.videoEl.classList.remove('-scale-x-100');
        this.showToast('Camera normal', '📷');
      }
    });

    // Skeleton toggle
    this.btnToggleSkeleton.addEventListener('click', () => {
      this.tracker.showSkeleton = !this.tracker.showSkeleton;
      this.labelSkeletonState.textContent = this.tracker.showSkeleton ? 'ON' : 'OFF';
      this.labelSkeletonState.className = this.tracker.showSkeleton ? 'text-neon-mint font-semibold' : 'text-slate-500';
    });

    // Manual commit button
    this.btnManualCommit.addEventListener('click', () => {
      if (this.currentDetectedSign) {
        this.commitSign(this.currentDetectedSign);
      }
    });

    // TTS Speak aloud
    this.btnSpeakSentence.addEventListener('click', () => {
      this.speakActiveSentence();
    });

    // Backspace / Delete
    this.btnBackspace.addEventListener('click', () => {
      this.deleteLastSign();
    });

    // Clear All
    this.btnClearSentence.addEventListener('click', () => {
      this.clearSentence();
    });

    // Add Space
    this.btnAddSpace.addEventListener('click', () => {
      this.addSpace();
    });

    // Copy to Clipboard
    this.btnCopySentence.addEventListener('click', () => {
      this.copySentence();
    });

    // Header High Contrast Toggle
    this.btnContrastToggle.addEventListener('click', () => {
      this.isHighContrast = !this.isHighContrast;
      document.body.classList.toggle('high-contrast', this.isHighContrast);
      this.showToast(this.isHighContrast ? 'High Contrast Mode Enabled' : 'Standard Contrast Mode', '👁');
    });

    // Sound toggle
    this.btnSoundToggle.addEventListener('click', () => {
      this.isMuted = !this.isMuted;
      audioFeedback.setMuted(this.isMuted);
      this.iconSoundOn.classList.toggle('hidden', this.isMuted);
      this.iconSoundOff.classList.toggle('hidden', !this.isMuted);
      this.showToast(this.isMuted ? 'Sound cues muted' : 'Sound cues active', this.isMuted ? '🔇' : '🔊');
    });

    // Modals
    this.btnGlossary.addEventListener('click', () => {
      this.modalGlossary.classList.remove('hidden');
    });
    this.btnCloseGlossary.addEventListener('click', () => {
      this.modalGlossary.classList.add('hidden');
    });
    this.btnCloseGlossary2.addEventListener('click', () => {
      this.modalGlossary.classList.add('hidden');
    });

    this.btnShortcuts.addEventListener('click', () => {
      this.modalShortcuts.classList.remove('hidden');
    });
    this.btnCloseShortcuts.addEventListener('click', () => {
      this.modalShortcuts.classList.add('hidden');
    });

    // Reverse Translation: Mic Toggle
    this.btnMicToggle.addEventListener('click', () => {
      audioFeedback.ensureContext();
      this.reverseTranslator.toggleListening();
      if (this.reverseTranslator.isListening) {
        this.btnMicText.textContent = 'Stop Mic';
        this.btnMicToggle.classList.replace('bg-violet-600', 'bg-red-500');
      } else {
        this.btnMicText.textContent = 'Start Mic Input';
        this.btnMicToggle.classList.replace('bg-red-500', 'bg-violet-600');
      }
    });

    // Reverse Translation: Text Form
    this.formReverseText.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = this.inputReverseText.value.trim();
      if (val) {
        this.reverseTranslator.translateTextToFlashcards(val);
        this.reverseTranscriptText.textContent = `"${val}"`;
        this.showToast(`Converted: "${val}"`, '🔤');
      }
    });

    // Quick prompt chips
    document.querySelectorAll('.prompt-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.textContent.replace(/['"]/g, '').trim();
        this.inputReverseText.value = text;
        this.reverseTranslator.translateTextToFlashcards(text);
        this.reverseTranscriptText.textContent = `"${text}"`;
        this.showToast(`Rendered sign: ${text}`, '✨');
      });
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      // Don't intercept if user is typing in the input box
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (this.currentDetectedSign) {
          this.commitSign(this.currentDetectedSign);
        }
      } else if (e.code === 'Backspace') {
        e.preventDefault();
        this.deleteLastSign();
      } else if (e.key === 'm' || e.key === 'M') {
        this.btnMicToggle.click();
      } else if (e.key === 'c' || e.key === 'C') {
        this.clearSentence();
      } else if (e.key === 'p' || e.key === 'P') {
        this.speakActiveSentence();
      } else if (e.key === 's' || e.key === 'S') {
        this.btnToggleCamera.click();
      } else if (e.key === '?') {
        this.modalShortcuts.classList.toggle('hidden');
      }
    });
  }

  /**
   * Handle real-time sign detection
   */
  handleSignDetected(data) {
    if (!data || !data.sign) {
      this.currentDetectedSign = null;
      this.activeSignText.textContent = "Searching...";
      this.activeSignText.classList.remove('text-glow-mint');
      this.activeSignDesc.textContent = "Position hand clearly in frame to detect gestures.";
      this.activeConfidenceVal.textContent = "--%";
      this.holdProgressBar.style.width = '0%';
      this.hudHoldContainer.style.opacity = '0';
      return;
    }

    const isNewSign = this.currentDetectedSign !== data.sign;
    this.currentDetectedSign = data.sign;

    // Update typography
    this.activeSignText.textContent = data.sign;
    this.activeSignText.classList.add('text-glow-mint');
    if (isNewSign) {
      this.activeSignText.classList.add('sign-display-pulse');
      setTimeout(() => this.activeSignText.classList.remove('sign-display-pulse'), 400);
      audioFeedback.playDetectBlip();
    }

    this.activeSignDesc.textContent = data.description || '';
    const confPct = Math.round(data.confidence * 100);
    this.activeConfidenceVal.textContent = `${confPct}%`;
  }

  /**
   * Handle Hold-to-Commit Progress (e.g. 0.0 to 1.0)
   */
  handleSignProgress(data) {
    if (!data || !data.sign || data.progress <= 0) {
      this.hudHoldContainer.style.opacity = '0';
      this.holdProgressBar.style.width = '0%';
      return;
    }

    // Show and update circular progress ring
    this.hudHoldContainer.style.opacity = '1';
    const offset = this.ringCircumference - (data.progress * this.ringCircumference);
    this.commitProgressRing.style.strokeDashoffset = offset;

    // Linear progress bar in right typography panel
    this.holdProgressBar.style.width = `${Math.round(data.progress * 100)}%`;

    const pct = Math.round(data.progress * 100);
    this.commitCountdownText.textContent = `${pct}%`;
  }

  /**
   * Called when a sign is held long enough to auto-commit
   */
  handleSignCommitted(data) {
    if (!data || !data.sign) return;
    this.commitSign(data.sign);
  }

  /**
   * Append a sign into the sentence accumulator
   */
  commitSign(signName) {
    this.sentenceWords.push(signName);
    this.updateSentenceDisplay();
    this.recordHistory(signName);

    // Audio chime & visual celebration
    audioFeedback.playCommitChime();
    this.showToast(`Committed: "${signName}"`, '✓');

    // Reset hold ring visual
    this.commitProgressRing.style.strokeDashoffset = this.ringCircumference;
    this.holdProgressBar.style.width = '0%';
    this.hudHoldContainer.style.opacity = '0';
  }

  updateSentenceDisplay() {
    if (this.sentenceWords.length === 0) {
      this.sentenceDisplay.innerHTML = `<span class="text-slate-600 italic font-normal text-sm select-none">Translated signs will accumulate here into sentences...</span>`;
      this.sentenceWordCount.textContent = '0 words';
      return;
    }

    const text = this.sentenceWords.join(' ');
    this.sentenceDisplay.innerHTML = `<span class="text-white">${text}</span><span class="inline-block w-2 h-5 bg-neon-mint ml-1 animate-pulse align-middle"></span>`;
    this.sentenceWordCount.textContent = `${this.sentenceWords.length} word${this.sentenceWords.length > 1 ? 's' : ''}`;
  }

  deleteLastSign() {
    if (this.sentenceWords.length > 0) {
      const removed = this.sentenceWords.pop();
      this.updateSentenceDisplay();
      audioFeedback.playDeleteSound();
      this.showToast(`Deleted: "${removed}"`, '⌫');
    }
  }

  clearSentence() {
    if (this.sentenceWords.length > 0) {
      this.sentenceWords = [];
      this.updateSentenceDisplay();
      audioFeedback.playClearSound();
      this.showToast('Sentence cleared', '🗑');
    }
  }

  addSpace() {
    this.sentenceWords.push('');
    this.updateSentenceDisplay();
  }

  copySentence() {
    const text = this.sentenceWords.join(' ').trim();
    if (!text) {
      this.showToast('Nothing to copy', '⚠️');
      return;
    }

    navigator.clipboard.writeText(text).then(() => {
      this.showToast('Copied to clipboard!', '📋');
    }).catch(() => {
      this.showToast('Failed to copy', '❌');
    });
  }

  speakActiveSentence() {
    const text = this.sentenceWords.join(' ').trim();
    if (!text) {
      this.showToast('Sentence is empty to speak', '⚠️');
      return;
    }

    audioFeedback.speakText(
      text,
      () => {
        // onStart
        this.ttsWaveContainer.classList.remove('hidden');
        this.ttsWaveContainer.classList.add('flex');
        this.ttsSpeakerIcon.classList.add('hidden');
        this.btnSpeakSentence.classList.add('ring-2', 'ring-neon-mint');
      },
      () => {
        // onEnd
        this.ttsWaveContainer.classList.add('hidden');
        this.ttsWaveContainer.classList.remove('flex');
        this.ttsSpeakerIcon.classList.remove('hidden');
        this.btnSpeakSentence.classList.remove('ring-2', 'ring-neon-mint');
      }
    );
  }

  recordHistory(sign) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    this.signHistory.unshift({ sign, time: timeStr });
    if (this.signHistory.length > 12) {
      this.signHistory.pop();
    }

    this.renderHistory();
  }

  renderHistory() {
    this.historyCount.textContent = `${this.signHistory.length} recorded`;

    if (this.signHistory.length === 0) {
      this.historyStream.innerHTML = `<span class="text-xs text-slate-600 italic">No signs committed yet.</span>`;
      return;
    }

    this.historyStream.innerHTML = this.signHistory.map(item => `
      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-obsidian-panel border border-slate-800 text-[11px] font-mono text-neon-mint">
        <span>${item.sign}</span>
        <span class="text-[9px] text-slate-500">${item.time}</span>
      </span>
    `).join('');
  }

  updateTrackerStatus({ state, message }) {
    if (!this.hudStatusText) return;
    this.hudStatusText.textContent = message.toUpperCase();

    if (state === 'tracking') {
      this.hudStatusDot.className = 'w-2.5 h-2.5 rounded-full bg-neon-mint shadow-neon-mint';
      this.hudStatusBadge.className = 'px-3 py-1 rounded-full bg-obsidian-deep/90 border border-neon-mint/50 backdrop-blur-md flex items-center gap-2 text-xs font-mono';
    } else if (state === 'demo') {
      this.hudStatusDot.className = 'w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse';
      this.hudStatusBadge.className = 'px-3 py-1 rounded-full bg-obsidian-deep/90 border border-cyan-500/50 backdrop-blur-md flex items-center gap-2 text-xs font-mono';
    } else if (state === 'error') {
      this.hudStatusDot.className = 'w-2.5 h-2.5 rounded-full bg-red-500';
      this.hudStatusBadge.className = 'px-3 py-1 rounded-full bg-obsidian-deep/90 border border-red-500/50 backdrop-blur-md flex items-center gap-2 text-xs font-mono';
    } else {
      this.hudStatusDot.className = 'w-2.5 h-2.5 rounded-full bg-violet-400 animate-pulse';
      this.hudStatusBadge.className = 'px-3 py-1 rounded-full bg-obsidian-deep/85 border border-slate-700/80 backdrop-blur-md flex items-center gap-2 text-xs font-mono';
    }
  }

  populateGlossary() {
    if (!this.glossaryGrid) return;

    let html = '';
    for (const [key, item] of Object.entries(SIGN_DICTIONARY)) {
      html += `
        <div class="p-3 rounded-xl bg-obsidian-panel border border-slate-800 flex gap-3 items-center">
          <div class="w-16 h-16 bg-obsidian-dark rounded-lg p-1.5 flex items-center justify-center shrink-0 border border-slate-800">
            ${item.svg}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <h5 class="text-sm font-bold text-white font-mono">${item.word}</h5>
              <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800/40">${item.category}</span>
            </div>
            <p class="text-[11px] text-slate-300 mt-1 line-clamp-2">${item.description}</p>
            <p class="text-[10px] text-neon-mint mt-1">Motion: ${item.motion}</p>
          </div>
        </div>
      `;
    }
    this.glossaryGrid.innerHTML = html;
  }

  showToast(message, icon = '✓') {
    if (!this.toastEl) return;
    this.toastMessage.textContent = message;
    this.toastIcon.textContent = icon;

    this.toastEl.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
    this.toastEl.classList.add('translate-y-0', 'opacity-100');

    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toastEl.classList.remove('translate-y-0', 'opacity-100');
      this.toastEl.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
    }, 2800);
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  const app = new AuraSignApp();
  app.init();
  window.AuraSign = app;
});
