"use client";

import { useEffect, useMemo, useState } from "react";
import { sampleScore } from "@/features/score/model/default-score";
import {
  addNoteToScore,
  deleteNoteFromScore,
  sortNotes,
  updateScoreTempo,
} from "@/features/score/model/score-helpers";
import { playScore, stopScore } from "@/features/score/playback/playback-engine";
import { StaffView } from "@/features/score/components/staff-view";
import { clearStoredScore, loadStoredScore, saveStoredScore } from "@/lib/storage/score-storage";
import type { NoteDuration, Score, TrackType } from "@/types/score";

const pitchOptions = [
  "C2",
  "D2",
  "E2",
  "F2",
  "G2",
  "A2",
  "B2",
  "C3",
  "D3",
  "E3",
  "F3",
  "G3",
  "A3",
  "B3",
  "C4",
  "D4",
  "E4",
  "F4",
  "G4",
  "A4",
  "B4",
  "C5",
] as const;

const durationOptions: NoteDuration[] = ["whole", "half", "quarter", "eighth"];
const beatOptions = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5];
const trackOptions: TrackType[] = ["melody", "bass"];

type FormState = {
  track: TrackType;
  pitch: string;
  duration: NoteDuration;
  measureIndex: number;
  beatOffset: number;
};

const initialFormState: FormState = {
  track: "melody",
  pitch: "C4",
  duration: "quarter",
  measureIndex: 0,
  beatOffset: 0,
};

export function ScoreEditor() {
  const [score, setScore] = useState<Score>(sampleScore);
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [message, setMessage] = useState<string>("Loaded sample score.");
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setScore(loadStoredScore());
  }, []);

  useEffect(() => {
    return () => {
      stopScore();
    };
  }, []);

  const selectedNotes = useMemo(() => {
    const measure = score.measures[formState.measureIndex];
    if (!measure) {
      return [];
    }

    return sortNotes(formState.track === "melody" ? measure.melodyNotes : measure.bassNotes);
  }, [formState.measureIndex, formState.track, score.measures]);

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setFormState((current) => ({ ...current, [key]: value }));
  }

  function handleAddNote() {
    const result = addNoteToScore(score, formState);
    setScore(result.score);
    setMessage(result.error ?? "Note added.");
  }

  function handleDeleteNote(noteId: string) {
    const nextScore = deleteNoteFromScore(score, formState.track, formState.measureIndex, noteId);
    setScore(nextScore);
    setMessage("Note removed.");
  }

  function handleTempoChange(nextTempo: number) {
    const result = updateScoreTempo(score, nextTempo);
    setScore(result.score);
    setMessage(result.error ?? "Tempo updated.");
  }

  async function handlePlay() {
    try {
      await playScore(score);
      setIsPlaying(true);
      setMessage("Playback started.");
    } catch (error) {
      setIsPlaying(false);
      setMessage(
        error instanceof Error ? error.message : "Playback could not start in this browser.",
      );
    }
  }

  function handleStop() {
    stopScore();
    setIsPlaying(false);
    setMessage("Playback stopped.");
  }

  function handleSave() {
    saveStoredScore(score);
    setMessage("Score saved to local storage.");
  }

  function handleReset() {
    handleStop();
    clearStoredScore();
    setScore(sampleScore);
    setFormState(initialFormState);
    setMessage("Reset to the default sample score.");
  }

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-3xl border border-slate-200 bg-panel px-6 py-5 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">JamScore MVP</p>
          <div className="mt-2 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-ink">Melody and Bass Score Editor</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Minimal 4/4 score editing with separate melody and bass tracks, browser rendering,
                local save, and deterministic playback.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-900 px-4 py-3 text-sm text-slate-50">
              {message}
            </div>
          </div>
        </header>

        <section className="grid gap-4 rounded-3xl border border-slate-200 bg-panel p-5 shadow-sm lg:grid-cols-[2fr_1fr]">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Tempo
              <input
                className="rounded-xl border border-slate-300 bg-white px-3 py-2"
                type="number"
                min={40}
                max={220}
                value={score.tempo}
                onChange={(event) => handleTempoChange(Number(event.target.value))}
              />
            </label>
            <button
              className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white"
              onClick={handlePlay}
              type="button"
            >
              {isPlaying ? "Restart" : "Play"}
            </button>
            <button
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
              onClick={handleStop}
              type="button"
            >
              Stop
            </button>
            <button
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
              onClick={handleSave}
              type="button"
            >
              Save
            </button>
            <button
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
              onClick={handleReset}
              type="button"
            >
              Reset
            </button>
          </div>

          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
            Score data stays serializable and VexFlow/Tone objects are kept outside app state, so
            the note model is still easy to adapt for future Yjs document updates.
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_360px]">
          <section className="grid gap-6">
            <StaffView title="Melody Staff" track="melody" clef="treble" measures={score.measures} />
            <StaffView title="Bass Staff" track="bass" clef="bass" measures={score.measures} />
          </section>

          <aside className="rounded-3xl border border-slate-200 bg-panel p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-ink">Note Editor</h2>
            <p className="mt-2 text-sm text-slate-600">
              Add one monophonic note at a time to melody or bass. Overlapping notes in the same
              track are rejected.
            </p>

            <div className="mt-5 grid gap-4">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Track
                <select
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2"
                  value={formState.track}
                  onChange={(event) => updateForm("track", event.target.value as TrackType)}
                >
                  {trackOptions.map((track) => (
                    <option key={track} value={track}>
                      {track}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Pitch
                <select
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2"
                  value={formState.pitch}
                  onChange={(event) => updateForm("pitch", event.target.value)}
                >
                  {pitchOptions.map((pitch) => (
                    <option key={pitch} value={pitch}>
                      {pitch}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Duration
                <select
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2"
                  value={formState.duration}
                  onChange={(event) =>
                    updateForm("duration", event.target.value as FormState["duration"])
                  }
                >
                  {durationOptions.map((duration) => (
                    <option key={duration} value={duration}>
                      {duration}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Measure
                <select
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2"
                  value={formState.measureIndex}
                  onChange={(event) => updateForm("measureIndex", Number(event.target.value))}
                >
                  {score.measures.map((measure) => (
                    <option key={measure.index} value={measure.index}>
                      Measure {measure.index + 1}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Beat Position
                <select
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2"
                  value={formState.beatOffset}
                  onChange={(event) => updateForm("beatOffset", Number(event.target.value))}
                >
                  {beatOptions.map((beat) => (
                    <option key={beat} value={beat}>
                      {beat}
                    </option>
                  ))}
                </select>
              </label>

              <button
                className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
                onClick={handleAddNote}
                type="button"
              >
                Add Note
              </button>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Selected Measure Notes
                </h3>
                <span className="text-sm text-slate-500">
                  {formState.track} · measure {formState.measureIndex + 1}
                </span>
              </div>

              <div className="mt-3 flex flex-col gap-2">
                {selectedNotes.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500">
                    No notes in this track and measure yet.
                  </div>
                ) : (
                  selectedNotes.map((note) => (
                    <div
                      key={note.id}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm"
                    >
                      <span>
                        {note.pitch} · {note.duration} · beat {note.beatOffset}
                      </span>
                      <button
                        className="rounded-lg border border-slate-300 px-3 py-1 text-slate-700"
                        onClick={() => handleDeleteNote(note.id)}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
