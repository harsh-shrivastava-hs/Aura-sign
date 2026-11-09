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
│   ├── audio-feedback.js      # Web Audio synthesizer & Text-to-Speech engine
│   └── paypal.js              # PayPal Sandbox frontend manager (SDK loading & state)
├── server.py                  # Local Python server with CORS, MIME types, & PayPal routing
├── paypal_backend.py          # PayPal OAuth2, order creation & capture verification
├── .env                       # Local secrets (PAYPAL_CLIENT_ID, SECRET, ENABLE_PAYPAL)
├── .env.example               # Template environment configuration
├── start.bat                  # One-click Windows startup script
└── README.md                  # Project documentation
```

---

## 💳 PayPal Sandbox Integration ("Support AuraSign")

AuraSign includes an optional **Support AuraSign** module using the **PayPal Developer Platform (Sandbox)**. This satisfies hackathon technology requirements while ensuring the core sign language translator remains **100% free, unblocked, and functional** independently of PayPal.

### 1. How It Works
- **Zero Frontend Secrets**: Only the public Client ID is shared with the frontend. The `PAYPAL_CLIENT_SECRET` is kept strictly on the Python backend.
- **Backend Order Creation & Capture**: Orders are created via PayPal Orders v2 API with server-side validation. Approval is confirmed and captured on the backend with payment verification and duplicate capture prevention.
- **Dynamic SDK Loading**: The PayPal JS SDK is only fetched if PayPal is enabled.

### 2. Obtaining PayPal Sandbox Credentials
1. Go to the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/).
2. Log in with your PayPal developer credentials.
3. Under **Apps & Credentials**, select the **Sandbox** tab.
4. Click **Create App**, give it a name (e.g. `AuraSign-Sandbox`), and click **Create App**.
5. Copy your **Client ID** and **Secret Key**.
6. Under **Testing Tools > Sandbox Accounts**, note your auto-generated **Sandbox Personal Account** (buyer) and **Sandbox Business Account** (merchant).

### 3. Environment Variable Configuration
Copy `.env.example` to `.env`:
```powershell
copy .env.example .env
```
Configure your credentials in `.env`:
```env
PAYPAL_CLIENT_ID=YOUR_SANDBOX_CLIENT_ID
PAYPAL_CLIENT_SECRET=YOUR_SANDBOX_CLIENT_SECRET
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
ENABLE_PAYPAL=true
```

### 4. Running the Application
```powershell
python server.py
```
Or double-click `start.bat`.

### 5. Testing PayPal Sandbox Payments
1. Open `http://localhost:8080`.
2. Scroll to the **Support AuraSign** section (or click **Support** in the top navigation).
3. Select an amount (e.g., `$5.00`) or input a custom amount ($1.00 – $500.00).
4. Click the yellow **PayPal Checkout** button.
5. In the PayPal Sandbox popup window, log in with your **Sandbox Personal Account** credentials.
6. Click **Complete Purchase** / **Pay Now**.
7. Observe the server-side verification: the UI updates to show **Thank You For Supporting AuraSign!** with the verified Order ID, Capture ID, and amount.
8. Core translation, Academy, and speech recognition features continue to operate normally throughout.

### 6. How to Disable PayPal
To completely disable PayPal without modifying code, set:
```env
ENABLE_PAYPAL=false
```
When disabled:
- The Support AuraSign section and header button remain completely hidden.
- The PayPal JavaScript SDK is **never loaded**.
- PayPal backend endpoints return HTTP 403 / disabled.
- The terminal indicates `• PayPal Support: DISABLED`.
- Every core feature of AuraSign continues to function with zero console errors.

### 7. How to Completely Remove PayPal Integration (Post-Hackathon)
Because PayPal integration is strictly isolated in dedicated modules, removal is trivial:
1. **Delete backend service**: Delete `paypal_backend.py`.
2. **Delete frontend module**: Delete `js/paypal.js`.
3. **Clean up `server.py`**: Remove the `try...from paypal_backend` block and the `/api/paypal` routing conditions (or leave `server.py` as is, since its import fallback prevents crashes).
4. **Clean up `index.html`**: Delete the `<section id="support-aurasign-section">` block, the `#btn-header-support` button, and the `<script type="module" src="js/paypal.js"></script>` tag.
5. **Delete `.env` PayPal keys**: Remove `PAYPAL_*` and `ENABLE_PAYPAL` from `.env`.
