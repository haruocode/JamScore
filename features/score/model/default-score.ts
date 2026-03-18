import type { Score } from "@/types/score";

export const sampleScore: Score = {
  version: 1,
  title: "MVP Demo",
  tempo: 96,
  timeSignature: "4/4",
  measures: [
    {
      index: 0,
      melodyNotes: [
        { id: "m1", pitch: "C4", duration: "quarter", beatOffset: 0 },
        { id: "m2", pitch: "E4", duration: "quarter", beatOffset: 1 },
        { id: "m3", pitch: "G4", duration: "quarter", beatOffset: 2 },
        { id: "m4", pitch: "A4", duration: "quarter", beatOffset: 3 },
      ],
      bassNotes: [
        { id: "b1", pitch: "C2", duration: "half", beatOffset: 0 },
        { id: "b2", pitch: "G2", duration: "half", beatOffset: 2 },
      ],
    },
    {
      index: 1,
      melodyNotes: [
        { id: "m5", pitch: "G4", duration: "quarter", beatOffset: 0 },
        { id: "m6", pitch: "E4", duration: "quarter", beatOffset: 1 },
        { id: "m7", pitch: "D4", duration: "quarter", beatOffset: 2 },
        { id: "m8", pitch: "C4", duration: "quarter", beatOffset: 3 },
      ],
      bassNotes: [
        { id: "b3", pitch: "A2", duration: "half", beatOffset: 0 },
        { id: "b4", pitch: "E2", duration: "half", beatOffset: 2 },
      ],
    },
    {
      index: 2,
      melodyNotes: [
        { id: "m9", pitch: "F4", duration: "half", beatOffset: 0 },
        { id: "m10", pitch: "E4", duration: "quarter", beatOffset: 2 },
        { id: "m11", pitch: "D4", duration: "quarter", beatOffset: 3 },
      ],
      bassNotes: [
        { id: "b5", pitch: "F2", duration: "half", beatOffset: 0 },
        { id: "b6", pitch: "C2", duration: "half", beatOffset: 2 },
      ],
    },
    {
      index: 3,
      melodyNotes: [{ id: "m12", pitch: "C4", duration: "whole", beatOffset: 0 }],
      bassNotes: [{ id: "b7", pitch: "C2", duration: "whole", beatOffset: 0 }],
    },
  ],
};
