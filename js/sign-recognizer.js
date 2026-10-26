/**
 * AuraSign - Advanced 3D Biomechanical Sign & Gesture Recognition Engine
 * Evaluates 21 3D hand landmarks in real time using joint flexion angles,
 * 3D vector dot products, scale-invariant bone length ratios, and palm coordinate frames.
 * Features hysteresis debouncing, temporal smoothing, and per-finger telemetry.
 */

export class SignRecognizer {
  constructor(options = {}) {
    this.holdDurationMs = options.holdDurationMs || 600;
    this.cooldownDurationMs = options.cooldownDurationMs || 1000;
    this.onSignDetected = options.onSignDetected || null;
    this.onSignProgress = options.onSignProgress || null;
    this.onSignCommitted = options.onSignCommitted || null;
    this.onFingerTelemetry = options.onFingerTelemetry || null;

    this.currentSign = null;
    this.currentConfidence = 0;
    this.holdStartTime = null;
    this.lastCommittedSign = null;
    this.lastCommittedTime = 0;

    // Hysteresis & temporal smoothing
    this.historyBuffer = [];
    this.historyCapacity = 7;
    this.candidateSign = null;
    this.candidateFrames = 0;
    this.requiredCandidateFrames = 3; // Must be stable for 3 frames before switching
  }

  reset() {
    this.currentSign = null;
    this.currentConfidence = 0;
    this.holdStartTime = null;
    this.historyBuffer = [];
    this.candidateSign = null;
    this.candidateFrames = 0;
  }

  /**
   * Process 21 hand landmarks
   * @param {Array<{x: number, y: number, z: number}>} landmarks
   * @param {string} handedness 'Left' or 'Right'
   */
  process(landmarks, handedness = 'Right') {
    if (!landmarks || landmarks.length < 21) {
      this.reset();
      if (this.onSignDetected) this.onSignDetected(null);
      if (this.onSignProgress) this.onSignProgress({ sign: null, progress: 0 });
      if (this.onFingerTelemetry) this.onFingerTelemetry(null);
      return null;
    }

    // 1. Comprehensive 3D Biomechanical Joint Flexion Analysis
    const telemetry = this.analyzeHandBiomechanics(landmarks, handedness);

    // Broadcast finger telemetry for UI HUD
    if (this.onFingerTelemetry) {
      this.onFingerTelemetry(telemetry);
    }

    // 2. Classify candidate gesture using 3D spatial geometry
    const result = this.classifyGesture(landmarks, telemetry, handedness);
    const now = performance.now();

    if (result && result.name) {
      // Hysteresis filter: candidate must be steady before switching
      if (result.name === this.candidateSign) {
        this.candidateFrames++;
      } else {
        this.candidateSign = result.name;
        this.candidateFrames = 1;
      }

      this.historyBuffer.push(result.name);
      if (this.historyBuffer.length > this.historyCapacity) {
        this.historyBuffer.shift();
      }

      const dominantSign = this.getDominantSign();

      // Only switch sign if candidate is sufficiently stable
      if (this.candidateFrames >= this.requiredCandidateFrames && dominantSign === result.name) {
        if (this.currentSign !== result.name) {
          this.currentSign = result.name;
          this.currentConfidence = result.confidence;
          this.holdStartTime = now;
        } else {
          // Exponential smoothing of confidence
          this.currentConfidence = (this.currentConfidence * 0.65) + (result.confidence * 0.35);
        }

        // Notify active detection
        if (this.onSignDetected) {
          this.onSignDetected({
            sign: this.currentSign,
            confidence: Math.min(0.99, Math.max(0.60, this.currentConfidence)),
            description: result.description,
            telemetry
          });
        }

        // Check hold-to-commit duration
        const elapsed = now - this.holdStartTime;
        const progress = Math.min(1.0, elapsed / this.holdDurationMs);

        if (this.onSignProgress) {
          this.onSignProgress({
            sign: this.currentSign,
            progress: progress,
            elapsed: elapsed
          });
        }

        const canCommit = progress >= 1.0 && (
          this.lastCommittedSign !== this.currentSign ||
          (now - this.lastCommittedTime > this.cooldownDurationMs)
        );

        if (canCommit) {
          this.lastCommittedSign = this.currentSign;
          this.lastCommittedTime = now;
          this.holdStartTime = now + 350; // Brief cooldown pause

          if (this.onSignCommitted) {
            this.onSignCommitted({
              sign: this.currentSign,
              confidence: this.currentConfidence
            });
          }
        }
      }
    } else {
      this.reset();
      if (this.onSignDetected) this.onSignDetected(null);
      if (this.onSignProgress) this.onSignProgress({ sign: null, progress: 0 });
    }

    return result;
  }

  getDominantSign() {
    if (this.historyBuffer.length === 0) return null;
    const counts = {};
    for (const s of this.historyBuffer) {
      counts[s] = (counts[s] || 0) + 1;
    }
    let maxSign = null;
    let maxCount = 0;
    for (const [sign, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        maxSign = sign;
      }
    }
    return (maxCount >= Math.ceil(this.historyBuffer.length / 2)) ? maxSign : null;
  }

  // Vector helper functions
  dist(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const dz = (p1.z || 0) - (p2.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  vec(p1, p2) {
    return {
      x: p2.x - p1.x,
      y: p2.y - p1.y,
      z: (p2.z || 0) - (p1.z || 0)
    };
  }

  dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  }

  norm(v) {
    return Math.sqrt(this.dot(v, v)) || 1e-6;
  }

  normalize(v) {
    const n = this.norm(v);
    return { x: v.x / n, y: v.y / n, z: v.z / n };
  }

  angleBetween(v1, v2) {
    const cosine = this.dot(v1, v2) / (this.norm(v1) * this.norm(v2));
    const clamped = Math.max(-1, Math.min(1, cosine));
    return (Math.acos(clamped) * 180) / Math.PI; // in degrees
  }

  /**
   * 3D Biomechanical Analysis of the Hand
   * Computes joint flexion angles, finger length ratios, thumb abduction,
   * palm orientation normal, and finger-to-finger separations.
   */
  analyzeHandBiomechanics(lm, handedness) {
    const wrist = lm[0];
    const indexMcp = lm[5];
    const middleMcp = lm[9];
    const ringMcp = lm[13];
    const pinkyMcp = lm[17];

    const palmSize = this.dist(wrist, middleMcp);

    // Palm Up vector (wrist to middle MCP)
    const palmUp = this.normalize(this.vec(wrist, middleMcp));

    // Palm Normal vector (cross product of wrist->index and wrist->pinky)
    const vIndex = this.vec(wrist, indexMcp);
    const vPinky = this.vec(wrist, pinkyMcp);
    const crossX = vIndex.y * vPinky.z - vIndex.z * vPinky.y;
    const crossY = vIndex.z * vPinky.x - vIndex.x * vPinky.z;
    const crossZ = vIndex.x * vPinky.y - vIndex.y * vPinky.x;
    const palmNormal = this.normalize({ x: crossX, y: crossY, z: crossZ });

    // Analyze individual fingers: Index(5-8), Middle(9-12), Ring(13-16), Pinky(17-20)
    const analyzeFinger = (mcpIdx, pipIdx, dipIdx, tipIdx, name) => {
      const mcp = lm[mcpIdx];
      const pip = lm[pipIdx];
      const dip = lm[dipIdx];
      const tip = lm[tipIdx];

      const v1 = this.vec(mcp, pip);
      const v2 = this.vec(pip, dip);
      const v3 = this.vec(dip, tip);

      const pipAngle = this.angleBetween(v1, v2);
      const dipAngle = this.angleBetween(v2, v3);
      const totalFlexion = pipAngle + dipAngle;

      const totalSegmentLen = this.dist(mcp, pip) + this.dist(pip, dip) + this.dist(dip, tip);
      const mcpToTipDist = this.dist(mcp, tip);
      const extensionRatio = mcpToTipDist / (totalSegmentLen || 1);

      // A finger is extended when its extension ratio is high and total flexion is low
      const isExtended = extensionRatio > 0.72 && totalFlexion < 68;
      const isCurled = extensionRatio < 0.58 || totalFlexion > 88;

      return {
        name,
        extended: isExtended,
        curled: isCurled,
        flexion: Math.round(totalFlexion),
        extensionRatio: Math.min(1.0, extensionRatio),
        tip
      };
    };

    const index = analyzeFinger(5, 6, 7, 8, 'Index');
    const middle = analyzeFinger(9, 10, 11, 12, 'Middle');
    const ring = analyzeFinger(13, 14, 15, 16, 'Ring');
    const pinky = analyzeFinger(17, 18, 19, 20, 'Pinky');

    // Thumb Biomechanics: CMC(1), MCP(2), IP(3), TIP(4)
    const thumbCmc = lm[1], thumbMcp = lm[2], thumbIp = lm[3], thumbTip = lm[4];
    const thumbV1 = this.vec(thumbCmc, thumbMcp);
    const thumbV2 = this.vec(thumbMcp, thumbIp);
    const thumbV3 = this.vec(thumbIp, thumbTip);

    const thumbIpAngle = this.angleBetween(thumbV2, thumbV3);
    const thumbMcpAngle = this.angleBetween(thumbV1, thumbV2);
    const thumbTotalFlexion = thumbIpAngle + thumbMcpAngle;

    // Thumb abduction: angle relative to index MCP vector
    const thumbDir = this.normalize(this.vec(thumbMcp, thumbTip));
    const thumbAbductionAngle = this.angleBetween(thumbDir, palmUp);

    // Alignment with Palm Up vector (used for Thumbs Up / Down)
    const thumbDotPalmUp = this.dot(thumbDir, palmUp);

    // Distance to index and pinky MCP
    const thumbDistToIndexMcp = this.dist(thumbTip, indexMcp) / (palmSize || 1);
    const thumbDistToPinkyMcp = this.dist(thumbTip, pinkyMcp) / (palmSize || 1);

    // Thumb extended vs curled
    const isThumbExtended = thumbDistToIndexMcp > 0.42 && thumbTotalFlexion < 70;
    const isThumbCurled = thumbDistToIndexMcp < 0.32 || thumbTotalFlexion > 75;

    // Distance between thumb tip and index tip (for OK / pinch signs)
    const pinchDist = this.dist(thumbTip, index.tip) / (palmSize || 1);

    // Finger separation / spread (distance between adjacent tips)
    const indexMiddleSep = this.dist(index.tip, middle.tip) / (palmSize || 1);
    const middleRingSep = this.dist(middle.tip, ring.tip) / (palmSize || 1);
    const ringPinkySep = this.dist(ring.tip, pinky.tip) / (palmSize || 1);
    const totalSpread = indexMiddleSep + middleRingSep + ringPinkySep;

    return {
      thumb: {
        extended: isThumbExtended,
        curled: isThumbCurled,
        flexion: Math.round(thumbTotalFlexion),
        abductionAngle: Math.round(thumbAbductionAngle),
        dotPalmUp: thumbDotPalmUp,
        tip: thumbTip,
        distToIndexMcp: thumbDistToIndexMcp
      },
      index,
      middle,
      ring,
      pinky,
      pinchDist,
      palmSize,
      palmUp,
      palmNormal,
      spread: {
        indexMiddle: indexMiddleSep,
        middleRing: middleRingSep,
        ringPinky: ringPinkySep,
        total: totalSpread
      }
    };
  }

  /**
   * High-Precision ASL Gesture Classifier with Dynamic Confidence Scoring
   */
  classifyGesture(lm, t, handedness) {
    const f = {
      thumb: t.thumb.extended,
      index: t.index.extended,
      middle: t.middle.extended,
      ring: t.ring.extended,
      pinky: t.pinky.extended
    };

    const c = {
      thumb: t.thumb.curled,
      index: t.index.curled,
      middle: t.middle.curled,
      ring: t.ring.curled,
      pinky: t.pinky.curled
    };

    const extendedCount4 = (f.index ? 1 : 0) + (f.middle ? 1 : 0) + (f.ring ? 1 : 0) + (f.pinky ? 1 : 0);

    // 1. "OK / PERFECT" SIGN
    // Criteria: Thumb tip touches Index tip (pinch < 0.22), Middle, Ring, Pinky extended
    if (t.pinchDist < 0.22 && f.middle && f.ring && f.pinky) {
      const matchScore = 0.90 + Math.max(0, 0.08 * (1 - t.pinchDist / 0.22));
      return {
        name: "OK",
        confidence: matchScore,
        description: "Thumb & index fingertip forming an 'O' circle, 3 other fingers extended upright."
      };
    }

    // 2. "I LOVE YOU" (ASL ILY)
    // Criteria: Thumb extended out wide, Index extended, Middle curled, Ring curled, Pinky extended
    if (f.thumb && f.index && c.middle && c.ring && f.pinky && t.thumb.distToIndexMcp > 0.40) {
      const matchScore = 0.94 + (t.thumb.distToIndexMcp > 0.55 ? 0.04 : 0.01);
      return {
        name: "I LOVE YOU",
        confidence: matchScore,
        description: "Thumb, index, and pinky fingers extended; middle and ring folded into palm."
      };
    }

    // 3. "ROCK ON / HORNS"
    // Criteria: Index and Pinky extended, Middle and Ring curled, Thumb folded across middle/ring
    if (f.index && f.pinky && c.middle && c.ring && !f.thumb && t.thumb.distToIndexMcp < 0.40) {
      return {
        name: "ROCK ON",
        confidence: 0.94,
        description: "Index and pinky fingers extended, middle and ring curled under thumb."
      };
    }

    // 4. "CALL ME / HANG LOOSE"
    // Criteria: Thumb and Pinky extended out wide, Index, Middle, Ring curled
    if (f.thumb && c.index && c.middle && c.ring && f.pinky) {
      return {
        name: "CALL ME",
        confidence: 0.95,
        description: "Thumb and pinky extended out wide, middle three fingers folded."
      };
    }

    // 5. "PEACE / VICTORY / 2"
    // Criteria: Index and Middle extended, Ring and Pinky curled, V-spread separation between index & middle
    if (f.index && f.middle && c.ring && c.pinky && !f.thumb) {
      const isVShape = t.spread.indexMiddle > 0.20;
      const confidence = isVShape ? 0.97 : 0.90;
      return {
        name: "PEACE",
        confidence,
        description: "Index and middle fingers extended apart in a distinct 'V' shape."
      };
    }

    // 6. "POINTING / YOU / 1"
    // Criteria: Index extended straight, Middle, Ring, Pinky curled, Thumb curled
    if (f.index && c.middle && c.ring && c.pinky && !f.thumb) {
      return {
        name: "POINTING",
        confidence: 0.96,
        description: "Dominant index finger extended straight forward/upward, all others curled."
      };
    }

    // 7. "WATER / W / 3"
    // Criteria: Index, Middle, Ring extended in 'W' shape, Pinky and Thumb curled
    if (f.index && f.middle && f.ring && c.pinky && !f.thumb) {
      return {
        name: "WATER",
        confidence: 0.94,
        description: "Index, middle, and ring fingers extended upward in 'W' formation."
      };
    }

    // 8. "THUMBS UP / GOOD", "THUMBS DOWN / BAD", and "YES / FIST"
    // Criteria: 4 fingers (index, middle, ring, pinky) are curled tightly
    if (c.index && c.middle && c.ring && c.pinky) {
      // Check Thumb direction relative to palm up vector
      const thumbUpAlignment = t.thumb.dotPalmUp;

      // In MediaPipe, wrist is at 0, middle MCP at 9. If thumb is pointing along palmUp:
      if (t.thumb.extended && thumbUpAlignment > 0.45 && t.thumb.distToIndexMcp > 0.38) {
        return {
          name: "GOOD",
          confidence: 0.97,
          description: "Fist closed with thumb pointing straight upward (Thumbs Up / Good)."
        };
      } else if (t.thumb.extended && thumbUpAlignment < -0.40 && t.thumb.distToIndexMcp > 0.35) {
        return {
          name: "BAD",
          confidence: 0.95,
          description: "Fist closed with thumb pointing downward (Thumbs Down / Bad)."
        };
      } else {
        // Tight closed fist (ASL 'S' / Yes)
        return {
          name: "YES",
          confidence: 0.93,
          description: "Solid closed fist (ASL 'Yes' / affirm)."
        };
      }
    }

    // 9. "HELLO / OPEN PALM" vs "STOP / HALT"
    // Criteria: All 5 fingers extended
    if (f.thumb && f.index && f.middle && f.ring && f.pinky) {
      if (t.spread.total < 0.48) {
        return {
          name: "STOP",
          confidence: 0.95,
          description: "Flat open hand with fingers held tightly together, palm facing front (Stop)."
        };
      }
      return {
        name: "HELLO",
        confidence: 0.98,
        description: "Open hand with fingers spread comfortably outward (Hello / 5)."
      };
    }

    // 10. "PLEASE / 4"
    // Criteria: 4 fingers extended, thumb folded across palm
    if (!f.thumb && f.index && f.middle && f.ring && f.pinky) {
      return {
        name: "PLEASE",
        confidence: 0.93,
        description: "Four fingers extended upright together, thumb folded across palm."
      };
    }

    return null;
  }
}
