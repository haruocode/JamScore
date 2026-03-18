import type {
  AddNoteInput,
  Measure,
  NoteDuration,
  Score,
  ScoreNote,
  TrackType,
} from "@/types/score";

const DURATION_TO_BEATS: Record<NoteDuration, number> = {
  whole: 4,
  half: 2,
  quarter: 1,
  eighth: 0.5,
};

export function durationToBeats(duration: NoteDuration) {
  return DURATION_TO_BEATS[duration];
}

export function durationToToneValue(duration: NoteDuration) {
  const map: Record<NoteDuration, string> = {
    whole: "1n",
    half: "2n",
    quarter: "4n",
    eighth: "8n",
  };

  return map[duration];
}

export function isValidTempo(tempo: number) {
  return Number.isFinite(tempo) && tempo >= 40 && tempo <= 220;
}

export function sortNotes(notes: ScoreNote[]) {
  return [...notes].sort((left, right) => left.beatOffset - right.beatOffset);
}

export function getTrackNotes(measure: Measure, track: TrackType) {
  return track === "melody" ? measure.melodyNotes : measure.bassNotes;
}

function setTrackNotes(measure: Measure, track: TrackType, notes: ScoreNote[]): Measure {
  return track === "melody"
    ? { ...measure, melodyNotes: notes }
    : { ...measure, bassNotes: notes };
}

export function validatePitch(pitch: string) {
  return /^[A-G](#|b)?[2-5]$/.test(pitch);
}

export function validateBeatOffset(beatOffset: number) {
  return beatOffset >= 0 && beatOffset <= 3.5 && Number.isInteger(beatOffset * 2);
}

export function canPlaceNote(notes: ScoreNote[], nextNote: Omit<ScoreNote, "id">) {
  if (!validatePitch(nextNote.pitch) || !validateBeatOffset(nextNote.beatOffset)) {
    return false;
  }

  const noteEnd = nextNote.beatOffset + durationToBeats(nextNote.duration);
  if (noteEnd > 4) {
    return false;
  }

  return notes.every((existingNote) => {
    const existingStart = existingNote.beatOffset;
    const existingEnd = existingStart + durationToBeats(existingNote.duration);

    return noteEnd <= existingStart || nextNote.beatOffset >= existingEnd;
  });
}

function createNoteId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function addNoteToScore(score: Score, input: AddNoteInput) {
  const targetMeasure = score.measures[input.measureIndex];
  if (!targetMeasure) {
    return { score, error: "Selected measure does not exist." };
  }

  const currentNotes = getTrackNotes(targetMeasure, input.track);
  const noteData = {
    pitch: input.pitch,
    duration: input.duration,
    beatOffset: input.beatOffset,
  };

  if (!canPlaceNote(currentNotes, noteData)) {
    return { score, error: "Note overlaps another note or exceeds the bar." };
  }

  const nextNote: ScoreNote = {
    id: createNoteId(),
    ...noteData,
  };

  const measures = score.measures.map((measure, index) => {
    if (index !== input.measureIndex) {
      return measure;
    }

    return setTrackNotes(measure, input.track, sortNotes([...currentNotes, nextNote]));
  });

  return { score: { ...score, measures }, error: null };
}

export function deleteNoteFromScore(
  score: Score,
  track: TrackType,
  measureIndex: number,
  noteId: string,
) {
  const measures = score.measures.map((measure, index) => {
    if (index !== measureIndex) {
      return measure;
    }

    const nextNotes = getTrackNotes(measure, track).filter((note) => note.id !== noteId);
    return setTrackNotes(measure, track, nextNotes);
  });

  return { ...score, measures };
}

export function updateScoreTempo(score: Score, tempo: number) {
  if (!isValidTempo(tempo)) {
    return { score, error: "Tempo must stay between 40 and 220 BPM." };
  }

  return { score: { ...score, tempo }, error: null };
}
