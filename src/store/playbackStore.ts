import { create } from 'zustand';
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

export const usePlaybackStore = create<PlaybackStore>((set) => ({
  currentModule: null,
  totalSteps: 0,
  currentStep: 0,
  status: 'idle',
  setStatus: (status) => set({ status }),

  setCurrentModule: (moduleItem) => {
    set({
      currentModule: moduleItem,
      totalSteps: 0,
      currentStep: 0,
      status: 'idle',
    });
  },

  setTotalSteps: (total) => {
    set({ totalSteps: Math.max(0, total) });
  },

  goToStep: (step) => {
    set((state) => {
      const clamped = Math.max(0, Math.min(step, state.totalSteps > 0 ? state.totalSteps - 1 : 0));
      return { currentStep: clamped };
    });
  },
  nextStep: () => {
    set((state) => {
      if (state.totalSteps === 0) {
        return state;
      }
      const next = Math.min(state.currentStep + 1, state.totalSteps - 1);
      const nextStatus: PlaybackStatus = next >= state.totalSteps - 1 ? 'completed' : state.status;
      return { currentStep: next, status: nextStatus };
    });
  },
  prevStep: () => {
    set((state) => {
      const prev = Math.max(state.currentStep - 1, 0);
      const nextStatus: PlaybackStatus = state.status === 'completed' ? 'paused' : state.status;
      return { currentStep: prev, status: nextStatus };
    });
  },

  play: () => set({ status: 'playing' }),
  pause: () => set({ status: 'paused' }),

  reset: () => {
    set({ currentStep: 0, status: 'idle' });
  },
}));
