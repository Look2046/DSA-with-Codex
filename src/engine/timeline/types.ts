import type { PlaybackStatus } from '../../types/animation';

export type TimelineFrame<TPayload> = {
  index: number;
  payload: TPayload;
  logicalStepIndex: number;
};

export type TimelineState = {
  totalFrames: number;
  currentFrame: number;
  status: PlaybackStatus;
  speedMs: number;
};

export type TimelineAction =
  | { type: 'setTotalFrames'; totalFrames: number }
  | { type: 'seek'; frameIndex: number }
  | { type: 'play' }
  | { type: 'pause' }
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'setSpeed'; speedMs: number }
  | { type: 'reset' };

