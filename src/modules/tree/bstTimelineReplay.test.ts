import { describe, expect, it } from 'vitest';
import { createInitialTimelineState, timelineReducer } from '../../engine/timeline/reducer';
import { buildBstTimelineFromInput } from './bstTimelineAdapter';

function runReplaySequence(speedMs: number): { sequence: number[]; finalStatus: string; finalOutcome: string | undefined } {
  const frames = buildBstTimelineFromInput([50, 30, 70, 20, 40, 60, 80, 65], 'delete', 50);
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
    finalOutcome: frames[state.currentFrame]?.payload.outcome,
  };
}

describe('bst timeline deterministic replay', () => {
  it('keeps frame order stable across speed changes when using seek/resume', () => {
    const slow = runReplaySequence(1200);
    const fast = runReplaySequence(350);

    expect(slow.sequence).toEqual(fast.sequence);
    expect(slow.sequence.at(-1)).toBeGreaterThan(0);
    expect(slow.finalStatus).toBe('completed');
    expect(fast.finalStatus).toBe('completed');
    expect(slow.finalOutcome).toBe('deleted');
    expect(fast.finalOutcome).toBe('deleted');
  });
});
