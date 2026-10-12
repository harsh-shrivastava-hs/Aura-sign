/**
 * AuraSign - Geometric Sign & Gesture Recognition Engine
 * Evaluates 21 3D hand landmarks in real time, computes finger extensions,
 * spatial orientations, joint angles, and distance metrics.
 * Incorporates temporal smoothing, confidence estimation, and hold-to-commit logic.
 */

export class SignRecognizer {
  constructor(options = {}) {
    this.holdDurationMs = options.holdDurationMs || 600; // Time needed to commit a sign
    this.cooldownDurationMs = options.cooldownDurationMs || 1000; // Cooldown before repeating same sign
    this.onSignDetected = options.onSignDetected || null;
    this.onSignProgress = options.onSignProgress || null;
    this.onSignCommitted = options.onSignCommitted || null;

    this.currentSign = null;
    this.currentConfidence = 0;
    this.holdStartTime = null;
    this.lastCommittedSign = null;
    this.lastCommittedTime = 0;
    this.historyBuffer = [];
    this.historyCapacity = 5;
  }

  reset() {
    this.currentSign = null;
    this.currentConfidence = 0;
    this.holdStartTime = null;
    this.historyBuffer = [];
  }

  /**
   * Process a set of 21 landmarks for a single hand
   * @param {Array<{x: number, y: number, z: number}>} landmarks
   * @param {string} handedness 'Left' or 'Right'
   */
  process(landmarks, handedness = 'Right') {
    if (!landmarks || landmarks.length < 21) {
      this.reset();
      return null;
    }

    // 1. Analyze finger states
    const fingerStates = this.analyzeFingers(landmarks);
    
    // 2. Identify candidate sign based on geometry
    const result = this.classifyGesture(landmarks, fingerStates, handedness);

    const now = performance.now();

    if (result && result.name) {
      // Temporal smoothing via buffer
      this.historyBuffer.push(result.name);
      if (this.historyBuffer.length > this.historyCapacity) {
        this.historyBuffer.shift();
      }

      // Check dominant sign in recent history
      const dominantSign = this.getDominantSign();

      if (dominantSign === result.name) {
        if (this.currentSign !== result.name) {
          this.currentSign = result.name;
          this.currentConfidence = result.confidence;
          this.holdStartTime = now;
        } else {
          // Boost confidence with continuity
          this.currentConfidence = Math.min(0.99, (this.currentConfidence * 0.7) + (result.confidence * 0.3));
        }

        // Notify detection
        if (this.onSignDetected) {
          this.onSignDetected({
            sign: this.currentSign,
            confidence: this.currentConfidence,
            description: result.description,
            fingerStates
          });
        }

        // Check hold-to-commit
        const elapsed = now - this.holdStartTime;
        const progress = Math.min(1.0, elapsed / this.holdDurationMs);

        if (this.onSignProgress) {
          this.onSignProgress({
            sign: this.currentSign,
            progress: progress,
            elapsed: elapsed
          });
        }

        // Commit sign if held long enough and not in immediate repeat cooldown
        const canCommit = progress >= 1.0 && (
          this.lastCommittedSign !== this.currentSign ||
          (now - this.lastCommittedTime > this.cooldownDurationMs)
        );

        if (canCommit) {
          this.lastCommittedSign = this.currentSign;
          this.lastCommittedTime = now;
          this.holdStartTime = now + 400; // brief reset delay

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
      if (this.onSignDetected) {
        this.onSignDetected(null);
      }
      if (this.onSignProgress) {
        this.onSignProgress({ sign: null, progress: 0 });
      }
    }

    return result;
  }

  getDominantSign() {
    if (this.historyBuffer.length === 0) return null;
    const counts = {};
    for (const sign of this.historyBuffer) {
      counts[sign] = (counts[sign] || 0) + 1;
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

  /**
   * Calculate distance between two 3D landmarks
   */
  dist(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const dz = (p1.z || 0) - (p2.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Determine extended / curled state of all 5 fingers
   */
  analyzeFingers(lm) {
    const wrist = lm[0];
    const middleMcp = lm[9];
    const palmSize = this.dist(wrist, middleMcp);

    // Finger tips and joints
    const thumbTip = lm[4], thumbIp = lm[3], thumbMcp = lm[2];
    const indexTip = lm[8], indexDip = lm[7], indexPip = lm[6], indexMcp = lm[5];
    const middleTip = lm[12], middleDip = lm[11], middlePip = lm[10];
    const ringTip = lm[16], ringDip = lm[15], ringPip = lm[14], ringMcp = lm[13];
    const pinkyTip = lm[20], pinkyDip = lm[19], pinkyPip = lm[18], pinkyMcp = lm[17];

    // Standard finger extension check:
    // A finger is extended if Tip is further from Wrist than PIP and DIP, and Tip is further from MCP than PIP is.
    const isIndexExtended = (this.dist(indexTip, wrist) > this.dist(indexPip, wrist) * 1.15) &&
                            (this.dist(indexTip, indexMcp) > this.dist(indexPip, indexMcp));

    const isMiddleExtended = (this.dist(middleTip, wrist) > this.dist(middlePip, wrist) * 1.15) &&
                             (this.dist(middleTip, middleMcp) > this.dist(middlePip, middleMcp));

    const isRingExtended = (this.dist(ringTip, wrist) > this.dist(ringPip, wrist) * 1.15) &&
                           (this.dist(ringTip, ringMcp) > this.dist(ringPip, ringMcp));

    const isPinkyExtended = (this.dist(pinkyTip, wrist) > this.dist(pinkyPip, wrist) * 1.15) &&
                            (this.dist(pinkyTip, pinkyMcp) > this.dist(pinkyPip, pinkyMcp));

    // Thumb extension: distance from pinky MCP and index MCP
    const thumbDistToPinky = this.dist(thumbTip, pinkyMcp);
    const thumbBaseDistToPinky = this.dist(thumbMcp, pinkyMcp);
    const isThumbExtended = (thumbDistToPinky > thumbBaseDistToPinky * 1.2) &&
                            (this.dist(thumbTip, indexMcp) > palmSize * 0.45);

    // Distance between thumb tip and index tip (for OK / pinch signs)
    const thumbIndexPinchDist = this.dist(thumbTip, indexTip) / (palmSize || 1);

    return {
      thumb: isThumbExtended,
      index: isIndexExtended,
      middle: isMiddleExtended,
      ring: isRingExtended,
      pinky: isPinkyExtended,
      thumbIndexPinchDist,
      palmSize
    };
  }

  /**
   * Geometric classification logic matching ASL signs
   */
  classifyGesture(lm, f, handedness) {
    const wrist = lm[0];
    const thumbTip = lm[4];
    const indexTip = lm[8];
    const middleTip = lm[12];
    const ringTip = lm[16];
    const pinkyTip = lm[20];
    const indexMcp = lm[5];
    const middleMcp = lm[9];

    // Count extended fingers (excluding thumb)
    const extendedCount4 = (f.index ? 1 : 0) + (f.middle ? 1 : 0) + (f.ring ? 1 : 0) + (f.pinky ? 1 : 0);
    const totalExtended = extendedCount4 + (f.thumb ? 1 : 0);

    // 1. "OK" Sign (Thumb tip and Index tip touching, 3 other fingers extended up)
    if (f.thumbIndexPinchDist < 0.28 && f.middle && f.ring && f.pinky) {
      return {
        name: "OK",
        confidence: 0.96,
        description: "Thumb & index fingertip touching, middle, ring, and pinky extended."
      };
    }

    // 2. "I LOVE YOU" (ASL ILY: Thumb, Index, Pinky extended; Middle and Ring curled)
    if (f.thumb && f.index && !f.middle && !f.ring && f.pinky) {
      return {
        name: "I LOVE YOU",
        confidence: 0.97,
        description: "Thumb, index, and pinky fingers extended; middle and ring curled."
      };
    }

    // 3. "CALL ME" (Thumb and Pinky extended; Index, Middle, Ring curled)
    if (f.thumb && !f.index && !f.middle && !f.ring && f.pinky) {
      return {
        name: "CALL ME",
        confidence: 0.95,
        description: "Thumb and pinky extended out wide, middle three fingers curled."
      };
    }

    // 4. "PEACE" / "VICTORY" / "2" (Index & Middle extended, Ring & Pinky curled)
    if (f.index && f.middle && !f.ring && !f.pinky && !f.thumb) {
      const vSeparation = this.dist(indexTip, middleTip) / f.palmSize;
      const confidence = vSeparation > 0.25 ? 0.98 : 0.88;
      return {
        name: "PEACE",
        confidence,
        description: "Index and middle fingers extended apart in a 'V' shape."
      };
    }

    // 5. "THUMBS UP" (Thumb pointing vertically up, other 4 fingers curled)
    if (extendedCount4 === 0) {
      const thumbIsUp = (thumbTip.y < lm[3].y) && (thumbTip.y < lm[2].y) && (thumbTip.y < indexMcp.y - 0.05);
      const thumbIsDown = (thumbTip.y > lm[3].y) && (thumbTip.y > lm[2].y) && (thumbTip.y > indexMcp.y + 0.05);

      if (thumbIsUp) {
        return {
          name: "GOOD",
          confidence: 0.96,
          description: "Fist closed with thumb pointing straight upward (Thumbs Up / Good)."
        };
      } else if (thumbIsDown) {
        return {
          name: "BAD",
          confidence: 0.95,
          description: "Fist closed with thumb pointing straight downward (Thumbs Down / Bad)."
        };
      } else {
        // Tight fist / "YES" (ASL letter S / nodding fist)
        return {
          name: "YES",
          confidence: 0.92,
          description: "Closed fist (ASL 'Yes' / affirm)."
        };
      }
    }

    // 6. "POINTING" / "YOU" / "1" (Index extended only, others curled)
    if (f.index && !f.middle && !f.ring && !f.pinky && !f.thumb) {
      return {
        name: "POINTING",
        confidence: 0.95,
        description: "Index finger extended forward/upward, all other fingers closed."
      };
    }

    // 7. "ROCK ON" (Index & Pinky extended; Middle, Ring, and Thumb curled)
    if (!f.thumb && f.index && !f.middle && !f.ring && f.pinky) {
      return {
        name: "ROCK ON",
        confidence: 0.93,
        description: "Index and pinky extended, middle and ring curled under thumb."
      };
    }

    // 8. "THREE" / "W" (Index, Middle, Ring extended; Pinky and Thumb curled)
    if (f.index && f.middle && f.ring && !f.pinky && !f.thumb) {
      return {
        name: "WATER",
        confidence: 0.94,
        description: "Index, middle, and ring fingers extended in 'W' shape."
      };
    }

    // 9. "HELLO" / "OPEN PALM" / "5" (All 5 fingers extended)
    if (f.thumb && f.index && f.middle && f.ring && f.pinky) {
      // Check if fingers are together (STOP) or spread (HELLO)
      const spread = (this.dist(indexTip, middleTip) + this.dist(middleTip, ringTip) + this.dist(ringTip, pinkyTip)) / f.palmSize;
      if (spread < 0.65) {
        return {
          name: "STOP",
          confidence: 0.94,
          description: "Flat open hand with fingers together, palm facing camera (Stop)."
        };
      }
      return {
        name: "HELLO",
        confidence: 0.97,
        description: "Open hand with fingers spread outward (Hello / 5)."
      };
    }

    // 10. "FOUR" (4 fingers extended, thumb folded in)
    if (!f.thumb && f.index && f.middle && f.ring && f.pinky) {
      return {
        name: "PLEASE",
        confidence: 0.91,
        description: "Four fingers extended, thumb folded across palm."
      };
    }

    return null;
  }
}
