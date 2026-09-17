import type { AnimationStep } from '../../types/animation';

export type RabinKarpPresetId = 'classic' | 'collision';

export type RabinKarpPreset = {
  presetId: RabinKarpPresetId;
  text: string;
  pattern: string;
  base: number;
  mod: number;
};

export type RabinKarpAction =
  | 'initial'
  | 'hashPattern'
  | 'hashWindow'
  | 'compareHash'
  | 'verifyChar'
  | 'shiftWindow'
  | 'matchFound'
  | 'completed';

export type RabinKarpPhase = 'setup' | 'scan' | 'verify' | 'completed';

export type RabinKarpStep = AnimationStep & {
  presetId: RabinKarpPresetId;
  text: string;
  pattern: string;
  base: number;
  mod: number;
  basePower: number;
  action: RabinKarpAction;
  phase: RabinKarpPhase;
  patternHash: number | null;
  windowHash: number | null;
  windowStart: number;
  matches: number[];
  verifiedPrefixLength: number;
  verificationIndex: number | null;
  hashMatched: boolean;
  collision: boolean;
  outgoingChar: string | null;
  incomingChar: string | null;
  scannedWindowCount: number;
  totalWindows: number;
};

const RABIN_KARP_PRESETS: Record<RabinKarpPresetId, RabinKarpPreset> = {
  classic: {
    presetId: 'classic',
    text: 'AABAACAADAABAABA',
    pattern: 'AABA',
    base: 7,
    mod: 13,
  },
  collision: {
    presetId: 'collision',
    text: 'AACAAAAB',
    pattern: 'AAAB',
    base: 7,
    mod: 13,
  },
};

function charValue(char: string): number {
  const upper = char.toUpperCase();
  const code = upper.charCodeAt(0);
  if (code >= 65 && code <= 90) {
    return code - 64;
  }
  return 0;
}

function computeHash(value: string, base: number, mod: number): number {
  let hash = 0;
  for (const char of value) {
    hash = (hash * base + charValue(char)) % mod;
  }
  return hash;
}

function computeBasePower(length: number, base: number, mod: number): number {
  let power = 1;
  for (let index = 1; index < length; index += 1) {
    power = (power * base) % mod;
  }
  return power;
}

function rollHash(
  previousHash: number,
  outgoingChar: string,
  incomingChar: string,
  base: number,
  mod: number,
  basePower: number,
): number {
  const outgoingValue = charValue(outgoingChar);
  const incomingValue = charValue(incomingChar);
  const withoutOutgoing = (previousHash - outgoingValue * basePower) % mod;
  const normalized = withoutOutgoing < 0 ? withoutOutgoing + mod : withoutOutgoing;
  return (normalized * base + incomingValue) % mod;
}

function cloneMatches(matches: number[]): number[] {
  return [...matches];
}

function createStep(
  preset: RabinKarpPreset,
  action: RabinKarpAction,
  phase: RabinKarpPhase,
  codeLines: number[],
  patternHash: number | null,
  windowHash: number | null,
  windowStart: number,
  matches: number[],
  verifiedPrefixLength: number,
  verificationIndex: number | null,
  hashMatched: boolean,
  collision: boolean,
  outgoingChar: string | null,
  incomingChar: string | null,
  scannedWindowCount: number,
  totalWindows: number,
): RabinKarpStep {
  return {
    description: '',
    codeLines: [...codeLines],
    highlights: [],
    presetId: preset.presetId,
    text: preset.text,
    pattern: preset.pattern,
    base: preset.base,
    mod: preset.mod,
    basePower: computeBasePower(Math.max(preset.pattern.length, 1), preset.base, preset.mod),
    action,
    phase,
    patternHash,
    windowHash,
    windowStart,
    matches: cloneMatches(matches),
    verifiedPrefixLength,
    verificationIndex,
    hashMatched,
    collision,
    outgoingChar,
    incomingChar,
    scannedWindowCount,
    totalWindows,
  };
}

export function getRabinKarpPresetIds(): RabinKarpPresetId[] {
  return Object.keys(RABIN_KARP_PRESETS) as RabinKarpPresetId[];
}

export function getRabinKarpPreset(presetId: RabinKarpPresetId): RabinKarpPreset {
  return { ...RABIN_KARP_PRESETS[presetId] };
}

export function generateRabinKarpSteps(presetId: RabinKarpPresetId): RabinKarpStep[] {
  const preset = getRabinKarpPreset(presetId);
  const steps: RabinKarpStep[] = [];
  const matches: number[] = [];
  const patternLength = preset.pattern.length;
  const textLength = preset.text.length;
  const totalWindows = patternLength === 0 || textLength < patternLength ? 0 : textLength - patternLength + 1;

  steps.push(createStep(preset, 'initial', 'setup', [1], null, null, 0, matches, 0, null, false, false, null, null, 0, totalWindows));

  if (patternLength === 0 || textLength < patternLength) {
    steps.push(
      createStep(
        preset,
        'completed',
        'completed',
        [8],
        null,
        null,
        0,
        matches,
        0,
        null,
        false,
        false,
        null,
        null,
        0,
        totalWindows,
      ),
    );
    return steps;
  }

  const patternHash = computeHash(preset.pattern, preset.base, preset.mod);
  const basePower = computeBasePower(patternLength, preset.base, preset.mod);
  let windowStart = 0;
  let windowHash = computeHash(preset.text.slice(0, patternLength), preset.base, preset.mod);

  steps.push(
    createStep(
      preset,
      'hashPattern',
      'setup',
      [2],
      patternHash,
      null,
      0,
      matches,
      0,
      null,
      false,
      false,
      null,
      null,
      0,
      totalWindows,
    ),
  );

  steps.push(
    createStep(
      preset,
      'hashWindow',
      'scan',
      [3],
      patternHash,
      windowHash,
      windowStart,
      matches,
      0,
      null,
      false,
      false,
      null,
      null,
      1,
      totalWindows,
    ),
  );

  while (windowStart <= textLength - patternLength) {
    const hashMatched = patternHash === windowHash;
    steps.push(
      createStep(
        preset,
        'compareHash',
        'scan',
        [4],
        patternHash,
        windowHash,
        windowStart,
        matches,
        0,
        null,
        hashMatched,
        false,
        null,
        null,
        windowStart + 1,
        totalWindows,
      ),
    );

    let matched = true;
    if (hashMatched) {
      for (let index = 0; index < patternLength; index += 1) {
        const charMatched = preset.text[windowStart + index] === preset.pattern[index];
        steps.push(
          createStep(
            preset,
            'verifyChar',
            'verify',
            [5],
            patternHash,
            windowHash,
            windowStart,
            matches,
            charMatched ? index + 1 : index,
            index,
            true,
            !charMatched,
            null,
            null,
            windowStart + 1,
            totalWindows,
          ),
        );

        if (!charMatched) {
          matched = false;
          break;
        }
      }

      if (matched) {
        matches.push(windowStart);
        steps.push(
          createStep(
            preset,
            'matchFound',
            'scan',
            [6],
            patternHash,
            windowHash,
            windowStart,
            matches,
            patternLength,
            null,
            true,
            false,
            null,
            null,
            windowStart + 1,
            totalWindows,
          ),
        );
      }
    }

    if (windowStart >= textLength - patternLength) {
      break;
    }

    const outgoingChar = preset.text[windowStart] ?? null;
    const incomingChar = preset.text[windowStart + patternLength] ?? null;
    if (outgoingChar === null || incomingChar === null) {
      break;
    }

    windowHash = rollHash(windowHash, outgoingChar, incomingChar, preset.base, preset.mod, basePower);
    windowStart += 1;
    steps.push(
      createStep(
        preset,
        'shiftWindow',
        'scan',
        [7],
        patternHash,
        windowHash,
        windowStart,
        matches,
        0,
        null,
        false,
        false,
        outgoingChar,
        incomingChar,
        windowStart + 1,
        totalWindows,
      ),
    );
  }

  steps.push(
    createStep(
      preset,
      'completed',
      'completed',
      [8],
      patternHash,
      windowHash,
      windowStart,
      matches,
      0,
      null,
      false,
      false,
      null,
      null,
      totalWindows,
      totalWindows,
    ),
  );

  return steps;
}
