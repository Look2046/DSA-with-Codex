import { describe, expect, it } from 'vitest';
import { createInitialTimelineState, timelineReducer } from '../../engine/timeline/reducer';
import { buildMergeSortTimelineFromInput, type MergeSortImplementation } from './mergeTimelineAdapter';
import type { MergeSortStep } from './mergeSort';

type MergeReplayFrame = Pick<MergeSortStep, 'action' | 'indices' | 'left' | 'mid' | 'right'>;

function runReplaySequence(
  speedMs: number,
  implementation: MergeSortImplementation = 'topDown',
): { sequence: number[]; finalStatus: string; frames: MergeReplayFrame[] } {
  const frames = buildMergeSortTimelineFromInput([9, 2, 7, 1, 4], implementation);
  let state = createInitialTimelineState(frames.length);
  const sequence: number[] = [state.currentFrame];

  state = timelineReducer(state, { type: 'setSpeed', speedMs });
  state = timelineReducer(state, { type: 'play' });

  state = timelineReducer(state, { type: 'next' });
  sequence.push(state.currentFrame);
  state = timelineReducer(state, { type: 'next' });
  sequence.push(state.currentFrame);

  state = timelineReducer(state, { type: 'pause' });
  state = timelineReducer(state, { type: 'seek', frameIndex: 1 });
  sequence.push(state.currentFrame);
  state = timelineReducer(state, { type: 'play' });

  while (state.status !== 'completed') {
    state = timelineReducer(state, { type: 'next' });
    sequence.push(state.currentFrame);
  }

  return {
    sequence,
    finalStatus: state.status,
    frames: sequence.map((frameIndex) => {
      const payload = frames[frameIndex].payload;
      return {
        action: payload.action,
        indices: payload.indices,
        left: payload.left,
        mid: payload.mid,
        right: payload.right,
      };
    }),
  };
}

describe('merge timeline deterministic replay', () => {
  it('keeps frame order stable across speed changes when using seek/resume', () => {
    const slow = runReplaySequence(1200);
    const fast = runReplaySequence(350);

    expect(slow.sequence).toEqual(fast.sequence);
    expect(slow.sequence.at(-1)).toBeGreaterThan(0);
    expect(slow.finalStatus).toBe('completed');
    expect(fast.finalStatus).toBe('completed');
  });

  it('keeps frame order stable for bottom-up implementation across speed changes', () => {
    const slow = runReplaySequence(1200, 'bottomUp');
    const fast = runReplaySequence(350, 'bottomUp');

    expect(slow.sequence).toEqual(fast.sequence);
    expect(slow.sequence.at(-1)).toBeGreaterThan(0);
    expect(slow.finalStatus).toBe('completed');
    expect(fast.finalStatus).toBe('completed');
  });

  it('keeps write-back step followed by merged-range mark in replay', () => {
    const replay = runReplaySequence(450);

    replay.frames.forEach((frame, index) => {
      if (frame.action !== 'writeBack') {
        return;
      }
      const nextRangeMergedIndex = replay.frames.slice(index + 1).findIndex((item) => item.action === 'rangeMerged');
      expect(nextRangeMergedIndex).toBeGreaterThanOrEqual(0);
    });
  });
});
