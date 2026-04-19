import type { TimelineFrame } from '../../engine/timeline/types';
import { generateTrieSteps, type TrieStep } from './trie';

export type TrieTimelineFrame = TimelineFrame<TrieStep>;

export function buildTrieTimelineFrames(steps: TrieStep[]): TrieTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildTrieTimelineFromInput(
  seedWords: readonly string[],
  insertWord: string,
  queryWord: string,
): TrieTimelineFrame[] {
  return buildTrieTimelineFrames(generateTrieSteps(seedWords, insertWord, queryWord));
}
