import type { PlaybackStatus } from '../../types/animation';
import type { TimelineAction, TimelineState } from './types';

const DEFAULT_SPEED_MS = 700;
const MIN_SPEED_MS = 5;

function clampFrame(frameIndex: number, totalFrames: number): number {
  if (totalFrames <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(frameIndex, totalFrames - 1));
}

export function createInitialTimelineState(totalFrames = 0): TimelineState {
  return {
    totalFrames: Math.max(0, totalFrames),
    currentFrame: 0,
    status: 'idle',
    speedMs: DEFAULT_SPEED_MS,
  };
}

export function timelineReducer(state: TimelineState, action: TimelineAction): TimelineState {
  switch (action.type) {
    case 'setTotalFrames': {
      const totalFrames = Math.max(0, action.totalFrames);
      return {
        ...state,
        totalFrames,
        currentFrame: clampFrame(state.currentFrame, totalFrames),
      };
    }
    case 'seek': {
      const currentFrame = clampFrame(action.frameIndex, state.totalFrames);
      const status: PlaybackStatus =
        state.status === 'completed' && currentFrame < Math.max(0, state.totalFrames - 1) ? 'paused' : state.status;
      return { ...state, currentFrame, status };
    }
    case 'play': {
      if (state.totalFrames <= 0) {
        return state;
      }
      const atLastFrame = state.currentFrame >= state.totalFrames - 1;
      return { ...state, status: atLastFrame ? 'completed' : 'playing' };
    }
    case 'pause': {
      if (state.status !== 'playing') {
        return state;
      }
      return { ...state, status: 'paused' };
    }
    case 'next': {
      if (state.totalFrames <= 0) {
        return state;
      }
      const currentFrame = clampFrame(state.currentFrame + 1, state.totalFrames);
      const status: PlaybackStatus = currentFrame >= state.totalFrames - 1 ? 'completed' : state.status;
      return { ...state, currentFrame, status };
    }
    case 'prev': {
      const currentFrame = clampFrame(state.currentFrame - 1, state.totalFrames);
      const status: PlaybackStatus = state.status === 'completed' ? 'paused' : state.status;
      return { ...state, currentFrame, status };
    }
    case 'setSpeed': {
      return { ...state, speedMs: Math.max(MIN_SPEED_MS, action.speedMs) };
    }
    case 'reset': {
      return { ...state, currentFrame: 0, status: 'idle' };
    }
    default: {
      return state;
    }
  }
}
