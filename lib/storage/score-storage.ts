import { sampleScore } from "@/features/score/model/default-score";
import type { Score } from "@/types/score";

export const SCORE_STORAGE_KEY = "jamscore:mvp:score:v1";

export function loadStoredScore() {
  if (typeof window === "undefined") {
    return sampleScore;
  }

  const rawValue = window.localStorage.getItem(SCORE_STORAGE_KEY);
  if (!rawValue) {
    return sampleScore;
  }

  try {
    return JSON.parse(rawValue) as Score;
  } catch {
    return sampleScore;
  }
}

export function saveStoredScore(score: Score) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SCORE_STORAGE_KEY, JSON.stringify(score));
}

export function clearStoredScore() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SCORE_STORAGE_KEY);
}
