type TickStoreState = {
  currentStep: number;
  totalSteps: number;
  setStatus: (status: 'completed') => void;
  nextStep: () => void;
};

export type TickResult = 'idle' | 'advanced' | 'completed';

export function advancePlaybackTick(state: TickStoreState): TickResult {
  if (state.totalSteps <= 0) {
    return 'idle';
  }

  if (state.currentStep >= state.totalSteps - 1) {
    state.setStatus('completed');
    return 'completed';
  }

  state.nextStep();
  return 'advanced';
}

