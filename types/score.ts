export const NOTE_DURATIONS = ["whole", "half", "quarter", "eighth"] as const;
export const TRACK_TYPES = ["melody", "bass"] as const;
export const TIME_SIGNATURE = "4/4" as const;

export type NoteDuration = (typeof NOTE_DURATIONS)[number];
export type TrackType = (typeof TRACK_TYPES)[number];
export type TimeSignature = typeof TIME_SIGNATURE;

export type ScoreNote = {
  id: string;
  pitch: string;
  duration: NoteDuration;
  beatOffset: number;
};

export type Measure = {
  index: number;
  melodyNotes: ScoreNote[];
  bassNotes: ScoreNote[];
};

export type Score = {
  version: 1;
  title: string;
  tempo: number;
  timeSignature: TimeSignature;
  measures: Measure[];
};

export type AddNoteInput = {
  track: TrackType;
  measureIndex: number;
  pitch: string;
  duration: NoteDuration;
  beatOffset: number;
};
