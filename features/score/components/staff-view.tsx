"use client";

import { useEffect, useRef } from "react";
import type { Measure, TrackType } from "@/types/score";
import { renderStaff } from "@/features/score/rendering/vexflow-helpers";

type StaffViewProps = {
  title: string;
  track: TrackType;
  clef: "treble" | "bass";
  measures: Measure[];
};

export function StaffView({ title, track, clef, measures }: StaffViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    container.innerHTML = "";
    renderStaff({ container, measures, track, clef });
  }, [clef, measures, track]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-panel p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        <span className="text-sm text-slate-500">{clef} clef</span>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white p-2">
        <div ref={containerRef} />
      </div>
    </section>
  );
}
