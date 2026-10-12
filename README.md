# AuraSign (Neural Sign Language Translator & Flashcard Engine)

**AuraSign** is a real-time, web-based sign language translation and reverse accessibility platform built with modern HTML5, Tailwind CSS, JavaScript (ES6 Modules), and Computer Vision.

Featuring a high-contrast obsidian & neon mint cybernetic aesthetic, AuraSign enables seamless bidirectional communication between Deaf/Hard-of-Hearing individuals and non-signing speakers.

---

## 🌟 Key Architecture & Features

### 1. Two-Column Live Sign Translator
- **Left Column**: Live webcam video feed container with real-time HUD overlays:
  - Joint landmark tracking with neon mint skeleton connections and electric violet joint nodes.
  - Bounding box reticles, palm target tracker, real-time FPS counter, and hand orientation metrics.
  - **Hold-to-Commit Progress Ring**: When a gesture is held steadily for 0.6 seconds, a circular holographic meter charges to 100%, emitting an audio chime and automatically committing the sign into the sentence.
  - **Simulator / Demo Mode**: Integrated synthetic hand tracker that animates 21 landmarks for testing and demonstration even without webcam access.
- **Right Column**: Dynamic Typography Output:
  - Hero typographic display of the active recognized sign with confidence meter and posture description.
  - Sentence Accumulator that builds readable phrases.
  - Text-to-Speech (TTS) voice reading with animated audio wave bars.
  - Copy to clipboard, space, undo (backspace), clear all, and translation history feed.

### 2. Reverse Translation Panel (Voice & Text → Visual Sign Flashcards)
- **Microphone Input**: Real-time Speech-to-Text conversion via the Web Speech API with radial pulsing indicator.
- **Text Input Fallback**: Quick phrase typing and prompt chips (`"Hello"`, `"Thank You"`, `"I Love You"`, `"Please Help"`, `"Water Please"`).
- **Interactive Visual Flashcards**:
  - High-contrast SVG diagrams showing realistic hand shapes, joint angles, and motion indicator arrows.
  - Word-level signs and finger-spelling (A–Z) decomposition for arbitrary words.
  - **Animated Flow Player**: Step through the signs sequentially with configurable playback speed (0.5x, 1.0x, 1.5x) and manual step controls.

### 3. Accessible Design System & Audio Feedback
- **Color Palette**: Deep Obsidian (`#05060a`, `#0d101d`) with Neon Mint (`#00f5a0`) and Electric Violet (`#8b5cf6`).
- **WCAG AAA Compliance**: High-contrast ratios (>8:1), distinct focus rings, screen reader announcements (`aria-live="polite"`).
- **High-Contrast Toggle**: Instant ultra-contrast mode for users with low vision.
- **Synthesized Sound Effects**: Web Audio API generates clean, zero-dependency audio feedback for detections, commits, deletes, and mic toggling.

---

## 🚀 Quick Start (Running Locally)

### Option 1: Double-Click Batch File (Windows)
Double-click `start.bat` in this folder. It will launch the local Python server and open your default web browser automatically.

### Option 2: Run via Terminal
```powershell
python server.py
```
Open your browser and navigate to:
```
http://localhost:8080
```
*(If port 8080 is in use, the server automatically finds the next available port).*

---

## ⌨️ Accessible Keyboard Hotkeys

| Key | Action |
| :--- | :--- |
| **`Space`** | Commit current detected sign immediately |
| **`Backspace`** | Delete / undo last committed sign |
| **`M`** | Toggle Microphone Speech Recognition |
| **`C`** | Clear accumulated sentence |
| **`P`** | Speak active sentence aloud (Text-to-Speech) |
| **`S`** | Start / Stop Webcam Feed |
| **`?`** | Open Keyboard Shortcuts Help |

---

## 🤲 Recognized ASL Gestures Dictionary

- **Hello / Open Palm / 5**: All 5 fingers extended spread, palm facing forward.
- **Peace / V / 2**: Index and middle fingers extended in a 'V' shape, other fingers curled.
- **I Love You (ASL ILY)**: Thumb, index, and pinky extended; middle and ring fingers curled.
- **OK / Perfect**: Thumb tip and index tip touching to form a circle, other 3 fingers upright.
- **Good / Thumbs Up**: Closed fist with thumb pointing vertically upward.
- **Bad / Thumbs Down**: Closed fist with thumb pointing vertically downward.
- **Yes / Fist**: Closed fist nodding (ASL 'S' handshape).
- **Pointing / You / 1**: Dominant index finger extended straight up/forward.
- **Rock On / Horns**: Index and pinky extended, middle and ring curled under thumb.
- **Call Me**: Thumb and pinky extended out wide, middle three fingers folded.
- **Water / W / 3**: Index, middle, and ring fingers spread in 'W' shape.
- **Stop / Halt**: Flat open palm facing forward with fingers held tightly together.
- **Fingerspelling (A–Z)**: Individual letter shapes for names and complex terms.

---

## 📁 Project Structure

```
d:\Aurasign-project\
├── index.html                 # Main accessible user interface
├── css\
│   └── style.css              # Obsidian & neon mint styling, animations, WCAG rules
├── js\
│   ├── app.js                 # Application orchestrator and event binder
│   ├── hand-tracker.js        # MediaPipe Hands CV integration + Canvas HUD overlay
│   ├── sign-recognizer.js     # 3D geometric gesture classification & temporal debouncer
│   ├── reverse-translator.js  # Speech-to-Text & visual sign flashcards player
│   ├── sign-database.js       # ASL dictionary, SVG diagrams & synthetic presets
│   └── audio-feedback.js      # Web Audio synthesizer & SpeechSynthesis engine
├── server.py                  # Local Python server with CORS, MIME types & auto-open
├── start.bat                  # One-click Windows startup script
└── README.md                  # Project documentation
```
