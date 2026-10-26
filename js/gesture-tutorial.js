/**
 * AuraSign - Interactive Gesture Tutorial & Academy Engine
 * Provides guided step-by-step ASL gesture lessons, real-time biomechanical coaching,
 * target ghost hand coordinates for canvas rendering, and celebratory milestone rewards.
 */

import { SIGN_DICTIONARY, SYNTHETIC_GESTURE_PRESETS } from './sign-database.js';
import { audioFeedback } from './audio-feedback.js';
export const TUTORIAL_LESSONS = [
  {
    id: "HELLO",
    name: "Hello / Open Palm",
    level: "Beginner",
    duration: 1.0,
    hint: "Open all 5 fingers wide with palm facing forward",
    steps: [
      "Face your palm directly towards the camera at chest level.",
      "Extend all five fingers comfortably outward.",
      "Ensure fingers are spread apart, not clenched together."
    ],
    commonMistakes: "Folding the thumb or holding fingers too tightly together.",
    targetPreset: "HELLO",
    validate: (t) => {
      const f = {
        thumb: t.thumb.extended,
        index: t.index.extended,
        middle: t.middle.extended,
        ring: t.ring.extended,
        pinky: t.pinky.extended
      };
      const allExt = f.thumb && f.index && f.middle && f.ring && f.pinky;
      const isSpread = t.spread.total > 0.50;

      if (!allExt) {
        if (!f.index || !f.middle) return { match: false, score: 0.4, advice: "Straighten all fingers including index and middle." };
        if (!f.ring || !f.pinky) return { match: false, score: 0.5, advice: "Open your ring and pinky fingers fully." };
        if (!f.thumb) return { match: false, score: 0.6, advice: "Extend your thumb outward." };
      }
      if (!isSpread) return { match: false, score: 0.7, advice: "Spread your fingers a bit wider." };

      return { match: true, score: 0.98, advice: "Flawless open hand! Hold steady..." };
    }
  },

  {
    id: "GOOD",
    name: "Good / Thumbs Up",
    level: "Beginner",
    duration: 1.0,
    hint: "Make a tight fist and point your thumb straight up",
    steps: [
      "Curl your index, middle, ring, and pinky fingers tightly into a fist.",
      "Extend your thumb straight up towards the ceiling.",
      "Hold your fist upright with knuckles facing camera."
    ],
    commonMistakes: "Letting index finger uncurl, or pointing thumb sideways.",
    targetPreset: "GOOD",
    validate: (t) => {
      const c = {
        index: t.index.curled,
        middle: t.middle.curled,
        ring: t.ring.curled,
        pinky: t.pinky.curled
      };
      if (!c.index || !c.middle) return { match: false, score: 0.35, advice: "Curl your index and middle fingers into a tight fist." };
      if (!c.ring || !c.pinky) return { match: false, score: 0.45, advice: "Keep your ring and pinky fingers curled." };
      if (!t.thumb.extended) return { match: false, score: 0.55, advice: "Extend your thumb fully." };
      if (t.thumb.dotPalmUp < 0.40) return { match: false, score: 0.65, advice: "Point your thumb straight up towards the ceiling." };

      return { match: true, score: 0.97, advice: "Excellent Thumbs Up! Hold it..." };
    }
  },

  {
    id: "PEACE",
    name: "Peace / Victory / 2",
    level: "Intermediate",
    duration: 1.0,
    hint: "Extend index and middle in a 'V', curl other fingers",
    steps: [
      "Extend your index and middle fingers straight up.",
      "Separate the two fingers into a distinct 'V' shape.",
      "Fold your ring and pinky fingers into your palm with thumb over them."
    ],
    commonMistakes: "Opening ring finger or not separating the two fingers into a V.",
    targetPreset: "PEACE",
    validate: (t) => {
      const f = { index: t.index.extended, middle: t.middle.extended };
      const c = { ring: t.ring.curled, pinky: t.pinky.curled };

      if (!f.index) return { match: false, score: 0.3, advice: "Straighten your index finger." };
      if (!f.middle) return { match: false, score: 0.4, advice: "Straighten your middle finger." };
      if (!c.ring || !c.pinky) return { match: false, score: 0.5, advice: "Curl your ring and pinky fingers into your palm." };
      if (t.spread.indexMiddle < 0.18) return { match: false, score: 0.7, advice: "Spread index and middle into a wider 'V' shape." };

      return { match: true, score: 0.98, advice: "Sharp Peace sign! Hold position..." };
    }
  },

  {
    id: "I LOVE YOU",
    name: "I Love You (ASL ILY)",
    level: "Intermediate",
    duration: 1.2,
    hint: "Extend Thumb, Index, and Pinky; fold Middle and Ring",
    steps: [
      "Start with an open hand facing forward.",
      "Fold your middle finger and ring finger into your palm.",
      "Keep thumb pointing out wide, with index and pinky pointing up."
    ],
    commonMistakes: "Tucking the thumb in (which creates the Rock On sign instead of ILY).",
    targetPreset: "I LOVE YOU",
    validate: (t) => {
      const f = { thumb: t.thumb.extended, index: t.index.extended, pinky: t.pinky.extended };
      const c = { middle: t.middle.curled, ring: t.ring.curled };

      if (!f.index) return { match: false, score: 0.3, advice: "Keep your index finger pointing up." };
      if (!f.pinky) return { match: false, score: 0.4, advice: "Extend your little pinky finger straight up." };
      if (!c.middle || !c.ring) return { match: false, score: 0.5, advice: "Curl your middle and ring fingers into your palm." };
      if (t.thumb.distToIndexMcp < 0.40) return { match: false, score: 0.65, advice: "Extend your thumb out wide to the side (ASL 'L' + 'Y')." };

      return { match: true, score: 0.99, advice: "Perfect I Love You sign! Hold steady..." };
    }
  },

  {
    id: "OK",
    name: "OK / Perfect",
    level: "Intermediate",
    duration: 1.0,
    hint: "Touch thumb tip and index tip into an 'O', 3 fingers up",
    steps: [
      "Bring the tip of your thumb and tip of your index finger together to touch.",
      "Form a circular 'O' shape with those two fingers.",
      "Extend your middle, ring, and pinky fingers straight up."
    ],
    commonMistakes: "Curling all fingers or not touching thumb to index tip.",
    targetPreset: "OK",
    validate: (t) => {
      const f = { middle: t.middle.extended, ring: t.ring.extended, pinky: t.pinky.extended };

      if (!f.middle || !f.ring) return { match: false, score: 0.4, advice: "Keep middle and ring fingers straight up." };
      if (!f.pinky) return { match: false, score: 0.5, advice: "Extend your pinky finger up." };
      if (t.pinchDist > 0.22) return { match: false, score: 0.65, advice: "Bring thumb tip and index tip closer to touch in an 'O'." };

      return { match: true, score: 0.96, advice: "Perfect 'OK' circle! Hold steady..." };
    }
  },

  {
    id: "YES",
    name: "Yes (Nodding Fist)",
    level: "Beginner",
    duration: 1.0,
    hint: "Make a solid closed fist like an ASL 'S'",
    steps: [
      "Curl all 4 fingers tightly into your palm.",
      "Wrap your thumb across your fingers.",
      "Hold fist facing forward at chest level."
    ],
    commonMistakes: "Leaving fingers loose or extending thumb upward.",
    targetPreset: "YES",
    validate: (t) => {
      const c = {
        index: t.index.curled,
        middle: t.middle.curled,
        ring: t.ring.curled,
        pinky: t.pinky.curled
      };
      if (!c.index || !c.middle || !c.ring || !c.pinky) {
        return { match: false, score: 0.45, advice: "Close all four fingers into a tight fist." };
      }
      if (t.thumb.extended && t.thumb.dotPalmUp > 0.45) {
        return { match: false, score: 0.6, advice: "Wrap thumb across front of fingers, don't point it up." };
      }

      return { match: true, score: 0.95, advice: "Solid fist! Hold it..." };
    }
  },

  {
    id: "CALL ME",
    name: "Call Me / Phone",
    level: "Intermediate",
    duration: 1.0,
    hint: "Extend Thumb and Pinky out wide, fold 3 middle fingers",
    steps: [
      "Extend your thumb and pinky finger out as far as comfortable.",
      "Keep the middle three fingers (index, middle, ring) tightly curled.",
      "Hold the hand shape upright in camera view."
    ],
    commonMistakes: "Accidentally lifting the index finger.",
    targetPreset: "I LOVE YOU", // base preset with curled index
    validate: (t) => {
      const f = { thumb: t.thumb.extended, pinky: t.pinky.extended };
      const c = { index: t.index.curled, middle: t.middle.curled, ring: t.ring.curled };

      if (!f.thumb) return { match: false, score: 0.4, advice: "Extend your thumb out wide." };
      if (!f.pinky) return { match: false, score: 0.5, advice: "Extend your pinky finger out." };
      if (!c.index) return { match: false, score: 0.6, advice: "Curl your index finger into your palm." };
      if (!c.middle || !c.ring) return { match: false, score: 0.65, advice: "Keep middle three fingers folded tight." };

      return { match: true, score: 0.96, advice: "Great 'Call Me' gesture! Hold steady..." };
    }
  },

  {
    id: "WATER",
    name: "Water (ASL 'W')",
    level: "Advanced",
    duration: 1.2,
    hint: "Form a 'W' with index, middle, and ring fingers spread",
    steps: [
      "Extend your index, middle, and ring fingers upward.",
      "Spread the three fingers apart to form the letter 'W'.",
      "Fold your pinky and thumb together in front of palm."
    ],
    commonMistakes: "Lifting the pinky finger or pressing fingers together.",
    targetPreset: "HELLO",
    validate: (t) => {
      const f = { index: t.index.extended, middle: t.middle.extended, ring: t.ring.extended };
      const c = { pinky: t.pinky.curled };

      if (!f.index || !f.middle || !f.ring) return { match: false, score: 0.4, advice: "Extend index, middle, and ring fingers upright." };
      if (!c.pinky) return { match: false, score: 0.55, advice: "Fold your little pinky finger down." };
      if (t.thumb.extended) return { match: false, score: 0.65, advice: "Tuck your thumb across palm or over pinky." };

      return { match: true, score: 0.95, advice: "Superb 'W' hand shape! Hold steady..." };
    }
  }
];

export class GestureTutorial {
  constructor(options = {}) {
    this.container = options.container;
    this.onLessonChange = options.onLessonChange || null;
    this.onLessonComplete = options.onLessonComplete || null;

    this.activeLessonIndex = 0;
    this.isActive = false;
    this.completedLessons = new Set();

    // Match tracking
    this.matchHoldStart = null;
    this.currentScore = 0;
    this.currentAdvice = "Position your hand in camera view to begin.";
  }

  getCurrentLesson() {
    return TUTORIAL_LESSONS[this.activeLessonIndex];
  }

  startTutorial(index = 0) {
    this.isActive = true;
    this.activeLessonIndex = Math.max(0, Math.min(index, TUTORIAL_LESSONS.length - 1));
    this.matchHoldStart = null;
    this.currentScore = 0;

    if (this.onLessonChange) {
      this.onLessonChange(this.getCurrentLesson());
    }
    this.render();
  }

  stopTutorial() {
    this.isActive = false;
    this.matchHoldStart = null;
    this.render();
  }

  nextLesson() {
    if (this.activeLessonIndex < TUTORIAL_LESSONS.length - 1) {
      this.activeLessonIndex++;
      this.matchHoldStart = null;
      if (this.onLessonChange) this.onLessonChange(this.getCurrentLesson());
      this.render();
    }
  }

  prevLesson() {
    if (this.activeLessonIndex > 0) {
      this.activeLessonIndex--;
      this.matchHoldStart = null;
      if (this.onLessonChange) this.onLessonChange(this.getCurrentLesson());
      this.render();
    }
  }

  selectLesson(idx) {
    if (idx >= 0 && idx < TUTORIAL_LESSONS.length) {
      this.activeLessonIndex = idx;
      this.matchHoldStart = null;
      if (this.onLessonChange) this.onLessonChange(this.getCurrentLesson());
      this.render();
    }
  }

  /**
   * Evaluate user's live hand telemetry against the active tutorial target
   */
  evaluateTelemetry(telemetry) {
    if (!this.isActive || !telemetry) {
      this.currentScore = 0;
      this.matchHoldStart = null;
      return { match: false, score: 0, progress: 0, advice: "Position your hand in front of the camera." };
    }

    const lesson = this.getCurrentLesson();
    if (!lesson) return null;

    const evalResult = lesson.validate(telemetry);
    this.currentScore = evalResult.score;
    this.currentAdvice = evalResult.advice;

    const now = performance.now();
    let progress = 0;

    if (evalResult.match) {
      if (!this.matchHoldStart) {
        this.matchHoldStart = now;
      }
      const elapsed = (now - this.matchHoldStart) / 1000;
      progress = Math.min(1.0, elapsed / lesson.duration);

      // Successfully held sign for required duration!
      if (progress >= 1.0) {
        this.completeCurrentLesson();
      }
    } else {
      this.matchHoldStart = null;
      progress = 0;
    }

    this.updateLiveUi(evalResult, progress);

    return {
      match: evalResult.match,
      score: evalResult.score,
      progress,
      advice: evalResult.advice,
      targetPreset: lesson.targetPreset
    };
  }

  completeCurrentLesson() {
    const lesson = this.getCurrentLesson();
    this.completedLessons.add(lesson.id);
    this.matchHoldStart = null;

    audioFeedback.playCommitChime();
    this.triggerCelebration();

    if (this.onLessonComplete) {
      this.onLessonComplete(lesson);
    }

    // Auto advance after brief celebration delay
    setTimeout(() => {
      if (this.isActive && this.activeLessonIndex < TUTORIAL_LESSONS.length - 1) {
        this.nextLesson();
      } else {
        this.render();
      }
    }, 1200);
  }

  triggerCelebration() {
    // Generate celebratory confetti particles in DOM
    const container = document.body;
    const colors = ['#00f5a0', '#8b5cf6', '#06b6d4', '#ffffff', '#fbbf24'];

    for (let i = 0; i < 35; i++) {
      const conf = document.createElement('div');
      conf.className = 'fixed pointer-events-none z-50 rounded-sm';
      const size = Math.random() * 8 + 6;
      conf.style.width = `${size}px`;
      conf.style.height = `${size * 0.6}px`;
      conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      conf.style.left = `${Math.random() * 80 + 10}vw`;
      conf.style.top = '20vh';
      conf.style.transform = `rotate(${Math.random() * 360}deg)`;
      conf.style.transition = 'all 1.2s cubic-bezier(0.25, 1, 0.5, 1)';
      container.appendChild(conf);

      requestAnimationFrame(() => {
        conf.style.top = `${Math.random() * 50 + 60}vh`;
        conf.style.left = `${parseFloat(conf.style.left) + (Math.random() * 20 - 10)}vw`;
        conf.style.opacity = '0';
        conf.style.transform = `rotate(${Math.random() * 720}deg)`;
      });

      setTimeout(() => conf.remove(), 1300);
    }
  }

  updateLiveUi(evalResult, progress) {
    const adviceEl = document.getElementById('tutorial-advice-pill');
    const scoreVal = document.getElementById('tutorial-score-val');
    const scoreBar = document.getElementById('tutorial-score-bar');
    const holdProgressEl = document.getElementById('tutorial-hold-progress');

    if (adviceEl) {
      adviceEl.textContent = evalResult.advice;
      adviceEl.className = evalResult.match
        ? "text-xs font-mono font-bold text-neon-mint flex items-center gap-1.5 animate-pulse"
        : "text-xs font-mono text-amber-300 flex items-center gap-1.5";
    }

    if (scoreVal) {
      scoreVal.textContent = `${Math.round(evalResult.score * 100)}%`;
      scoreVal.className = evalResult.score > 0.8
        ? "font-mono font-bold text-neon-mint"
        : (evalResult.score > 0.5 ? "font-mono font-bold text-violet-300" : "font-mono text-slate-400");
    }

    if (scoreBar) {
      scoreBar.style.width = `${Math.round(evalResult.score * 100)}%`;
      scoreBar.className = evalResult.match
        ? "h-full bg-gradient-to-r from-violet-500 to-neon-mint transition-all duration-100"
        : "h-full bg-slate-700 transition-all duration-100";
    }

    if (holdProgressEl) {
      holdProgressEl.style.width = `${Math.round(progress * 100)}%`;
    }
  }

  render() {
    if (!this.container) return;

    if (!this.isActive) {
      this.container.innerHTML = `
        <div class="p-4 rounded-2xl bg-obsidian-card border border-obsidian-border flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-violet-950/60 border border-violet-500/40 flex items-center justify-center text-neon-mint">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <div>
              <h4 class="text-white font-bold text-sm font-mono flex items-center gap-2">
                AuraSign Gesture Academy
                <span class="px-2 py-0.5 rounded-full text-[10px] bg-neon-mint/20 text-neon-mint font-semibold uppercase">Interactive</span>
              </h4>
              <p class="text-xs text-slate-400">Learn and master ASL gestures with real-time AI biomechanical coaching.</p>
            </div>
          </div>
          <button id="btn-start-tutorial" class="px-4 py-2 rounded-xl bg-neon-mint text-obsidian-deep font-bold text-xs uppercase tracking-wider hover:bg-neon-mint-dim transition shadow-neon-mint shrink-0 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Launch Academy
          </button>
        </div>
      `;

      const startBtn = this.container.querySelector('#btn-start-tutorial');
      if (startBtn) startBtn.addEventListener('click', () => this.startTutorial());
      return;
    }

    const lesson = this.getCurrentLesson();
    const isCompleted = this.completedLessons.has(lesson.id);
    const progressCount = `${this.completedLessons.size}/${TUTORIAL_LESSONS.length} Completed`;

    this.container.innerHTML = `
      <div class="relative bg-gradient-to-r from-obsidian-card via-obsidian-panel to-obsidian-card rounded-2xl border-2 border-neon-mint/60 p-5 shadow-neon-mint overflow-hidden">
        
        <!-- Top Control Bar -->
        <div class="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-neon-mint animate-ping"></span>
            <span class="text-xs font-mono font-bold uppercase tracking-wider text-neon-mint">
              Gesture Academy • Step ${this.activeLessonIndex + 1} of ${TUTORIAL_LESSONS.length}
            </span>
            <span class="text-[11px] font-mono px-2 py-0.5 rounded-full bg-violet-950 text-violet-300 border border-violet-700/50">
              ${lesson.level}
            </span>
          </div>

          <!-- Lesson Navigation Controls -->
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono text-slate-400 hidden sm:inline">${progressCount}</span>
            <button id="btn-tutorial-prev" class="p-1.5 rounded-lg bg-obsidian-dark hover:bg-slate-800 text-slate-300 disabled:opacity-30 transition" ${this.activeLessonIndex === 0 ? 'disabled' : ''} title="Previous Sign">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button id="btn-tutorial-next" class="p-1.5 rounded-lg bg-obsidian-dark hover:bg-slate-800 text-slate-300 disabled:opacity-30 transition" ${this.activeLessonIndex >= TUTORIAL_LESSONS.length - 1 ? 'disabled' : ''} title="Next Sign">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            </button>
            <button id="btn-tutorial-exit" class="px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-700/50 text-red-300 text-xs font-mono transition">
              Exit Tutor
            </button>
          </div>
        </div>

        <!-- Main Lesson Grid: Target Graphic (Left) & Real-time AI Coaching (Right) -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          
          <!-- Target Sign Diagram Preview (4 Cols) -->
          <div class="md:col-span-4 flex flex-col items-center justify-center p-3 rounded-xl bg-obsidian-dark border border-slate-800 text-center">
            <div class="w-24 h-24 mb-2 flex items-center justify-center text-neon-mint">
              ${SIGN_DICTIONARY[lesson.id] ? SIGN_DICTIONARY[lesson.id].svg : ''}
            </div>
            <h5 class="text-lg font-bold text-white font-mono tracking-tight flex items-center gap-1.5">
              ${lesson.name}
              ${isCompleted ? '<span class="text-neon-mint" title="Completed">✓</span>' : ''}
            </h5>
            <p class="text-[11px] text-slate-400 mt-1 italic">${lesson.hint}</p>
          </div>

          <!-- Real-Time AI Coaching & Actionable Advice (8 Cols) -->
          <div class="md:col-span-8 flex flex-col justify-between gap-3">
            
            <!-- Live Coaching Advice Pill -->
            <div class="p-3 rounded-xl bg-obsidian-dark/80 border border-slate-800">
              <div class="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                <span>AI COACHING FEEDBACK:</span>
                <div class="flex items-center gap-1">
                  <span>Match:</span>
                  <span id="tutorial-score-val" class="font-bold text-neon-mint">${Math.round(this.currentScore * 100)}%</span>
                </div>
              </div>
              <div id="tutorial-advice-pill" class="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                ${this.currentAdvice}
              </div>
              <!-- Match score bar -->
              <div class="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden mt-2 border border-slate-800">
                <div id="tutorial-score-bar" class="h-full bg-slate-700 transition-all duration-100" style="width: 0%"></div>
              </div>
            </div>

            <!-- Hold-to-Succeed Timer Bar -->
            <div class="flex flex-col gap-1">
              <div class="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Hold Duration Required:</span>
                <span class="text-neon-mint font-semibold">${lesson.duration}s</span>
              </div>
              <div class="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div id="tutorial-hold-progress" class="bg-gradient-to-r from-violet-500 to-neon-mint h-full w-0 transition-all duration-75"></div>
              </div>
            </div>

            <!-- Lesson Tips -->
            <div class="text-[11px] text-slate-300 font-sans leading-relaxed">
              <span class="text-violet-400 font-bold font-mono">Pro-Tip:</span> ${lesson.commonMistakes}
            </div>

          </div>

        </div>

        <!-- Quick Lesson Switcher Carousel at Bottom -->
        <div class="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          <span class="text-[10px] font-mono text-slate-500 shrink-0 uppercase">All Signs:</span>
          ${TUTORIAL_LESSONS.map((l, idx) => `
            <button class="lesson-chip px-2.5 py-1 rounded-lg text-[11px] font-mono transition shrink-0 border flex items-center gap-1.5 ${
              idx === this.activeLessonIndex 
                ? 'bg-neon-mint text-obsidian-deep font-bold border-neon-mint shadow-neon-mint'
                : (this.completedLessons.has(l.id)
                  ? 'bg-violet-950/60 text-neon-mint border-violet-800/60 hover:bg-violet-900/60'
                  : 'bg-obsidian-dark text-slate-300 border-slate-800 hover:border-slate-600')
            }" data-lesson-idx="${idx}">
              <span>${l.name.split('/')[0].trim()}</span>
              ${this.completedLessons.has(l.id) ? '<span class="text-[9px]">✓</span>' : ''}
            </button>
          `).join('')}
        </div>

      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const prevBtn = this.container.querySelector('#btn-tutorial-prev');
    if (prevBtn) prevBtn.addEventListener('click', () => this.prevLesson());

    const nextBtn = this.container.querySelector('#btn-tutorial-next');
    if (nextBtn) nextBtn.addEventListener('click', () => this.nextLesson());

    const exitBtn = this.container.querySelector('#btn-tutorial-exit');
    if (exitBtn) exitBtn.addEventListener('click', () => this.stopTutorial());

    this.container.querySelectorAll('.lesson-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-lesson-idx'), 10);
        this.selectLesson(idx);
      });
    });
  }
}
