import { describe, expect, it } from 'vitest';
import { createInitialTimelineState, timelineReducer } from '../../engine/timeline/reducer';
import { buildQueueTimelineFromInput } from './queueTimelineAdapter';

function runReplaySequence(speedMs: number): { sequence: number[]; finalStatus: string } {
  const frames = buildQueueTimelineFromInput([3, 8, 1], { type: 'enqueue', value: 9 });
  let state = createInitialTimelineState(frames.length);
  const sequence: number[] = [state.currentFrame];

  state = timelineReducer(state, { type: 'setSpeed', speedMs });
  state = timelineReducer(state, { type: 'play' });

  state = timelineReducer(state, { type: 'next' });
  sequence.push(state.currentFrame);

  state = timelineReducer(state, { type: 'pause' });
  state = timelineReducer(state, { type: 'seek', frameIndex: 0 });
  sequence.push(state.currentFrame);
  state = timelineReducer(state, { type: 'play' });

  while (state.status !== 'completed') {
    state = timelineReducer(state, { type: 'next' });
    sequence.push(state.currentFrame);
  }

  return { sequence, finalStatus: state.status };
}

describe('queue timeline deterministic replay', () => {
  it('keeps frame order stable across speed changes when using seek/resume', () => {
    const slow = runReplaySequence(1200);
    const fast = runReplaySequence(350);
    expect(slow.sequence).toEqual(fast.sequence);
    expect(slow.finalStatus).toBe('completed');
    expect(fast.finalStatus).toBe('completed');
  });
});
