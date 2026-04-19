import { describe, expect, it } from 'vitest';
import { createInitialTimelineState, timelineReducer } from '../../engine/timeline/reducer';
import { buildDivideConquerTimelineFromPreset } from './divideConquerTimelineAdapter';

function runReplaySequence(speedMs: number): { sequence: number[]; finalMax: number | undefined } {
  const frames = buildDivideConquerTimelineFromPreset('classic');
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
    finalMax: frames[state.currentFrame]?.payload.currentBest?.maxValue,
  };
}

describe('divide conquer timeline deterministic replay', () => {
  it('keeps the same frame order across speed changes after seek/resume', () => {
    const slow = runReplaySequence(1200);
    const fast = runReplaySequence(350);

    expect(slow.sequence).toEqual(fast.sequence);
    expect(slow.finalMax).toBe(14);
    expect(fast.finalMax).toBe(14);
  });
});
