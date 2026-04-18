import { describe, expect, it } from 'vitest';
import { createInitialTimelineState, timelineReducer } from '../../engine/timeline/reducer';
import { buildFloydWarshallTimelineFromPreset } from './floydWarshallTimelineAdapter';

function runReplaySequence(speedMs: number): {
  sequence: number[];
  finalStatus: string;
  finalOutcome: string | undefined;
} {
  const frames = buildFloydWarshallTimelineFromPreset('floydDirected');
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
    finalOutcome: frames[state.currentFrame]?.payload.outcome,
  };
}

describe('floydWarshall timeline deterministic replay', () => {
  it('keeps frame order stable across speed changes when using seek/resume', () => {
    const slow = runReplaySequence(1200);
    const fast = runReplaySequence(350);

    expect(slow.sequence).toEqual(fast.sequence);
    expect(slow.sequence.at(-1)).toBeGreaterThan(0);
    expect(slow.finalStatus).toBe('completed');
    expect(fast.finalStatus).toBe('completed');
    expect(slow.finalOutcome).toBe('completed');
    expect(fast.finalOutcome).toBe('completed');
  });
});
