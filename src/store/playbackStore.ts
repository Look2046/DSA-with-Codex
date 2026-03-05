import { create } from 'zustand';
import { createInitialTimelineState, timelineReducer } from '../engine/timeline/reducer';
import type { TimelineState } from '../engine/timeline/types';
import type { PlaybackStatus } from '../types/animation';
import type { ModuleMetadata } from '../types/module';

type PlaybackStore = {
  currentModule: ModuleMetadata | null;
  totalSteps: number;
  currentStep: number;
  status: PlaybackStatus;
  setStatus: (status: PlaybackStatus) => void;
  setCurrentModule: (moduleItem: ModuleMetadata | null) => void;
  setTotalSteps: (total: number) => void;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  play: () => void;
  pause: () => void;
  reset: () => void;
};

function toTimelineState(state: Pick<PlaybackStore, 'totalSteps' | 'currentStep' | 'status'>): TimelineState {
  return {
    totalFrames: state.totalSteps,
    currentFrame: state.currentStep,
    status: state.status,
    speedMs: createInitialTimelineState().speedMs,
  };
}

function fromTimelineState(next: TimelineState): Pick<PlaybackStore, 'totalSteps' | 'currentStep' | 'status'> {
  return {
    totalSteps: next.totalFrames,
    currentStep: next.currentFrame,
    status: next.status,
  };
}

export const usePlaybackStore = create<PlaybackStore>((set) => ({
  currentModule: null,
  ...fromTimelineState(createInitialTimelineState()),
  setStatus: (status) => set({ status }),

  setCurrentModule: (moduleItem) => {
    set({
      currentModule: moduleItem,
      ...fromTimelineState(createInitialTimelineState()),
    });
  },

  setTotalSteps: (total) => {
    set((state) => {
      const next = timelineReducer(toTimelineState(state), {
        type: 'setTotalFrames',
        totalFrames: total,
      });
      return fromTimelineState(next);
    });
  },

  goToStep: (step) => {
    set((state) => {
      const next = timelineReducer(toTimelineState(state), {
        type: 'seek',
        frameIndex: step,
      });
      return fromTimelineState(next);
    });
  },
  nextStep: () => {
    set((state) => {
      const next = timelineReducer(toTimelineState(state), { type: 'next' });
      return fromTimelineState(next);
    });
  },
  prevStep: () => {
    set((state) => {
      const next = timelineReducer(toTimelineState(state), { type: 'prev' });
      return fromTimelineState(next);
    });
  },

  play: () =>
    set((state) => {
      const next = timelineReducer(toTimelineState(state), { type: 'play' });
      return fromTimelineState(next);
    }),
  pause: () =>
    set((state) => {
      const next = timelineReducer(toTimelineState(state), { type: 'pause' });
      return fromTimelineState(next);
    }),

  reset: () => {
    set((state) => {
      const next = timelineReducer(toTimelineState(state), { type: 'reset' });
      return fromTimelineState(next);
    });
  },
}));
