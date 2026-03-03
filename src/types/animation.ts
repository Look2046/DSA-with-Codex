export type HighlightType = 'default' | 'comparing' | 'swapping' | 'sorted' | 'visiting' | 'matched' | 'moving' | 'new-node';

export type HighlightEntry = {
  index: number;
  type: HighlightType;
};

export type AnimationStep = {
  description: string;
  codeLines: number[];
  highlights: HighlightEntry[];
};

export type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'completed';
