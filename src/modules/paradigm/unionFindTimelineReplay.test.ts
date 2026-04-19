import { describe, expect, it } from 'vitest';
import { createInitialTimelineState, timelineReducer } from '../../engine/timeline/reducer';
import { buildUnionFindTimelineFromPreset } from './unionFindTimelineAdapter';

function runReplaySequence(speedMs: number): { sequence: number[]; finalComponents: number[][] | undefined } {
  const frames = buildUnionFindTimelineFromPreset('classic');
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
    finalComponents: frames[state.currentFrame]?.payload.components,
  };
}

describe('union find timeline deterministic replay', () => {
  it('keeps the same frame order across speed changes after seek/resume', () => {
    const slow = runReplaySequence(1200);
    const fast = runReplaySequence(350);

    expect(slow.sequence).toEqual(fast.sequence);
    expect(slow.finalComponents).toEqual([[0, 1, 2, 3, 4, 5, 6, 7]]);
    expect(fast.finalComponents).toEqual([[0, 1, 2, 3, 4, 5, 6, 7]]);
  });
});
