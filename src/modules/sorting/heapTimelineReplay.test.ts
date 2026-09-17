import { describe, expect, it } from 'vitest';
import { createInitialTimelineState, timelineReducer } from '../../engine/timeline/reducer';
import { buildHeapSortTimelineFromInput } from './heapTimelineAdapter';

function runReplaySequence(speedMs: number): {
  sequence: number[];
  finalStatus: string;
  finalHeapSize: number | undefined;
} {
  const frames = buildHeapSortTimelineFromInput([42, 17, 68, 9, 51, 23, 75]);
  let state = createInitialTimelineState(frames.length);
  const sequence: number[] = [state.currentFrame];

  state = timelineReducer(state, { type: 'setSpeed', speedMs });
  state = timelineReducer(state, { type: 'play' });

  state = timelineReducer(state, { type: 'next' });
  sequence.push(state.currentFrame);
  state = timelineReducer(state, { type: 'next' });
  sequence.push(state.currentFrame);

  state = timelineReducer(state, { type: 'pause' });
  state = timelineReducer(state, { type: 'seek', frameIndex: 2 });
  sequence.push(state.currentFrame);
  state = timelineReducer(state, { type: 'play' });

  while (state.status !== 'completed') {
    state = timelineReducer(state, { type: 'next' });
    sequence.push(state.currentFrame);
  }

  return {
    sequence,
    finalStatus: state.status,
    finalHeapSize: frames[state.currentFrame]?.payload.heapSize,
  };
}

describe('heap sort timeline deterministic replay', () => {
  it('keeps the same frame order across speed changes after seek/resume', () => {
    const slow = runReplaySequence(1200);
    const fast = runReplaySequence(350);

    expect(slow.sequence).toEqual(fast.sequence);
    expect(slow.finalStatus).toBe('completed');
    expect(fast.finalStatus).toBe('completed');
    expect(slow.finalHeapSize).toBe(0);
    expect(fast.finalHeapSize).toBe(0);
  });
});
