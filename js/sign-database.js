/**
 * AuraSign - Sign Language Database & Visual Flashcard Assets
 * Contains hand landmark templates, ASL sign definitions, motion descriptions,
 * and high-contrast SVG hand illustrations for real-time recognition & reverse translation.
 */

export const SIGN_DICTIONARY = {
  // Common conversational words
  "HELLO": {
    word: "Hello",
    category: "Greetings",
    description: "Open dominant hand with fingers together, thumb tucked in, starting near forehead/temple and moving outward like a polite salute.",
    tips: "Keep your palm facing forward and sweep gently outward.",
    motion: "Outward wave / salute from temple",
    svg: `<svg viewBox="0 0 120 120" class="w-full h-full" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M45 95 L45 75 L38 52 C37 48 40 45 44 46 C47 47 48 49 49 53 L54 70" stroke="#8b5cf6" />
      <path d="M54 70 L54 38 C54 34 58 33 60 36 C61 38 61 41 61 46 L61 70" stroke="#00f5a0" />
      <path d="M61 70 L62 34 C63 30 67 30 69 33 C70 35 70 39 69 46 L68 70" stroke="#00f5a0" />
      <path d="M68 70 L70 42 C71 38 75 38 77 41 C78 43 77 48 76 56 L74 72" stroke="#00f5a0" />
      <path d="M74 72 L77 52 C78 48 82 49 83 53 C84 57 82 63 80 72 L76 86 C72 94 65 98 56 98 L48 97" stroke="#8b5cf6" />
      <circle cx="58" cy="36" r="3" fill="#00f5a0" />
      <circle cx="66" cy="34" r="3" fill="#00f5a0" />
      <circle cx="74" cy="42" r="3" fill="#00f5a0" />
      <path d="M86 35 C95 38 102 48 100 60" stroke="#00f5a0" stroke-width="2" stroke-dasharray="3 3" />
      <path d="M96 64 L101 60 L104 66" fill="#00f5a0" stroke="none" />
    </svg>`
  },

  "THANK YOU": {
    word: "Thank You",
    category: "Politeness",
    description: "Touch flat fingertips of dominant hand to lips or chin, then extend the hand forward toward the person you are thanking.",
    tips: "Smile and make eye contact; the hand moves forward and slightly downward.",
    motion: "From chin moving forward to person",
    svg: `<svg viewBox="0 0 120 120" class="w-full h-full" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M40 85 C40 70 45 60 55 58 L55 35 C55 31 59 30 62 33 L62 55" stroke="#00f5a0" />
      <path d="M62 55 L63 28 C64 24 68 24 70 27 L70 56" stroke="#00f5a0" />
      <path d="M70 56 L72 32 C73 28 77 29 78 33 L77 58" stroke="#00f5a0" />
      <path d="M77 58 L80 40 C81 37 84 38 85 42 L84 65 C82 78 74 88 60 90 Z" stroke="#8b5cf6" />
      <path d="M28 45 C32 40 40 40 46 44" stroke="#a855f7" stroke-width="2" />
      <path d="M50 48 L46 44 L48 40" fill="#a855f7" stroke="none" />
      <path d="M62 102 L62 114 M56 108 L62 114 L68 108" stroke="#00f5a0" stroke-width="2" />
    </svg>`
  },

  "YES": {
    word: "Yes",
    category: "Responses",
    description: "Make a fist with your dominant hand (ASL letter 'S' shape) and nod it forward and back at the wrist, mimicking a nodding head.",
    tips: "Nod the fist twice smoothly to affirm.",
    motion: "Fist nodding up and down like a head",
    svg: `<svg viewBox="0 0 120 120" class="w-full h-full" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="42" y="44" width="36" height="42" rx="10" stroke="#00f5a0" fill="#121424" fill-opacity="0.6" />
      <path d="M42 56 C42 50 46 44 54 44 C60 44 64 48 64 54" stroke="#8b5cf6" />
      <path d="M50 44 L50 68" stroke="#00f5a0" />
      <path d="M58 44 L58 68" stroke="#00f5a0" />
      <path d="M66 46 L66 68" stroke="#00f5a0" />
      <path d="M36 62 C34 52 46 52 50 56 L50 74 C50 80 44 82 38 76 Z" stroke="#00f5a0" fill="#00f5a0" fill-opacity="0.2" />
      <path d="M88 48 C94 56 94 68 88 76" stroke="#00f5a0" stroke-width="2" stroke-dasharray="3 3" />
      <path d="M86 46 L90 49 L84 52" fill="#00f5a0" stroke="none" />
      <path d="M86 78 L90 75 L84 72" fill="#00f5a0" stroke="none" />
    </svg>`
  },

  "NO": {
    word: "No",
    category: "Responses",
    description: "Extend index and middle fingers together, then bring them down to meet the thumb firmly in a double-snap motion.",
    tips: "Resembles a bird's beak snapping shut twice.",
    motion: "Index and middle tapping thumb twice",
    svg: `<svg viewBox="0 0 120 120" class="w-full h-full" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M38 88 L46 68 C48 62 52 60 58 62 L74 66" stroke="#8b5cf6" />
      <path d="M48 62 L60 40 C63 36 68 37 70 42 L66 62" stroke="#00f5a0" />
      <path d="M56 62 L70 42 C73 38 78 39 80 44 L74 64" stroke="#00f5a0" />
      <circle cx="76" cy="65" r="4" fill="#00f5a0" />
      <path d="M48 76 C54 84 62 86 70 82" stroke="#8b5cf6" />
      <path d="M78 40 C84 46 86 54 84 60" stroke="#00f5a0" stroke-width="2" stroke-dasharray="2 2" />
      <path d="M82 62 L85 58 L80 57" fill="#00f5a0" stroke="none" />
    </svg>`
  },

  "I LOVE YOU": {
    word: "I Love You",
    category: "Expressions",
    description: "Extend the thumb, index finger, and pinky finger simultaneously while keeping the middle and ring fingers folded into the palm. Palm faces forward.",
    tips: "Combines the ASL fingerspelled letters 'I', 'L', and 'Y'.",
    motion: "Hold hand upright with I-L-Y fingers extended",
    svg: `<svg viewBox="0 0 120 120" class="w-full h-full" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M32 64 C28 58 35 50 42 55 L48 62" stroke="#00f5a0" />
      <path d="M48 62 L48 30 C48 24 54 24 56 30 L56 65" stroke="#00f5a0" />
      <path d="M56 65 C56 58 64 58 64 66 L64 74" stroke="#8b5cf6" />
      <path d="M64 72 C64 64 72 64 72 72 L72 76" stroke="#8b5cf6" />
      <path d="M72 74 L80 38 C81 32 87 34 86 40 L84 76 C82 88 74 96 60 96 C48 96 40 88 38 78 Z" stroke="#00f5a0" />
      <circle cx="52" cy="28" r="3" fill="#00f5a0" />
      <circle cx="83" cy="36" r="3" fill="#00f5a0" />
      <circle cx="34" cy="56" r="3" fill="#00f5a0" />
      <path d="M48 104 C60 110 70 106 78 100" stroke="#8b5cf6" stroke-width="1.5" stroke-dasharray="2 2" />
    </svg>`
  },

  "PEACE": {
    word: "Peace",
    category: "Universal",
    description: "Extend index and middle fingers in an open 'V' shape while holding thumb over folded ring and pinky fingers. Palm facing forward.",
    tips: "Also represents the number '2' or ASL letter 'V'.",
    motion: "Hold 'V' sign upright firmly",
    svg: `<svg viewBox="0 0 120 120" class="w-full h-full" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M50 72 L45 32 C44 26 51 25 53 31 L58 66" stroke="#00f5a0" />
      <path d="M58 66 L67 33 C69 27 76 29 74 35 L68 70" stroke="#00f5a0" />
      <path d="M68 70 C70 64 78 66 76 74" stroke="#8b5cf6" />
      <path d="M76 74 C78 70 84 72 82 78 L80 84 C76 94 68 98 56 98 C46 98 40 90 38 80 L38 70 C38 64 45 64 48 70 Z" stroke="#8b5cf6" />
      <circle cx="49" cy="30" r="3" fill="#00f5a0" />
      <circle cx="71" cy="32" r="3" fill="#00f5a0" />
    </svg>`
  },

  "OK": {
    word: "OK / Perfect",
    category: "Universal",
    description: "Touch the tip of index finger to the tip of thumb creating an 'O', while keeping middle, ring, and pinky fingers upright.",
    tips: "Also represents the ASL letter 'F'.",
    motion: "Form circle with thumb and index, 3 fingers up",
    svg: `<svg viewBox="0 0 120 120" class="w-full h-full" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="48" cy="56" r="10" stroke="#00f5a0" stroke-width="3" fill="#00f5a0" fill-opacity="0.15" />
      <path d="M58 52 L62 30 C63 24 69 25 69 31 L68 56" stroke="#00f5a0" />
      <path d="M68 56 L73 34 C74 28 80 29 80 35 L78 60" stroke="#00f5a0" />
      <path d="M78 60 L83 42 C84 36 90 38 89 44 L86 70 C84 82 76 92 62 94 L50 94 C42 90 38 80 38 72 Z" stroke="#8b5cf6" />
      <circle cx="65" cy="28" r="3" fill="#00f5a0" />
      <circle cx="76" cy="32" r="3" fill="#00f5a0" />
      <circle cx="86" cy="40" r="3" fill="#00f5a0" />
    </svg>`
  },

  "GOOD": {
    word: "Good / Thumbs Up",
    category: "Universal",
    description: "Make a tight fist with thumb extended straight upward. Alternatively in ASL, place flat fingers of dominant hand to lips, then place into the open palm of non-dominant hand.",
    tips: "A universally recognized gesture of affirmation and quality.",
    motion: "Fist with thumb pointing upward",
    svg: `<svg viewBox="0 0 120 120" class="w-full h-full" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M46 62 L46 32 C46 24 54 22 56 30 L56 55" stroke="#00f5a0" stroke-width="3" />
      <rect x="52" y="55" width="28" height="36" rx="8" stroke="#8b5cf6" fill="#121424" fill-opacity="0.6" />
      <path d="M54 64 L76 64 M54 73 L76 73 M54 82 L76 82" stroke="#8b5cf6" />
      <circle cx="51" cy="28" r="4" fill="#00f5a0" />
      <path d="M51 18 L51 10 M44 14 L51 8 L58 14" stroke="#00f5a0" stroke-width="2" />
    </svg>`
  },

  "BAD": {
    word: "Bad / Thumbs Down",
    category: "Universal",
    description: "Make a tight fist with thumb pointed straight downward. In ASL, fingers touch lips then turn palm down sharply.",
    tips: "Represents disapproval, poor quality, or negation.",
    motion: "Fist with thumb pointing downward",
    svg: `<svg viewBox="0 0 120 120" class="w-full h-full" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="52" y="32" width="28" height="36" rx="8" stroke="#8b5cf6" fill="#121424" fill-opacity="0.6" />
      <path d="M54 41 L76 41 M54 50 L76 50 M54 59 L76 59" stroke="#8b5cf6" />
      <path d="M46 62 L46 92 C46 100 54 102 56 94 L56 69" stroke="#ef4444" stroke-width="3" />
      <circle cx="51" cy="96" r="4" fill="#ef4444" />
      <path d="M51 106 L51 114 M44 110 L51 116 L58 110" stroke="#ef4444" stroke-width="2" />
    </svg>`
  },

  "PLEASE": {
    word: "Please",
    category: "Politeness",
    description: "Rub the flat palm of your dominant hand in a clockwise circular motion over your chest/heart.",
    tips: "Show sincerity with a gentle circular rubbing motion.",
    motion: "Circular chest rub with open palm",
    svg: `<svg viewBox="0 0 120 120" class="w-full h-full" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M45 75 L48 45 C49 39 54 39 55 45 L56 70" stroke="#00f5a0" />
      <path d="M56 70 L58 38 C59 32 64 32 65 38 L65 70" stroke="#00f5a0" />
      <path d="M65 70 L68 42 C69 36 74 36 75 42 L74 72" stroke="#00f5a0" />
      <path d="M74 72 L77 50 C78 45 83 46 83 52 L80 78 C76 88 68 94 56 94 Z" stroke="#8b5cf6" />
      <ellipse cx="60" cy="65" rx="36" ry="24" stroke="#a855f7" stroke-dasharray="4 4" stroke-width="1.5" />
      <path d="M96 65 L98 71 L92 69" fill="#a855f7" stroke="none" />
    </svg>`
  },

  "HELP": {
    word: "Help",
    category: "Essential",
    description: "Place dominant closed fist with thumb up ('A' handshape) directly onto the flat open palm of the non-dominant hand, lifting both hands upward together.",
    tips: "The bottom hand lifts the top hand, signifying assistance.",
    motion: "Lifting dominant fist resting on flat palm",
    svg: `<svg viewBox="0 0 120 120" class="w-full h-full" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="46" y="32" width="28" height="30" rx="6" stroke="#00f5a0" fill="#121424" fill-opacity="0.6" />
      <path d="M42 42 L42 22 C42 16 48 16 50 22 L50 36" stroke="#00f5a0" stroke-width="3" />
      <path d="M26 78 C36 76 84 76 94 78 C98 84 94 90 84 92 L36 92 C26 90 22 84 26 78 Z" stroke="#8b5cf6" fill="#8b5cf6" fill-opacity="0.2" />
      <path d="M60 98 L60 110 M54 104 L60 98 L66 104" stroke="#00f5a0" stroke-width="2" />
    </svg>`
  },

  "STOP": {
    word: "Stop",
    category: "Essential",
    description: "Bring the edge of your open dominant hand down sharply into the open palm of your non-dominant hand like a blade.",
    tips: "Sharp, decisive downward chopping motion.",
    motion: "Open hand chops down onto flat palm",
    svg: `<svg viewBox="0 0 120 120" class="w-full h-full" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M50 20 L58 60 L68 58 L60 18 Z" stroke="#ef4444" fill="#ef4444" fill-opacity="0.2" />
      <path d="M25 72 L95 72 C98 76 96 84 90 86 L30 86 C24 84 22 76 25 72 Z" stroke="#8b5cf6" />
      <path d="M68 34 L78 44 M78 44 L72 44 M78 44 L78 38" stroke="#ef4444" stroke-width="2" />
    </svg>`
  },

  "POINTING": {
    word: "You / Look",
    category: "Pronouns",
    description: "Point dominant index finger forward toward the person you are communicating with, curling other fingers into palm.",
    tips: "Direct index finger clearly at chest height.",
    motion: "Index finger pointing forward",
    svg: `<svg viewBox="0 0 120 120" class="w-full h-full" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M42 66 L42 22 C42 16 48 16 50 22 L50 64" stroke="#00f5a0" stroke-width="3" />
      <rect x="46" y="60" width="28" height="34" rx="8" stroke="#8b5cf6" fill="#121424" fill-opacity="0.6" />
      <circle cx="46" cy="20" r="3.5" fill="#00f5a0" />
      <path d="M46 12 L46 6 M40 9 L46 5 L52 9" stroke="#00f5a0" stroke-width="2" />
    </svg>`
  },

  "CALL ME": {
    word: "Call Me",
    category: "Casual",
    description: "Extend thumb and pinky finger out while holding the middle three fingers curled in, then hold the hand up to your ear.",
    tips: "Mimics holding an old-fashioned telephone handset.",
    motion: "Thumb and pinky extended, held near ear",
    svg: `<svg viewBox="0 0 120 120" class="w-full h-full" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M30 46 C24 40 32 32 38 38 L48 52" stroke="#00f5a0" stroke-width="3" />
      <rect x="46" y="52" width="28" height="34" rx="8" stroke="#8b5cf6" fill="#121424" fill-opacity="0.6" />
      <path d="M72 74 L86 88 C92 94 98 86 92 80 L80 66" stroke="#00f5a0" stroke-width="3" />
      <circle cx="34" cy="38" r="3" fill="#00f5a0" />
      <circle cx="90" cy="86" r="3" fill="#00f5a0" />
    </svg>`
  },

  "WATER": {
    word: "Water",
    category: "Essential",
    description: "Form the ASL letter 'W' with index, middle, and ring fingers extended and spread. Tap index finger against your chin twice.",
    tips: "Keep your hand relaxed as you tap your chin.",
    motion: "'W' handshape tapping chin twice",
    svg: `<svg viewBox="0 0 120 120" class="w-full h-full" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M44 68 L40 28 C39 22 46 22 48 28 L53 64" stroke="#00f5a0" />
      <path d="M53 64 L60 26 C61 20 68 20 69 26 L69 64" stroke="#00f5a0" />
      <path d="M69 64 L78 30 C79 24 86 26 85 32 L78 70" stroke="#00f5a0" />
      <circle cx="44" cy="26" r="3" fill="#00f5a0" />
      <circle cx="64" cy="24" r="3" fill="#00f5a0" />
      <circle cx="82" cy="28" r="3" fill="#00f5a0" />
      <path d="M32 72 C32 64 38 64 42 70" stroke="#8b5cf6" />
      <path d="M78 70 C76 84 66 94 54 94 C46 94 38 88 38 78 Z" stroke="#8b5cf6" />
    </svg>`
  }
};

/**
 * Standard ASL Fingerspelling Alphabet (A-Z)
 */
export const ALPHABET_DICTIONARY = {
  "A": { letter: "A", shape: "Fist with thumb resting upright beside index finger", tip: "Thumb on the side, not over fingers." },
  "B": { letter: "B", shape: "Four fingers extended straight up together, thumb folded across palm", tip: "Palm facing forward, fingers tight." },
  "C": { letter: "C", shape: "Fingers and thumb curved to form a clear 'C' arc", tip: "Hand viewed from profile looks like letter C." },
  "D": { letter: "D", shape: "Index finger points straight up; middle, ring, pinky touch thumb in a circle", tip: "Forms a lowercase 'd'." },
  "E": { letter: "E", shape: "All fingers curled tightly in, thumb curled under fingertips", tip: "Fingertips rest on the edge of the thumb." },
  "F": { letter: "F", shape: "Index finger and thumb touch to form circle, other 3 fingers fan upward", tip: "Same as the 'OK' sign." },
  "G": { letter: "G", shape: "Index finger and thumb parallel pointing sideways like a small clamp", tip: "Points horizontally." },
  "H": { letter: "H", shape: "Index and middle fingers extended together horizontally, other fingers curled", tip: "Two fingers pointing sideways." },
  "I": { letter: "I", shape: "Pinky finger extended straight up, other fingers folded with thumb across", tip: "Only the little pinky finger points up." },
  "J": { letter: "J", shape: "Pinky finger extended, drawing a 'J' curve in the air", tip: "Trace hook downward and back up." },
  "K": { letter: "K", shape: "Index up, middle forward at angle, thumb tucked between them", tip: "V-shape with thumb bracing middle finger." },
  "L": { letter: "L", shape: "Index up and thumb extended at 90-degree angle forming 'L'", tip: "Easily recognizable letter L shape." },
  "M": { letter: "M", shape: "Thumb tucked under the first three fingers (index, middle, ring)", tip: "Three knuckles draped over the thumb." },
  "N": { letter: "N", shape: "Thumb tucked under the first two fingers (index, middle)", tip: "Two knuckles draped over the thumb." },
  "O": { letter: "O", shape: "All fingers and thumb curved touching tips to form an 'O'", tip: "Circular hand shape." },
  "P": { letter: "P", shape: "Like 'K' but pointing downward", tip: "Index points down, middle forward." },
  "Q": { letter: "Q", shape: "Like 'G' but pointing downward", tip: "Index and thumb clamp pointing to floor." },
  "R": { letter: "R", shape: "Index and middle fingers crossed tightly", tip: "Crossing fingers for good luck." },
  "S": { letter: "S", shape: "Fist with thumb wrapped horizontally across front of fingers", tip: "Different from 'A'; thumb crosses the front." },
  "T": { letter: "T", shape: "Thumb tucked between index and middle fingers", tip: "One knuckle draped over thumb." },
  "U": { letter: "U", shape: "Index and middle fingers extended straight up touching together", tip: "Two fingers straight and closed." },
  "V": { letter: "V", shape: "Index and middle fingers extended spread in 'V' shape", tip: "The classic peace/victory sign." },
  "W": { letter: "W", shape: "Index, middle, and ring fingers extended and spread", tip: "Three fingers spread like a 'W'." },
  "X": { letter: "X", shape: "Index finger hooked like a pirate's hook, other fingers closed", tip: "Bent index finger." },
  "Y": { letter: "Y", shape: "Thumb and pinky extended out wide, middle three fingers curled", tip: "Hang loose / phone shape." },
  "Z": { letter: "Z", shape: "Index finger traces letter 'Z' in the air", tip: "Draw Z zig-zag with fingertip." }
};

/**
 * Generate high-contrast SVG visualization for any letter A-Z
 */
export function getAlphabetSVG(letter) {
  const l = (letter || "A").toUpperCase();
  const info = ALPHABET_DICTIONARY[l] || ALPHABET_DICTIONARY["A"];

  // Custom visual representations for key letters
  return `<svg viewBox="0 0 100 100" class="w-full h-full" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="6" y="6" width="88" height="88" rx="16" stroke="#8b5cf6" stroke-opacity="0.3" fill="#0d0f1a" fill-opacity="0.8" />
    <text x="50" y="32" font-size="22" font-weight="900" fill="#00f5a0" text-anchor="middle" font-family="monospace">${l}</text>
    <g transform="translate(15, 28) scale(0.7)">
      <circle cx="50" cy="50" r="30" stroke="#00f5a0" stroke-dasharray="3 3" opacity="0.3" />
      ${renderLetterGraphic(l)}
    </g>
  </svg>`;
}

function renderLetterGraphic(letter) {
  switch (letter) {
    case 'A':
      return `<rect x="36" y="35" width="28" height="35" rx="8" stroke="#00f5a0" fill="#17192c" />
              <path d="M30 46 L30 34 C30 28 36 28 38 34 L38 52" stroke="#8b5cf6" stroke-width="3" />
              <circle cx="34" cy="30" r="3" fill="#8b5cf6" />`;
    case 'B':
      return `<path d="M40 70 L40 22 C40 18 45 18 45 22 L45 70" stroke="#00f5a0" />
              <path d="M45 70 L45 18 C45 14 50 14 50 18 L50 70" stroke="#00f5a0" />
              <path d="M50 70 L50 20 C50 16 55 16 55 20 L55 70" stroke="#00f5a0" />
              <path d="M55 70 L55 24 C55 20 60 20 60 24 L60 70" stroke="#00f5a0" />
              <path d="M32 55 C32 50 42 50 48 54" stroke="#8b5cf6" stroke-width="3" />`;
    case 'C':
      return `<path d="M65 30 C45 24 30 36 30 52 C30 68 45 78 65 74" stroke="#00f5a0" stroke-width="4" />
              <circle cx="65" cy="30" r="4" fill="#8b5cf6" />
              <circle cx="65" cy="74" r="4" fill="#8b5cf6" />`;
    case 'D':
      return `<path d="M42 68 L42 20 C42 16 48 16 48 20 L48 68" stroke="#00f5a0" stroke-width="3.5" />
              <circle cx="58" cy="56" r="14" stroke="#8b5cf6" stroke-width="3" />`;
    case 'L':
      return `<path d="M40 72 L40 22 C40 18 46 18 46 22 L46 64" stroke="#00f5a0" stroke-width="3.5" />
              <path d="M46 64 L72 64 C76 64 76 72 72 72 L40 72" stroke="#00f5a0" stroke-width="3.5" />`;
    case 'V':
      return `<path d="M42 70 L35 24 C34 20 40 19 42 24 L48 62" stroke="#00f5a0" stroke-width="3" />
              <path d="M48 62 L58 24 C60 19 66 20 65 24 L56 70" stroke="#00f5a0" stroke-width="3" />
              <rect x="42" y="60" width="22" height="20" rx="5" stroke="#8b5cf6" fill="#17192c" />`;
    case 'Y':
      return `<path d="M26 40 C22 34 30 28 34 34 L42 48" stroke="#00f5a0" stroke-width="3" />
              <rect x="38" y="46" width="24" height="26" rx="6" stroke="#8b5cf6" fill="#17192c" />
              <path d="M62 66 L74 78 C80 84 84 76 80 70 L68 56" stroke="#00f5a0" stroke-width="3" />`;
    default:
      // Generic hand icon with custom text styling
      return `<path d="M38 70 L38 35 C38 30 44 30 44 35 L44 65" stroke="#00f5a0" stroke-width="3" />
              <path d="M44 65 L44 26 C44 22 50 22 50 26 L50 65" stroke="#00f5a0" stroke-width="3" />
              <path d="M50 65 L50 30 C50 26 56 26 56 30 L56 65" stroke="#00f5a0" stroke-width="3" />
              <rect x="36" y="55" width="28" height="26" rx="6" stroke="#8b5cf6" fill="#17192c" />`;
  }
}

/**
 * Synthetic hand landmark presets for Demo/Simulator mode.
 * Each preset defines 21 (x, y, z) landmarks normalized between [0.2, 0.8].
 */
export const SYNTHETIC_GESTURE_PRESETS = {
  "HELLO": generateOpenHandLandmarks(),
  "PEACE": generatePeaceLandmarks(),
  "I LOVE YOU": generateILYLandmarks(),
  "OK": generateOKLandmarks(),
  "GOOD": generateThumbsUpLandmarks(),
  "YES": generateFistLandmarks(),
  "POINTING": generatePointingLandmarks()
};

function generateOpenHandLandmarks() {
  return [
    {x: 0.50, y: 0.82, z: 0.00}, // 0 wrist
    {x: 0.42, y: 0.74, z: -0.02}, {x: 0.36, y: 0.64, z: -0.04}, {x: 0.32, y: 0.54, z: -0.06}, {x: 0.28, y: 0.46, z: -0.07}, // thumb
    {x: 0.44, y: 0.56, z: -0.02}, {x: 0.42, y: 0.42, z: -0.04}, {x: 0.41, y: 0.32, z: -0.05}, {x: 0.40, y: 0.22, z: -0.06}, // index
    {x: 0.50, y: 0.55, z: -0.02}, {x: 0.50, y: 0.40, z: -0.04}, {x: 0.50, y: 0.28, z: -0.06}, {x: 0.50, y: 0.18, z: -0.07}, // middle
    {x: 0.56, y: 0.56, z: -0.02}, {x: 0.58, y: 0.42, z: -0.04}, {x: 0.59, y: 0.32, z: -0.05}, {x: 0.60, y: 0.22, z: -0.06}, // ring
    {x: 0.62, y: 0.60, z: -0.01}, {x: 0.66, y: 0.48, z: -0.03}, {x: 0.68, y: 0.40, z: -0.04}, {x: 0.70, y: 0.30, z: -0.05}  // pinky
  ];
}

function generatePeaceLandmarks() {
  return [
    {x: 0.50, y: 0.82, z: 0.00},
    {x: 0.44, y: 0.74, z: -0.02}, {x: 0.40, y: 0.68, z: -0.03}, {x: 0.44, y: 0.62, z: -0.03}, {x: 0.48, y: 0.60, z: -0.03}, // thumb curled
    {x: 0.45, y: 0.56, z: -0.02}, {x: 0.42, y: 0.42, z: -0.04}, {x: 0.38, y: 0.30, z: -0.05}, {x: 0.34, y: 0.20, z: -0.06}, // index extended out
    {x: 0.50, y: 0.55, z: -0.02}, {x: 0.52, y: 0.41, z: -0.04}, {x: 0.58, y: 0.29, z: -0.05}, {x: 0.62, y: 0.19, z: -0.06}, // middle extended out
    {x: 0.56, y: 0.58, z: -0.02}, {x: 0.56, y: 0.66, z: -0.01}, {x: 0.55, y: 0.70, z: 0.01}, {x: 0.53, y: 0.68, z: 0.02},   // ring curled
    {x: 0.62, y: 0.62, z: -0.01}, {x: 0.63, y: 0.68, z: 0.00}, {x: 0.61, y: 0.72, z: 0.02}, {x: 0.57, y: 0.70, z: 0.03}    // pinky curled
  ];
}

function generateILYLandmarks() {
  return [
    {x: 0.50, y: 0.82, z: 0.00},
    {x: 0.42, y: 0.74, z: -0.02}, {x: 0.36, y: 0.66, z: -0.04}, {x: 0.30, y: 0.58, z: -0.06}, {x: 0.24, y: 0.50, z: -0.07}, // thumb extended wide
    {x: 0.44, y: 0.56, z: -0.02}, {x: 0.42, y: 0.42, z: -0.04}, {x: 0.41, y: 0.32, z: -0.05}, {x: 0.40, y: 0.20, z: -0.06}, // index extended straight
    {x: 0.50, y: 0.55, z: -0.02}, {x: 0.50, y: 0.64, z: 0.01}, {x: 0.50, y: 0.70, z: 0.03}, {x: 0.49, y: 0.66, z: 0.04},   // middle curled
    {x: 0.56, y: 0.58, z: -0.02}, {x: 0.56, y: 0.66, z: 0.01}, {x: 0.55, y: 0.71, z: 0.03}, {x: 0.53, y: 0.67, z: 0.04},   // ring curled
    {x: 0.62, y: 0.60, z: -0.01}, {x: 0.66, y: 0.48, z: -0.03}, {x: 0.69, y: 0.36, z: -0.05}, {x: 0.72, y: 0.24, z: -0.06}  // pinky extended straight
  ];
}

function generateOKLandmarks() {
  return [
    {x: 0.50, y: 0.82, z: 0.00},
    {x: 0.44, y: 0.72, z: -0.02}, {x: 0.42, y: 0.62, z: -0.03}, {x: 0.44, y: 0.54, z: -0.04}, {x: 0.48, y: 0.50, z: -0.04}, // thumb meets index tip
    {x: 0.46, y: 0.58, z: -0.02}, {x: 0.48, y: 0.52, z: -0.03}, {x: 0.49, y: 0.50, z: -0.04}, {x: 0.48, y: 0.50, z: -0.04}, // index meets thumb
    {x: 0.52, y: 0.55, z: -0.02}, {x: 0.53, y: 0.41, z: -0.04}, {x: 0.54, y: 0.29, z: -0.06}, {x: 0.55, y: 0.19, z: -0.07}, // middle up
    {x: 0.58, y: 0.57, z: -0.02}, {x: 0.60, y: 0.43, z: -0.04}, {x: 0.62, y: 0.31, z: -0.05}, {x: 0.63, y: 0.21, z: -0.06}, // ring up
    {x: 0.64, y: 0.61, z: -0.01}, {x: 0.67, y: 0.49, z: -0.03}, {x: 0.70, y: 0.39, z: -0.04}, {x: 0.72, y: 0.29, z: -0.05}  // pinky up
  ];
}

function generateThumbsUpLandmarks() {
  return [
    {x: 0.50, y: 0.82, z: 0.00},
    {x: 0.46, y: 0.70, z: -0.02}, {x: 0.44, y: 0.56, z: -0.04}, {x: 0.43, y: 0.42, z: -0.06}, {x: 0.42, y: 0.28, z: -0.08}, // thumb pointing straight up
    {x: 0.50, y: 0.65, z: -0.01}, {x: 0.54, y: 0.64, z: 0.01}, {x: 0.56, y: 0.68, z: 0.03}, {x: 0.54, y: 0.72, z: 0.04},    // index curled
    {x: 0.53, y: 0.69, z: -0.01}, {x: 0.57, y: 0.68, z: 0.01}, {x: 0.59, y: 0.72, z: 0.03}, {x: 0.57, y: 0.75, z: 0.04},    // middle curled
    {x: 0.56, y: 0.73, z: -0.01}, {x: 0.60, y: 0.72, z: 0.01}, {x: 0.61, y: 0.75, z: 0.03}, {x: 0.59, y: 0.78, z: 0.04},    // ring curled
    {x: 0.60, y: 0.77, z: 0.00},  {x: 0.63, y: 0.76, z: 0.02}, {x: 0.63, y: 0.79, z: 0.03}, {x: 0.61, y: 0.81, z: 0.04}     // pinky curled
  ];
}

function generateFistLandmarks() {
  return [
    {x: 0.50, y: 0.82, z: 0.00},
    {x: 0.44, y: 0.72, z: -0.02}, {x: 0.42, y: 0.65, z: 0.00}, {x: 0.46, y: 0.60, z: 0.02}, {x: 0.52, y: 0.62, z: 0.03},    // thumb wrapped across
    {x: 0.46, y: 0.62, z: -0.01}, {x: 0.48, y: 0.68, z: 0.01}, {x: 0.46, y: 0.74, z: 0.03}, {x: 0.44, y: 0.72, z: 0.04},    // index curled
    {x: 0.51, y: 0.62, z: -0.01}, {x: 0.52, y: 0.69, z: 0.01}, {x: 0.51, y: 0.75, z: 0.03}, {x: 0.48, y: 0.73, z: 0.04},    // middle curled
    {x: 0.56, y: 0.63, z: -0.01}, {x: 0.57, y: 0.70, z: 0.01}, {x: 0.55, y: 0.75, z: 0.03}, {x: 0.52, y: 0.74, z: 0.04},    // ring curled
    {x: 0.61, y: 0.65, z: 0.00},  {x: 0.61, y: 0.71, z: 0.01}, {x: 0.59, y: 0.76, z: 0.03}, {x: 0.56, y: 0.75, z: 0.04}     // pinky curled
  ];
}

function generatePointingLandmarks() {
  return [
    {x: 0.50, y: 0.82, z: 0.00},
    {x: 0.46, y: 0.72, z: -0.02}, {x: 0.44, y: 0.66, z: 0.00}, {x: 0.48, y: 0.62, z: 0.02}, {x: 0.52, y: 0.63, z: 0.03},    // thumb wrapped
    {x: 0.46, y: 0.56, z: -0.02}, {x: 0.44, y: 0.42, z: -0.04}, {x: 0.43, y: 0.30, z: -0.05}, {x: 0.42, y: 0.18, z: -0.06}, // index pointing straight up
    {x: 0.51, y: 0.62, z: -0.01}, {x: 0.53, y: 0.68, z: 0.01}, {x: 0.52, y: 0.74, z: 0.03}, {x: 0.49, y: 0.72, z: 0.04},    // middle curled
    {x: 0.56, y: 0.63, z: -0.01}, {x: 0.57, y: 0.70, z: 0.01}, {x: 0.55, y: 0.75, z: 0.03}, {x: 0.52, y: 0.74, z: 0.04},    // ring curled
    {x: 0.61, y: 0.65, z: 0.00},  {x: 0.61, y: 0.71, z: 0.01}, {x: 0.59, y: 0.76, z: 0.03}, {x: 0.56, y: 0.75, z: 0.04}     // pinky curled
  ];
}
