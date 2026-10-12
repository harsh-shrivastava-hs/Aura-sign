/**
 * AuraSign - Reverse Translation Engine (Speech & Text to Sign Flashcards)
 * Captures microphone input via Web Speech API, tokenizes spoken language or typed text,
 * maps words and fingerspelled letters to ASL dictionary assets, and renders
 * interactive visual flashcards with an animated step-by-step player.
 */

import { SIGN_DICTIONARY, ALPHABET_DICTIONARY, getAlphabetSVG } from './sign-database.js';
import { audioFeedback } from './audio-feedback.js';

export class ReverseTranslator {
  constructor(options = {}) {
    this.container = options.container;
    this.micStatusElement = options.micStatusElement;
    this.transcriptDisplay = options.transcriptDisplay;
    this.onActiveCardChange = options.onActiveCardChange || null;

    this.recognition = null;
    this.isListening = false;
    this.currentCards = [];
    this.activeIndex = 0;

    // Player state
    this.isPlaying = false;
    this.playTimer = null;
    this.playbackSpeed = 1.0; // 0.5x, 1x, 2x

    this.initSpeechRecognition();
  }

  initSpeechRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        this.recognition = new SpeechRec();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
          this.isListening = true;
          this.updateMicUi(true);
          audioFeedback.playMicToggleSound(true);
        };

        this.recognition.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          const currentText = (finalTranscript || interimTranscript).trim();
          if (this.transcriptDisplay) {
            this.transcriptDisplay.textContent = currentText || 'Listening for speech...';
          }

          if (finalTranscript) {
            this.translateTextToFlashcards(finalTranscript);
          }
        };

        this.recognition.onerror = (event) => {
          console.warn('Speech recognition notice:', event.error);
          if (event.error === 'not-allowed') {
            this.updateMicUi(false, 'Microphone blocked. Please allow mic access or type text.');
          } else {
            this.updateMicUi(false);
          }
        };

        this.recognition.onend = () => {
          this.isListening = false;
          this.updateMicUi(false);
        };
      } catch (e) {
        console.warn('Web Speech API initialization issue:', e);
      }
    } else {
      console.warn('Web Speech API not supported in this browser environment.');
    }
  }

  toggleListening() {
    if (!this.recognition) {
      alert('Speech Recognition is not natively supported in this browser. You can type any sentence or phrase in the text box below!');
      return;
    }

    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      this.updateMicUi(false);
      audioFeedback.playMicToggleSound(false);
    } else {
      try {
        this.recognition.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  }

  updateMicUi(listening, errorMsg = null) {
    if (!this.micStatusElement) return;

    if (listening) {
      this.micStatusElement.innerHTML = `
        <span class="relative flex h-3 w-3">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3 w-3 bg-neon-mint"></span>
        </span>
        <span class="text-neon-mint font-semibold tracking-wide text-xs">LISTENING... SPEAK NOW</span>
      `;
    } else if (errorMsg) {
      this.micStatusElement.innerHTML = `
        <span class="w-2.5 h-2.5 rounded-full bg-red-400"></span>
        <span class="text-red-300 text-xs">${errorMsg}</span>
      `;
    } else {
      this.micStatusElement.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-slate-500"></span>
        <span class="text-slate-400 text-xs">MIC IDLE (CLICK MIC TO SPEAK)</span>
      `;
    }
  }

  /**
   * Translate arbitrary input text into visual ASL flashcards
   */
  translateTextToFlashcards(rawText) {
    if (!rawText || rawText.trim().length === 0) return [];

    const clean = rawText.toUpperCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();
    const tokens = [];

    // Multi-word phrase matching keys (sorted by length descending for greedy match)
    const dictPhrases = Object.keys(SIGN_DICTIONARY).sort((a, b) => b.length - a.length);

    let remaining = clean;
    while (remaining.length > 0) {
      remaining = remaining.trim();
      let matched = false;

      // Check multi-word phrase matches
      for (const phrase of dictPhrases) {
        if (remaining.startsWith(phrase)) {
          tokens.push({
            type: 'word',
            key: phrase,
            data: SIGN_DICTIONARY[phrase]
          });
          remaining = remaining.slice(phrase.length);
          matched = true;
          break;
        }
      }

      if (matched) continue;

      // Match next single word
      const nextSpaceIdx = remaining.indexOf(' ');
      const currentWord = (nextSpaceIdx !== -1 ? remaining.slice(0, nextSpaceIdx) : remaining).trim();
      remaining = nextSpaceIdx !== -1 ? remaining.slice(nextSpaceIdx) : '';

      if (!currentWord) continue;

      if (SIGN_DICTIONARY[currentWord]) {
        tokens.push({
          type: 'word',
          key: currentWord,
          data: SIGN_DICTIONARY[currentWord]
        });
      } else {
        // Break unfamiliar word into fingerspelled letter flashcards
        for (const char of currentWord) {
          if (ALPHABET_DICTIONARY[char]) {
            tokens.push({
              type: 'letter',
              key: char,
              data: {
                word: char,
                category: 'Fingerspelling',
                description: ALPHABET_DICTIONARY[char].shape,
                tips: ALPHABET_DICTIONARY[char].tip,
                motion: `Finger-spell letter '${char}'`,
                svg: getAlphabetSVG(char)
              }
            });
          }
        }
      }
    }

    this.currentCards = tokens;
    this.activeIndex = 0;
    this.stopPlayback();
    this.renderFlashcards();

    return tokens;
  }

  renderFlashcards() {
    if (!this.container) return;

    if (this.currentCards.length === 0) {
      this.container.innerHTML = `
        <div class="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-800 rounded-2xl bg-obsidian-card/40">
          <div class="w-12 h-12 rounded-full bg-violet-950/40 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" /></svg>
          </div>
          <h4 class="text-white font-semibold text-sm mb-1">No Spoken / Typed Signs Yet</h4>
          <p class="text-slate-400 text-xs max-w-sm">Tap the microphone to speak, or type a word or sentence to see visual ASL flashcards with hand diagrams.</p>
        </div>
      `;
      return;
    }

    // Build flashcard grid & controls
    let html = `
      <div class="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/80">
        <div class="flex items-center gap-2">
          <span class="text-xs font-mono uppercase tracking-wider text-neon-mint font-bold flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-neon-mint"></span>
            ${this.currentCards.length} Sign${this.currentCards.length > 1 ? 's' : ''} Generated
          </span>
          <span class="text-xs text-slate-500">•</span>
          <span class="text-xs text-slate-400">Card ${this.activeIndex + 1} of ${this.currentCards.length}</span>
        </div>

        <!-- Flashcard Playback Controls -->
        <div class="flex items-center gap-1 bg-slate-900/90 border border-slate-700/60 rounded-xl p-1 shadow-inner">
          <button id="btn-prev-card" class="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition disabled:opacity-30" title="Previous Sign" ${this.activeIndex === 0 ? 'disabled' : ''}>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          
          <button id="btn-play-cards" class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${this.isPlaying ? 'bg-violet-600 text-white shadow-neon-violet' : 'bg-neon-mint/20 text-neon-mint hover:bg-neon-mint/30'} font-medium text-xs transition">
            ${this.isPlaying 
              ? `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Pause`
              : `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Play Flow`}
          </button>

          <button id="btn-next-card" class="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition disabled:opacity-30" title="Next Sign" ${this.activeIndex >= this.currentCards.length - 1 ? 'disabled' : ''}>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
          </button>

          <select id="speed-select" class="bg-transparent text-[11px] text-slate-300 px-1 py-0.5 rounded cursor-pointer border-none focus:outline-none">
            <option value="0.5" ${this.playbackSpeed === 0.5 ? 'selected' : ''}>0.5x</option>
            <option value="1.0" ${this.playbackSpeed === 1.0 ? 'selected' : ''}>1.0x</option>
            <option value="1.5" ${this.playbackSpeed === 1.5 ? 'selected' : ''}>1.5x</option>
          </select>
        </div>
      </div>

      <!-- Flashcards Grid / Carousel -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
    `;

    this.currentCards.forEach((card, index) => {
      const isActive = index === this.activeIndex;
      const isWord = card.type === 'word';

      html += `
        <div class="card-item group relative flex flex-col rounded-xl p-3.5 transition-all duration-300 cursor-pointer border ${
          isActive 
            ? 'bg-slate-900/90 border-neon-mint shadow-neon-mint ring-1 ring-neon-mint/50 scale-[1.02]' 
            : 'bg-obsidian-card/70 border-slate-800 hover:border-violet-500/60 hover:bg-slate-900/50'
        }" data-card-index="${index}">
          
          <!-- Card Top Bar -->
          <div class="flex items-center justify-between mb-2">
            <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
              isWord ? 'bg-violet-900/40 text-violet-300 border border-violet-700/40' : 'bg-slate-800 text-slate-300'
            }">
              ${card.data.category || 'ASL'}
            </span>
            <span class="text-[11px] font-mono text-slate-500">#${index + 1}</span>
          </div>

          <!-- SVG Graphic Hand Diagram Container -->
          <div class="relative w-full h-32 flex items-center justify-center bg-obsidian-dark/90 rounded-lg p-2 mb-2 border border-slate-800/80 group-hover:border-slate-700 transition">
            <div class="w-full h-full flex items-center justify-center text-neon-mint">
              ${card.data.svg}
            </div>
            ${isActive ? `
              <div class="absolute inset-0 rounded-lg border-2 border-neon-mint/40 pointer-events-none animate-pulse"></div>
            ` : ''}
          </div>

          <!-- Word / Title -->
          <div class="flex items-baseline justify-between mt-1">
            <h5 class="text-base font-bold text-white font-mono tracking-wide ${isActive ? 'text-neon-mint' : ''}">
              ${card.data.word}
            </h5>
          </div>

          <!-- Motion instruction -->
          <p class="text-xs text-slate-300 line-clamp-2 mt-1 leading-snug">
            ${card.data.description}
          </p>

          ${card.data.tips ? `
            <div class="mt-2 pt-2 border-t border-slate-800/80 flex items-start gap-1 text-[11px] text-slate-400">
              <span class="text-violet-400 font-bold">Tip:</span>
              <span class="italic text-slate-300 line-clamp-1">${card.data.tips}</span>
            </div>
          ` : ''}
        </div>
      `;
    });

    html += `</div>`;

    this.container.innerHTML = html;
    this.attachEventListeners();
  }

  attachEventListeners() {
    // Card item selection
    this.container.querySelectorAll('.card-item').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.getAttribute('data-card-index'), 10);
        this.selectCard(idx);
      });
    });

    // Prev / Next buttons
    const prevBtn = this.container.querySelector('#btn-prev-card');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.stepCard(-1));
    }

    const nextBtn = this.container.querySelector('#btn-next-card');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.stepCard(1));
    }

    // Play flow toggle
    const playBtn = this.container.querySelector('#btn-play-cards');
    if (playBtn) {
      playBtn.addEventListener('click', () => this.togglePlayback());
    }

    // Speed selector
    const speedSelect = this.container.querySelector('#speed-select');
    if (speedSelect) {
      speedSelect.addEventListener('change', (e) => {
        this.playbackSpeed = parseFloat(e.target.value);
        if (this.isPlaying) {
          this.stopPlayback();
          this.startPlayback();
        }
      });
    }
  }

  selectCard(index) {
    if (index >= 0 && index < this.currentCards.length) {
      this.activeIndex = index;
      audioFeedback.playDetectBlip();
      this.renderFlashcards();

      if (this.onActiveCardChange) {
        this.onActiveCardChange(this.currentCards[index]);
      }
    }
  }

  stepCard(delta) {
    const nextIdx = this.activeIndex + delta;
    if (nextIdx >= 0 && nextIdx < this.currentCards.length) {
      this.selectCard(nextIdx);
    }
  }

  togglePlayback() {
    if (this.isPlaying) {
      this.stopPlayback();
    } else {
      this.startPlayback();
    }
  }

  startPlayback() {
    if (this.currentCards.length === 0) return;
    this.isPlaying = true;
    this.renderFlashcards();

    const interval = Math.round(1800 / this.playbackSpeed);

    this.playTimer = setInterval(() => {
      if (this.activeIndex < this.currentCards.length - 1) {
        this.activeIndex++;
        this.renderFlashcards();
        audioFeedback.playDetectBlip();
      } else {
        // Completed sequence
        this.stopPlayback();
        audioFeedback.playCommitChime();
      }
    }, interval);
  }

  stopPlayback() {
    this.isPlaying = false;
    if (this.playTimer) {
      clearInterval(this.playTimer);
      this.playTimer = null;
    }
    const playBtn = this.container ? this.container.querySelector('#btn-play-cards') : null;
    if (playBtn) {
      this.renderFlashcards();
    }
  }
}
