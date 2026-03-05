import { useCallback, useEffect, useReducer } from 'react';
import { createInitialTimelineState, timelineReducer } from './reducer';
import type { TimelineState } from './types';

type TimelineControls = {
  setStatus: (status: TimelineState['status']) => void;
  setSpeed: (speedMs: number) => void;
  setTotalFrames: (totalFrames: number) => void;
  seek: (frameIndex: number) => void;
  play: () => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  reset: () => void;
};

export type TimelinePlayer = TimelineState & TimelineControls;

export function useTimelinePlayer(initialTotalFrames: number): TimelinePlayer {
  const [state, dispatch] = useReducer(timelineReducer, initialTotalFrames, createInitialTimelineState);

  useEffect(() => {
    if (state.status !== 'playing') {
      return;
    }

    const timer = window.setInterval(() => {
      dispatch({ type: 'next' });
    }, state.speedMs);

    return () => window.clearInterval(timer);
  }, [state.status, state.speedMs]);

  const setStatus = useCallback((status: TimelineState['status']) => {
    if (status === 'playing') {
      dispatch({ type: 'play' });
      return;
    }
    if (status === 'idle') {
      dispatch({ type: 'reset' });
      return;
    }
    if (status === 'paused') {
      dispatch({ type: 'pause' });
      return;
    }
    if (status === 'completed') {
      dispatch({ type: 'seek', frameIndex: Number.MAX_SAFE_INTEGER });
      dispatch({ type: 'play' });
    }
  }, []);

  const setSpeed = useCallback((speedMs: number) => {
    dispatch({ type: 'setSpeed', speedMs });
  }, []);

  const setTotalFrames = useCallback((totalFrames: number) => {
    dispatch({ type: 'setTotalFrames', totalFrames });
  }, []);

  const seek = useCallback((frameIndex: number) => {
    dispatch({ type: 'seek', frameIndex });
  }, []);

  const play = useCallback(() => dispatch({ type: 'play' }), []);
  const pause = useCallback(() => dispatch({ type: 'pause' }), []);
  const next = useCallback(() => dispatch({ type: 'next' }), []);
  const prev = useCallback(() => dispatch({ type: 'prev' }), []);
  const reset = useCallback(() => dispatch({ type: 'reset' }), []);

  return {
    ...state,
    setStatus,
    setSpeed,
    setTotalFrames,
    seek,
    play,
    pause,
    next,
    prev,
    reset,
  };
}
