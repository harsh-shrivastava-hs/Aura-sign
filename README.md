# AuraSign (Neural Sign Language Translator & Interactive Gesture Academy)

**AuraSign** is a real-time, web-based sign language translation and accessibility platform built with modern HTML5, Tailwind CSS, JavaScript (ES6 Modules), and Computer Vision.

Featuring a high-contrast obsidian & neon mint cybernetic aesthetic, AuraSign enables seamless bidirectional communication between Deaf/Hard-of-Hearing individuals and non-signing speakers, complete with an **Interactive Gesture Academy** for learning signs with real-time AI biomechanical coaching.

---

## 🌟 What's New in v2.5

### 1. 🎓 Interactive Gesture Academy & Real-Time Tutorial
- **Step-by-Step Curriculum**: Lessons spanning Beginner to Advanced ("Hello", "Good", "Peace", "I Love You", "OK", "Yes", "Call Me", "Water").
- **Ghost Hand Holographic Stencil**: Renders an ethereal glowing target silhouette directly onto the video canvas behind your hand so you can align your joints with millimeter precision.
- **Real-Time Biomechanical Coaching**: Live actionable tips that diagnose your hand posture on the fly (*"Curl your middle finger inward"*, *"Extend thumb out wide"*, *"Spread fingers into a 'V'"*).
- **Milestone Celebrations**: Harmonic completion chimes and celebratory particle confetti as you master each gesture.

### 2. ⚡ High-Precision 3D Biomechanical Flexion Angle Engine
- **3D Joint Angle Trigonometry**: Calculates true PIP and DIP joint flexion angles ($\theta_{PIP} + \theta_{DIP}$) and bone length ratios rather than fragile 2D Euclidean distances.
- **Palm Coordinate Reference Frame**: Computes Palm Up and Palm Normal vectors, making gestures invariant to hand tilt, scale, distance from camera, and rotation.
- **Hysteresis Filtering**: Multi-frame stabilization buffer eliminates jitter and spurious sign switches.
- **Live 5-Finger Telemetry HUD**: Interactive biometric dashboard showing live joint angles and extension states for the Thumb, Index, Middle, Ring, and Pinky fingers in real time.

### 3. 🎨 Modernized Landing Page UI/UX
- **Interactive Mode Switcher**: Seamlessly switch between `[ Live Translator ]`, `[ 🎓 Gesture Academy ]`, and `[ ⚡ Reverse Translation ]`.
- **Feature Status Strip**: Telemetry pills highlighting on-device neural processing, zero-latency inference, and accessibility.
- **Target Stencil & Alignment Guide Toggles**: Dedicated controls to toggle ghost templates, hand placement silhouettes, and skeletons.
- **Polished Glassmorphism & High-Contrast Accents**: Deep obsidian (`#05060a`, `#0d101d`) with vibrant neon mint (`#00f5a0`) and electric violet (`#8b5cf6`).

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
| **`T`** | Switch to Gesture Academy / Tutorial Mode |
| **`?`** | Open Keyboard Shortcuts Help |

---

## 🤲 Recognized ASL Gestures Dictionary

- **Hello / Open Palm / 5**: All 5 fingers extended spread, palm facing forward.
- **Good / Thumbs Up**: Closed fist with thumb pointing vertically upward.
- **Bad / Thumbs Down**: Closed fist with thumb pointing downward.
- **Peace / V / 2**: Index and middle fingers extended in a 'V' shape, other fingers curled.
- **I Love You (ASL ILY)**: Thumb, index, and pinky extended; middle and ring folded into palm.
- **OK / Perfect**: Thumb tip and index tip touching to form a circle, other 3 fingers upright.
- **Yes / Fist**: Closed fist (ASL 'S' handshape).
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
├── index.html                 # Main interface with mode switcher, HUD & Academy
├── css\
│   └── style.css              # Obsidian & neon styling, animations, WCAG rules
├── js\
│   ├── app.js                 # Application orchestrator, mode switcher & telemetry
│   ├── hand-tracker.js        # MediaPipe Hands CV, ghost stencil & canvas HUD
│   ├── sign-recognizer.js     # 3D biomechanical joint flexion classifier & telemetry
│   ├── gesture-tutorial.js    # Interactive Gesture Academy, AI coaching & lessons
│   ├── reverse-translator.js  # Speech-to-Text & visual sign flashcards player
│   ├── sign-database.js       # ASL dictionary, SVG diagrams & synthetic presets
│   └── audio-feedback.js      # Web Audio synthesizer & Text-to-Speech engine
├── server.py                  # Local Python server with CORS, MIME types & auto-open
├── start.bat                  # One-click Windows startup script
└── README.md                  # Project documentation
```
