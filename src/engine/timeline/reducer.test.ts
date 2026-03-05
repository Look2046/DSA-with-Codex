import { describe, expect, it } from 'vitest';
import { createInitialTimelineState, timelineReducer } from './reducer';

describe('timelineReducer', () => {
  it('clamps seek into available frame range', () => {
    const initial = createInitialTimelineState(5);
    const afterSeek = timelineReducer(initial, { type: 'seek', frameIndex: 99 });
    expect(afterSeek.currentFrame).toBe(4);
  });

  it('marks completed when stepping to last frame', () => {
    const initial = {
      ...createInitialTimelineState(3),
      currentFrame: 1,
      status: 'playing' as const,
    };
    const next = timelineReducer(initial, { type: 'next' });
    expect(next.currentFrame).toBe(2);
    expect(next.status).toBe('completed');
  });

  it('turns completed into paused when moving back', () => {
    const initial = {
      ...createInitialTimelineState(3),
      currentFrame: 2,
      status: 'completed' as const,
    };
    const prev = timelineReducer(initial, { type: 'prev' });
    expect(prev.currentFrame).toBe(1);
    expect(prev.status).toBe('paused');
  });

  it('clamps current frame when total frames shrink', () => {
    const initial = {
      ...createInitialTimelineState(10),
      currentFrame: 8,
    };
    const resized = timelineReducer(initial, { type: 'setTotalFrames', totalFrames: 3 });
    expect(resized.currentFrame).toBe(2);
    expect(resized.totalFrames).toBe(3);
  });

  it('resets to idle and first frame', () => {
    const initial = {
      ...createInitialTimelineState(6),
      currentFrame: 4,
      status: 'playing' as const,
    };
    const reset = timelineReducer(initial, { type: 'reset' });
    expect(reset.currentFrame).toBe(0);
    expect(reset.status).toBe('idle');
  });
});

