/**
 * AuraSign - Hand Tracking & Computer Vision Overlay Engine
 * Integrates MediaPipe Hands with a high-performance Canvas 2D overlay renderer.
 * Features futuristic neon mint / electric violet visualizer, smooth interpolation,
 * FPS counter, HUD reticles, and fallback synthetic CV simulator mode.
 */

import { SYNTHETIC_GESTURE_PRESETS } from './sign-database.js';

// MediaPipe hand skeleton connections (21 joints)
const HAND_CONNECTIONS = [
  // Palm base
  [0, 1], [0, 5], [9, 13], [13, 17], [0, 17], [5, 9],
  // Thumb
  [1, 2], [2, 3], [3, 4],
  // Index
  [5, 6], [6, 7], [7, 8],
  // Middle
  [9, 10], [10, 11], [11, 12],
  // Ring
  [13, 14], [14, 15], [15, 16],
  // Pinky
  [17, 18], [18, 19], [19, 20]
];

export class HandTracker {
  constructor(options = {}) {
    this.videoElement = options.videoElement;
    this.canvasElement = options.canvasElement;
    this.ctx = this.canvasElement.getContext('2d');
    this.onResultsCallback = options.onResults || null;
    this.onFpsUpdate = options.onFpsUpdate || null;
    this.onStatusChange = options.onStatusChange || null;

    this.mediaPipeHands = null;
    this.cameraInstance = null;
    this.isCameraRunning = false;
    this.isDemoMode = false;
    this.demoPreset = 'HELLO';
    this.demoAnimId = null;

    this.mirrored = true;
    this.showSkeleton = true;
    this.showLandmarks = true;
    this.showBoundingBox = true;

    // Performance metrics
    this.frameCount = 0;
    this.lastFpsTimestamp = performance.now();
    this.currentFps = 0;

    // Smoothed landmarks for jitter-free rendering
    this.smoothedLandmarks = null;
    this.smoothingFactor = 0.55; // 0 = raw, 1 = frozen
  }

  async init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Try initializing MediaPipe Hands
    if (typeof window.Hands !== 'undefined') {
      try {
        this.mediaPipeHands = new window.Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        this.mediaPipeHands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.65,
          minTrackingConfidence: 0.65
        });

        this.mediaPipeHands.onResults((results) => this.handleMediaPipeResults(results));
        this.reportStatus('ready', 'Computer Vision Engine Ready');
        return true;
      } catch (err) {
        console.warn('MediaPipe Hands init warning:', err);
      }
    }

    this.reportStatus('ready', 'Vision engine loaded (Fallback ready)');
    return true;
  }

  resizeCanvas() {
    if (!this.canvasElement) return;
    const rect = this.canvasElement.parentElement.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      this.canvasElement.width = rect.width;
      this.canvasElement.height = rect.height;
    }
  }

  reportStatus(state, message) {
    if (this.onStatusChange) {
      this.onStatusChange({ state, message });
    }
  }

  /**
   * Start real camera feed
   */
  async startCamera(deviceId = null) {
    this.stopDemoMode();
    this.reportStatus('initializing', 'Accessing Camera Hardware...');

    try {
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
          deviceId: deviceId ? { exact: deviceId } : undefined
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.videoElement.srcObject = stream;
      await this.videoElement.play();

      this.isCameraRunning = true;
      this.resizeCanvas();
      this.reportStatus('tracking', 'Camera Online - Tracking Active');

      // Setup processing loop
      this.startProcessingLoop();
      return true;
    } catch (err) {
      console.error('Camera access failed:', err);
      let errMsg = 'Camera access was denied or not found.';
      if (err.name === 'NotAllowedError') errMsg = 'Camera permission denied. Please allow camera access in your browser.';
      else if (err.name === 'NotFoundError') errMsg = 'No webcam hardware detected.';

      this.reportStatus('error', errMsg);
      // Auto-fallback to simulator demo mode
      this.startDemoMode();
      return false;
    }
  }

  stopCamera() {
    this.isCameraRunning = false;
    if (this.videoElement && this.videoElement.srcObject) {
      const tracks = this.videoElement.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      this.videoElement.srcObject = null;
    }
    this.clearCanvas();
    this.reportStatus('stopped', 'Camera Offline');
  }

  toggleCamera() {
    if (this.isCameraRunning) {
      this.stopCamera();
    } else {
      this.startCamera();
    }
  }

  startProcessingLoop() {
    const processFrame = async () => {
      if (!this.isCameraRunning) return;

      this.updateFps();

      if (this.videoElement.readyState >= 2 && this.mediaPipeHands) {
        try {
          await this.mediaPipeHands.send({ image: this.videoElement });
        } catch (e) {
          // If wasm is still warming up, catch quietly
        }
      }

      requestAnimationFrame(processFrame);
    };

    requestAnimationFrame(processFrame);
  }

  /**
   * Handle real results from MediaPipe
   */
  handleMediaPipeResults(results) {
    if (this.isDemoMode) return;

    this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const rawLandmarks = results.multiHandLandmarks[0];
      const handedness = (results.multiHandedness && results.multiHandedness[0])
        ? results.multiHandedness[0].label
        : 'Right';

      // Landmark smoothing
      const landmarks = this.smooth(rawLandmarks);

      // Draw custom cyberpunk HUD overlay
      this.drawHandOverlay(landmarks);

      // Send to sign recognizer
      if (this.onResultsCallback) {
        this.onResultsCallback({
          landmarks,
          handedness,
          isSynthetic: false
        });
      }
    } else {
      this.smoothedLandmarks = null;
      // Draw subtle searching reticle
      this.drawSearchingHud();
      if (this.onResultsCallback) {
        this.onResultsCallback({ landmarks: null, handedness: null });
      }
    }
  }

  /**
   * Smooth raw landmarks with Exponential Moving Average (EMA)
   */
  smooth(raw) {
    if (!this.smoothedLandmarks || this.smoothedLandmarks.length !== raw.length) {
      this.smoothedLandmarks = raw.map(p => ({ ...p }));
      return this.smoothedLandmarks;
    }

    const alpha = 1.0 - this.smoothingFactor;
    for (let i = 0; i < raw.length; i++) {
      this.smoothedLandmarks[i].x = this.smoothedLandmarks[i].x * this.smoothingFactor + raw[i].x * alpha;
      this.smoothedLandmarks[i].y = this.smoothedLandmarks[i].y * this.smoothingFactor + raw[i].y * alpha;
      this.smoothedLandmarks[i].z = (this.smoothedLandmarks[i].z || 0) * this.smoothingFactor + (raw[i].z || 0) * alpha;
    }

    return this.smoothedLandmarks;
  }

  /**
   * Demo / Simulator Mode:
   * Generates live synthetic hand landmarks with lifelike swaying animation
   */
  startDemoMode(preset = 'HELLO') {
    this.stopCamera();
    this.isDemoMode = true;
    this.demoPreset = preset;
    this.reportStatus('demo', `Simulator Active: Sign '${preset}'`);

    const startTime = performance.now();

    const renderDemo = () => {
      if (!this.isDemoMode) return;
      this.updateFps();

      const time = (performance.now() - startTime) / 1000;
      const basePreset = SYNTHETIC_GESTURE_PRESETS[this.demoPreset] || SYNTHETIC_GESTURE_PRESETS['HELLO'];

      // Add gentle lifelike natural motion
      const swayX = Math.sin(time * 1.5) * 0.015;
      const swayY = Math.cos(time * 2.0) * 0.012;
      const fingerTwitch = Math.sin(time * 4) * 0.005;

      const animatedLandmarks = basePreset.map((pt, idx) => ({
        x: pt.x + swayX + (idx > 4 ? fingerTwitch : 0),
        y: pt.y + swayY + (idx % 4 === 0 ? fingerTwitch : 0),
        z: pt.z || 0
      }));

      // Render on canvas
      this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
      
      // Draw simulated camera backdrop if real video is offline
      this.drawSimulatedBackground();

      // Render futuristic hand overlay
      this.drawHandOverlay(animatedLandmarks);

      // Pass to recognizer
      if (this.onResultsCallback) {
        this.onResultsCallback({
          landmarks: animatedLandmarks,
          handedness: 'Right',
          isSynthetic: true
        });
      }

      this.demoAnimId = requestAnimationFrame(renderDemo);
    };

    if (this.demoAnimId) cancelAnimationFrame(this.demoAnimId);
    this.demoAnimId = requestAnimationFrame(renderDemo);
  }

  setDemoPreset(presetName) {
    if (SYNTHETIC_GESTURE_PRESETS[presetName]) {
      this.demoPreset = presetName;
      this.reportStatus('demo', `Simulator Active: Sign '${presetName}'`);
    }
  }

  stopDemoMode() {
    this.isDemoMode = false;
    if (this.demoAnimId) {
      cancelAnimationFrame(this.demoAnimId);
      this.demoAnimId = null;
    }
    this.clearCanvas();
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
  }

  /**
   * Draw high-contrast futuristic hand skeleton and tracking nodes
   */
  drawHandOverlay(landmarks) {
    const w = this.canvasElement.width;
    const h = this.canvasElement.height;

    // Map normalized coordinates to canvas space (with optional mirror flip)
    const points = landmarks.map(lm => ({
      x: this.mirrored ? (1 - lm.x) * w : lm.x * w,
      y: lm.y * h,
      z: lm.z || 0
    }));

    // 1. Draw Skeleton Bones
    if (this.showSkeleton) {
      this.ctx.save();
      this.ctx.lineWidth = 3.5;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';

      // Outer glow for cyberpunk neon effect
      this.ctx.shadowBlur = 12;
      this.ctx.shadowColor = '#00f5a0';

      for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
        const p1 = points[startIdx];
        const p2 = points[endIdx];

        // Gradient bone connection from electric violet to neon mint
        const grad = this.ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
        grad.addColorStop(0, '#8b5cf6');
        grad.addColorStop(1, '#00f5a0');

        this.ctx.strokeStyle = grad;
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.stroke();
      }
      this.ctx.restore();
    }

    // 2. Draw Landmark Joint Nodes
    if (this.showLandmarks) {
      this.ctx.save();

      points.forEach((pt, idx) => {
        const isFingertip = [4, 8, 12, 16, 20].includes(idx);
        const isWrist = idx === 0;

        const radius = isFingertip ? 6 : (isWrist ? 7 : 4);

        // Outer glow
        this.ctx.shadowBlur = isFingertip ? 15 : 8;
        this.ctx.shadowColor = isFingertip ? '#00f5a0' : '#8b5cf6';

        // Outer circle
        this.ctx.beginPath();
        this.ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = isFingertip ? '#00f5a0' : '#8b5cf6';
        this.ctx.fill();

        // Inner glowing core
        this.ctx.beginPath();
        this.ctx.arc(pt.x, pt.y, radius * 0.45, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fill();
      });

      this.ctx.restore();
    }

    // 3. Draw Bounding Box & Palm Target HUD
    if (this.showBoundingBox) {
      this.drawBoundingBoxAndHUD(points);
    }
  }

  drawBoundingBoxAndHUD(points) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    points.forEach(p => {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    });

    const padding = 24;
    minX = Math.max(8, minX - padding);
    minY = Math.max(8, minY - padding);
    maxX = Math.min(this.canvasElement.width - 8, maxX + padding);
    maxY = Math.min(this.canvasElement.height - 8, maxY + padding);

    const cornerSize = 16;
    this.ctx.save();
    this.ctx.strokeStyle = '#00f5a0';
    this.ctx.lineWidth = 2;
    this.ctx.shadowBlur = 8;
    this.ctx.shadowColor = '#00f5a0';

    // Corner bracket markers for futuristic target look
    // Top-Left
    this.ctx.beginPath();
    this.ctx.moveTo(minX, minY + cornerSize);
    this.ctx.lineTo(minX, minY);
    this.ctx.lineTo(minX + cornerSize, minY);
    this.ctx.stroke();

    // Top-Right
    this.ctx.beginPath();
    this.ctx.moveTo(maxX - cornerSize, minY);
    this.ctx.lineTo(maxX, minY);
    this.ctx.lineTo(maxX, minY + cornerSize);
    this.ctx.stroke();

    // Bottom-Left
    this.ctx.beginPath();
    this.ctx.moveTo(minX, maxY - cornerSize);
    this.ctx.lineTo(minX, maxY);
    this.ctx.lineTo(minX + cornerSize, maxY);
    this.ctx.stroke();

    // Bottom-Right
    this.ctx.beginPath();
    this.ctx.moveTo(maxX - cornerSize, maxY);
    this.ctx.lineTo(maxX, maxY);
    this.ctx.lineTo(maxX, maxY - cornerSize);
    this.ctx.stroke();

    // Palm center reticle
    const palmX = (points[0].x + points[9].x) / 2;
    const palmY = (points[0].y + points[9].y) / 2;
    this.ctx.strokeStyle = 'rgba(139, 92, 246, 0.6)';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.arc(palmX, palmY, 14, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.restore();
  }

  drawSearchingHud() {
    const w = this.canvasElement.width;
    const h = this.canvasElement.height;

    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(139, 92, 246, 0.25)';
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([6, 6]);

    // Centered crosshair
    const cx = w / 2;
    const cy = h / 2;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 60, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.setLineDash([]);
    this.ctx.restore();
  }

  drawSimulatedBackground() {
    const w = this.canvasElement.width;
    const h = this.canvasElement.height;

    this.ctx.save();
    // Deep obsidian ambient grid
    this.ctx.fillStyle = '#0a0c14';
    this.ctx.fillRect(0, 0, w, h);

    // Subtle holographic grid lines
    this.ctx.strokeStyle = 'rgba(139, 92, 246, 0.08)';
    this.ctx.lineWidth = 1;
    const step = 40;
    for (let x = 0; x < w; x += step) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, h);
      this.ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(w, y);
      this.ctx.stroke();
    }

    // Watermark tag
    this.ctx.fillStyle = 'rgba(0, 245, 160, 0.4)';
    this.ctx.font = '11px monospace';
    this.ctx.fillText('SYNTHETIC DEMO SIMULATION', 18, h - 20);

    this.ctx.restore();
  }

  updateFps() {
    this.frameCount++;
    const now = performance.now();
    const elapsed = now - this.lastFpsTimestamp;
    if (elapsed >= 500) {
      this.currentFps = Math.round((this.frameCount * 1000) / elapsed);
      this.frameCount = 0;
      this.lastFpsTimestamp = now;

      if (this.onFpsUpdate) {
        this.onFpsUpdate(this.currentFps);
      }
    }
  }

  setMirror(enabled) {
    this.mirrored = enabled;
  }
}
