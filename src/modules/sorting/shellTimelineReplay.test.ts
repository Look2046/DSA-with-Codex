import { describe, expect, it } from 'vitest';
import { createInitialTimelineState, timelineReducer } from '../../engine/timeline/reducer';
import { buildShellSortTimelineFromInput } from './shellTimelineAdapter';
import type { ShellSortStep } from './shellSort';

type ShellReplayFrame = Pick<ShellSortStep, 'action' | 'indices' | 'gap' | 'holeIndex' | 'keyLifted'>;

function runReplaySequence(speedMs: number): { sequence: number[]; finalStatus: string; frames: ShellReplayFrame[] } {
  const frames = buildShellSortTimelineFromInput([23, 12, 1, 8, 34, 54, 2, 3]);
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
        gap: payload.gap,
        holeIndex: payload.holeIndex,
        keyLifted: payload.keyLifted,
      };
    }),
  };
}

describe('shell timeline deterministic replay', () => {
  it('keeps frame order stable across speed changes when using seek/resume', () => {
    const slow = runReplaySequence(1200);
    const fast = runReplaySequence(350);

    expect(slow.sequence).toEqual(fast.sequence);
    expect(slow.sequence.at(-1)).toBeGreaterThan(0);
    expect(slow.finalStatus).toBe('completed');
    expect(fast.finalStatus).toBe('completed');
  });

  it('preserves gap-temp shift choreography after seek-resume replay', () => {
    const replay = runReplaySequence(450);
    const liftIndices = replay.frames
      .map((frame, index) => (frame.action === 'lift' ? index : -1))
      .filter((index) => index >= 0);

    expect(liftIndices.length).toBeGreaterThan(0);
    for (const liftIndex of liftIndices) {
      expect(replay.frames[liftIndex + 1]?.action).toBe('shift');
      expect(replay.frames[liftIndex].holeIndex).toBe(replay.frames[liftIndex].indices[0]);
      expect(replay.frames[liftIndex].keyLifted).toBe(true);
    }

    replay.frames.forEach((frame, index) => {
      if (frame.action !== 'shift') {
        return;
      }
      const nextFrame = replay.frames[index + 1];
      expect(nextFrame).toBeDefined();
      if (!nextFrame) {
        return;
      }

      expect(['compare', 'insert']).toContain(nextFrame.action);
      const holePosition = frame.indices[0];
      if (nextFrame.action === 'compare') {
        expect(nextFrame.holeIndex).toBe(holePosition);
        expect(nextFrame.indices[1]).toBe(holePosition);
        expect(nextFrame.indices[0]).toBe(holePosition - frame.gap);
      } else {
        expect(nextFrame.holeIndex).toBeNull();
        expect(nextFrame.indices[0]).toBe(holePosition);
      }
    });
  });
});
