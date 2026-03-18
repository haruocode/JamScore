import * as Tone from "tone";
import type { Score } from "@/types/score";
import { durationToBeats } from "@/features/score/model/score-helpers";

type EngineState = {
  melody: Tone.PolySynth | null;
  bass: Tone.MonoSynth | null;
};

const engineState: EngineState = {
  melody: null,
  bass: null,
};

function createSynths() {
  engineState.melody?.dispose();
  engineState.bass?.dispose();

  engineState.melody = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: { attack: 0.02, decay: 0.1, sustain: 0.5, release: 0.25 },
  }).toDestination();

  engineState.bass = new Tone.MonoSynth({
    oscillator: { type: "square" },
    filter: { Q: 2, type: "lowpass", rolloff: -24 },
    envelope: { attack: 0.02, decay: 0.2, sustain: 0.6, release: 0.3 },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.3,
      release: 0.4,
      baseFrequency: 120,
      octaves: 2,
    },
  }).toDestination();
}

export async function playScore(score: Score) {
  await Tone.start();

  stopScore();
  createSynths();

  Tone.Transport.bpm.value = score.tempo;
  Tone.Transport.position = 0;

  for (const [measureIndex, measure] of score.measures.entries()) {
    for (const note of measure.melodyNotes) {
      const start = measureIndex * 4 + note.beatOffset;
      Tone.Transport.schedule((time) => {
        engineState.melody?.triggerAttackRelease(
          note.pitch,
          durationToBeats(note.duration) * (60 / score.tempo),
          time,
        );
      }, start * (60 / score.tempo));
    }

    for (const note of measure.bassNotes) {
      const start = measureIndex * 4 + note.beatOffset;
      Tone.Transport.schedule((time) => {
        engineState.bass?.triggerAttackRelease(
          note.pitch,
          durationToBeats(note.duration) * (60 / score.tempo),
          time,
        );
      }, start * (60 / score.tempo));
    }
  }

  Tone.Transport.start();
}

export function stopScore() {
  Tone.Transport.stop();
  Tone.Transport.cancel();
  Tone.Transport.position = 0;
  engineState.melody?.dispose();
  engineState.bass?.dispose();
  engineState.melody = null;
  engineState.bass = null;
}
