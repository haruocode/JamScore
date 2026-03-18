import { Accidental, BarlineType, Formatter, Renderer, Stave, StaveNote, Voice } from "vexflow";
import type { Measure, NoteDuration, ScoreNote, TrackType } from "@/types/score";
import { durationToBeats, getTrackNotes, sortNotes } from "@/features/score/model/score-helpers";

const MEASURE_WIDTH = 180;
const STAFF_HEIGHT = 160;

const REST_SEGMENTS: Array<{ beats: number; duration: NoteDuration }> = [
  { beats: 4, duration: "whole" },
  { beats: 2, duration: "half" },
  { beats: 1, duration: "quarter" },
  { beats: 0.5, duration: "eighth" },
];

function durationToVex(duration: NoteDuration, isRest = false) {
  const map: Record<NoteDuration, string> = {
    whole: "w",
    half: "h",
    quarter: "q",
    eighth: "8",
  };

  return `${map[duration]}${isRest ? "r" : ""}`;
}

function pitchToVexKey(pitch: string) {
  const match = /^([A-G])(b|#)?(\d)$/.exec(pitch);
  if (!match) {
    throw new Error(`Invalid pitch: ${pitch}`);
  }

  const [, note, accidental = "", octave] = match;
  return {
    key: `${note.toLowerCase()}${accidental}/${octave}`,
    accidental,
  };
}

function decomposeRest(beats: number) {
  const parts: NoteDuration[] = [];
  let remaining = beats;

  for (const segment of REST_SEGMENTS) {
    while (remaining >= segment.beats - 0.0001) {
      parts.push(segment.duration);
      remaining -= segment.beats;
    }
  }

  return parts;
}

function buildTickables(notes: ScoreNote[]) {
  const tickables: StaveNote[] = [];
  let cursor = 0;

  for (const note of sortNotes(notes)) {
    const gap = note.beatOffset - cursor;
    if (gap > 0) {
      for (const duration of decomposeRest(gap)) {
        tickables.push(
          new StaveNote({
            keys: ["b/4"],
            duration: durationToVex(duration, true),
          }),
        );
      }
    }

    const vexPitch = pitchToVexKey(note.pitch);
    const staveNote = new StaveNote({
      keys: [vexPitch.key],
      duration: durationToVex(note.duration),
    });

    if (vexPitch.accidental) {
      staveNote.addModifier(new Accidental(vexPitch.accidental), 0);
    }

    tickables.push(staveNote);
    cursor = note.beatOffset + durationToBeats(note.duration);
  }

  if (cursor < 4) {
    for (const duration of decomposeRest(4 - cursor)) {
      tickables.push(
        new StaveNote({
          keys: ["b/4"],
          duration: durationToVex(duration, true),
        }),
      );
    }
  }

  return tickables;
}

export function renderStaff(params: {
  container: HTMLDivElement;
  measures: Measure[];
  track: TrackType;
  clef: "treble" | "bass";
}) {
  const { container, measures, track, clef } = params;

  const width = measures.length * MEASURE_WIDTH + 24;
  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(width, STAFF_HEIGHT);

  const context = renderer.getContext();
  context.setFont("Arial", 10, "").setBackgroundFillStyle("#fffdf9");

  measures.forEach((measure, index) => {
    const x = 12 + index * MEASURE_WIDTH;
    const stave = new Stave(x, 28, MEASURE_WIDTH);

    if (index === 0) {
      stave.addClef(clef).addTimeSignature("4/4");
    }

    if (index === measures.length - 1) {
      stave.setEndBarType(BarlineType.END);
    }

    stave.setContext(context).draw();

    const voice = new Voice({
      numBeats: 4,
      beatValue: 4,
    });

    voice.addTickables(buildTickables(getTrackNotes(measure, track)));
    new Formatter().joinVoices([voice]).format([voice], MEASURE_WIDTH - 28);
    voice.draw(context, stave);
  });
}
