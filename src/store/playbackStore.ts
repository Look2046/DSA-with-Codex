import { create } from 'zustand';
import type { ModuleMetadata } from '../types/module';

type PlaybackStore = {
  currentModule: ModuleMetadata | null;
  setCurrentModule: (moduleItem: ModuleMetadata | null) => void;
};

export const usePlaybackStore = create<PlaybackStore>((set) => ({
  currentModule: null,
  setCurrentModule: (moduleItem) => set({ currentModule: moduleItem }),
}));
