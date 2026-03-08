import { describe, expect, it, vi } from 'vitest';
import { advancePlaybackTick } from './tick';

describe('advancePlaybackTick', () => {
  it('returns idle when timeline has no steps', () => {
    const nextStep = vi.fn();
    const setStatus = vi.fn();

    const result = advancePlaybackTick({
      currentStep: 0,
      totalSteps: 0,
      nextStep,
      setStatus,
    });

    expect(result).toBe('idle');
    expect(nextStep).not.toHaveBeenCalled();
    expect(setStatus).not.toHaveBeenCalled();
  });

  it('advances to next step before completion', () => {
    const nextStep = vi.fn();
    const setStatus = vi.fn();

    const result = advancePlaybackTick({
      currentStep: 1,
      totalSteps: 4,
      nextStep,
      setStatus,
    });

    expect(result).toBe('advanced');
    expect(nextStep).toHaveBeenCalledTimes(1);
    expect(setStatus).not.toHaveBeenCalled();
  });

  it('marks completed when already at final step', () => {
    const nextStep = vi.fn();
    const setStatus = vi.fn();

    const result = advancePlaybackTick({
      currentStep: 3,
      totalSteps: 4,
      nextStep,
      setStatus,
    });

    expect(result).toBe('completed');
    expect(setStatus).toHaveBeenCalledWith('completed');
    expect(nextStep).not.toHaveBeenCalled();
  });
});

