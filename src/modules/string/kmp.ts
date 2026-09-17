import type { AnimationStep } from '../../types/animation';

export type KmpPresetId = 'classic' | 'overlap';

export type KmpPreset = {
  presetId: KmpPresetId;
  text: string;
  pattern: string;
};

export type KmpAction =
  | 'initial'
  | 'prefixCompare'
  | 'prefixFallback'
  | 'prefixWrite'
  | 'prefixComplete'
  | 'searchCompare'
  | 'searchAdvance'
  | 'searchShift'
  | 'searchFallback'
  | 'matchFound'
  | 'completed';

export type KmpPhase = 'prefix' | 'search' | 'completed';

export type KmpStep = AnimationStep & {
  presetId: KmpPresetId;
  text: string;
  pattern: string;
  lps: number[];
  action: KmpAction;
  phase: KmpPhase;
  matches: number[];
  prefixIndex: number | null;
  prefixCandidateIndex: number | null;
  prefixBuiltCount: number;
  searchTextIndex: number | null;
  searchPatternIndex: number | null;
  alignmentStart: number;
};

const KMP_PRESETS: Record<KmpPresetId, KmpPreset> = {
  classic: {
    presetId: 'classic',
    text: 'ABABDABACDABABCABAB',
    pattern: 'ABABCABAB',
  },
  overlap: {
    presetId: 'overlap',
    text: 'AAAAABAAABA',
    pattern: 'AAABA',
  },
};

function cloneLps(lps: number[]): number[] {
  return [...lps];
}

function cloneMatches(matches: number[]): number[] {
  return [...matches];
}

function createStep(
  preset: KmpPreset,
  lps: number[],
  action: KmpAction,
  phase: KmpPhase,
  codeLines: number[],
  matches: number[],
  prefixIndex: number | null,
  prefixCandidateIndex: number | null,
  prefixBuiltCount: number,
  searchTextIndex: number | null,
  searchPatternIndex: number | null,
  alignmentStart: number,
): KmpStep {
  return {
    description: '',
    codeLines: [...codeLines],
    highlights: [],
    presetId: preset.presetId,
    text: preset.text,
    pattern: preset.pattern,
    lps: cloneLps(lps),
    action,
    phase,
    matches: cloneMatches(matches),
    prefixIndex,
    prefixCandidateIndex,
    prefixBuiltCount,
    searchTextIndex,
    searchPatternIndex,
    alignmentStart,
  };
}

export function getKmpPresetIds(): KmpPresetId[] {
  return Object.keys(KMP_PRESETS) as KmpPresetId[];
}

export function getKmpPreset(presetId: KmpPresetId): KmpPreset {
  return { ...KMP_PRESETS[presetId] };
}

export function generateKmpSteps(presetId: KmpPresetId): KmpStep[] {
  const preset = getKmpPreset(presetId);
  const patternLength = preset.pattern.length;
  const lps = Array.from({ length: patternLength }, () => 0);
  const steps: KmpStep[] = [];
  const matches: number[] = [];

  steps.push(createStep(preset, lps, 'initial', 'prefix', [1], matches, 1, 0, Math.min(patternLength, 1), null, null, 0));

  if (patternLength === 0) {
    steps.push(createStep(preset, lps, 'completed', 'completed', [12], matches, null, null, 0, null, null, 0));
    return steps;
  }

  let prefixLength = 0;
  let prefixIndex = 1;

  while (prefixIndex < patternLength) {
    steps.push(
      createStep(
        preset,
        lps,
        'prefixCompare',
        'prefix',
        [2],
        matches,
        prefixIndex,
        prefixLength,
        prefixIndex,
        null,
        null,
        0,
      ),
    );

    if (preset.pattern[prefixIndex] === preset.pattern[prefixLength]) {
      prefixLength += 1;
      lps[prefixIndex] = prefixLength;
      steps.push(
        createStep(
          preset,
          lps,
          'prefixWrite',
          'prefix',
          [3],
          matches,
          prefixIndex,
          prefixLength - 1,
          prefixIndex + 1,
          null,
          null,
          0,
        ),
      );
      prefixIndex += 1;
      continue;
    }

    if (prefixLength !== 0) {
      prefixLength = lps[prefixLength - 1] ?? 0;
      steps.push(
        createStep(
          preset,
          lps,
          'prefixFallback',
          'prefix',
          [4],
          matches,
          prefixIndex,
          prefixLength,
          prefixIndex,
          null,
          null,
          0,
        ),
      );
      continue;
    }

    lps[prefixIndex] = 0;
    steps.push(
      createStep(
        preset,
        lps,
        'prefixWrite',
        'prefix',
        [5],
        matches,
        prefixIndex,
        0,
        prefixIndex + 1,
        null,
        null,
        0,
      ),
    );
    prefixIndex += 1;
  }

  steps.push(
    createStep(
      preset,
      lps,
      'prefixComplete',
      'search',
      [6],
      matches,
      null,
      null,
      patternLength,
      0,
      0,
      0,
    ),
  );

  let textIndex = 0;
  let patternIndex = 0;

  while (textIndex < preset.text.length) {
    steps.push(
      createStep(
        preset,
        lps,
        'searchCompare',
        'search',
        [7],
        matches,
        null,
        null,
        patternLength,
        textIndex,
        patternIndex,
        textIndex - patternIndex,
      ),
    );

    if (preset.text[textIndex] === preset.pattern[patternIndex]) {
      textIndex += 1;
      patternIndex += 1;

      steps.push(
        createStep(
          preset,
          lps,
          'searchAdvance',
          'search',
          [8],
          matches,
          null,
          null,
          patternLength,
          textIndex - 1,
          patternIndex - 1,
          textIndex - patternIndex,
        ),
      );

      if (patternIndex === patternLength) {
        const matchStart = textIndex - patternIndex;
        matches.push(matchStart);
        steps.push(
          createStep(
            preset,
            lps,
            'matchFound',
            'search',
            [9],
            matches,
            null,
            null,
            patternLength,
            textIndex - 1,
            patternIndex - 1,
            matchStart,
          ),
        );

        patternIndex = lps[patternIndex - 1] ?? 0;
        if (patternIndex > 0) {
          steps.push(
            createStep(
              preset,
              lps,
              'searchFallback',
              'search',
              [10],
              matches,
              null,
              null,
              patternLength,
              textIndex,
              patternIndex,
              textIndex - patternIndex,
            ),
          );
        }
      }
      continue;
    }

    if (patternIndex !== 0) {
      patternIndex = lps[patternIndex - 1] ?? 0;
      steps.push(
        createStep(
          preset,
          lps,
          'searchFallback',
          'search',
          [10],
          matches,
          null,
          null,
          patternLength,
          textIndex,
          patternIndex,
          textIndex - patternIndex,
        ),
      );
      continue;
    }

    textIndex += 1;
    steps.push(
      createStep(
        preset,
        lps,
        'searchShift',
        'search',
        [11],
        matches,
        null,
        null,
        patternLength,
        Math.max(textIndex - 1, 0),
        0,
        textIndex,
      ),
    );
  }

  steps.push(
    createStep(
      preset,
      lps,
      'completed',
      'completed',
      [12],
      matches,
      null,
      null,
      patternLength,
      null,
      null,
      Math.max(textIndex - patternIndex, 0),
    ),
  );

  return steps;
}
