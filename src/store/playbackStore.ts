import { create } from 'zustand';
import type { PlaybackStatus } from '../types/animation';
import type { ModuleMetadata } from '../types/module';

type PlaybackStore = {
  currentModule: ModuleMetadata | null;
  totalSteps: number;
  currentStep: number;
  status: PlaybackStatus;
  setCurrentModule: (moduleItem: ModuleMetadata | null) => void;
  setTotalSteps: (total: number) => void;
  goToStep: (step: number) => void;
  play: () => void;
  pause: () => void;
  reset: () => void;
};

export const usePlaybackStore = create<PlaybackStore>((set) => ({
  currentModule: null,
  totalSteps: 0,
  currentStep: 0,
  status: 'idle',

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

  play: () => set({ status: 'playing' }),
  pause: () => set({ status: 'paused' }),

  reset: () => {
    set({ currentStep: 0, status: 'idle' });
  },
}));
