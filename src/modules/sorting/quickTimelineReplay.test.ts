import { describe, expect, it } from 'vitest';
import { createInitialTimelineState, timelineReducer } from '../../engine/timeline/reducer';
import { buildQuickSortTimelineFromInput } from './quickTimelineAdapter';
import type { QuickSortStep } from './quickSort';

type QuickReplayFrame = Pick<QuickSortStep, 'action' | 'indices' | 'low' | 'high' | 'pivotIndex' | 'holeIndex' | 'pivotLifted'>;

function runReplaySequence(speedMs: number): { sequence: number[]; finalStatus: string; frames: QuickReplayFrame[] } {
  const frames = buildQuickSortTimelineFromInput([4, 7, 1, 6, 3, 5, 2]);
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
        low: payload.low,
        high: payload.high,
        pivotIndex: payload.pivotIndex,
        holeIndex: payload.holeIndex,
        pivotLifted: payload.pivotLifted,
      };
    }),
  };
}

describe('quick timeline deterministic replay', () => {
  it('keeps frame order stable across speed changes when using seek/resume', () => {
    const slow = runReplaySequence(1200);
    const fast = runReplaySequence(350);

    expect(slow.sequence).toEqual(fast.sequence);
    expect(slow.sequence.at(-1)).toBeGreaterThan(0);
    expect(slow.finalStatus).toBe('completed');
    expect(fast.finalStatus).toBe('completed');
  });

  it('keeps pivot placement followed by range mark after seek-resume replay', () => {
    const replay = runReplaySequence(450);

    replay.frames.forEach((frame, index) => {
      if (frame.action !== 'pivotPlace') {
        return;
      }
      const nextFrame = replay.frames[index + 1];
      expect(nextFrame?.action).toBe('rangeSorted');
      if (!nextFrame) {
        return;
      }
      expect(nextFrame.indices[0]).toBe(frame.indices[0]);
    });
  });

  it('keeps dual-pointer scanning and filling actions after seek-resume replay', () => {
    const replay = runReplaySequence(600);
    const actions = replay.frames.map((frame) => frame.action);

    expect(actions).toContain('scanRight');
    expect(actions).toContain('scanLeft');
    expect(actions).toContain('fillLeft');
    expect(actions).toContain('fillRight');
  });
});
