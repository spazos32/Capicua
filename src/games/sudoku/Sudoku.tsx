"use client";

import { useMemo, useState } from "react";
import { useKeys } from "@/components/useKeys";
import { rngFor } from "@/lib/rng";
import { usePersistentState } from "@/lib/storage";
import type { GameProps } from "..";
import { generateSudoku } from "./generator";

type State = { values: number[]; mistakes: number };

export default function Sudoku({ dateKey, onFinish }: GameProps) {
  const { puzzle, solution } = useMemo(
    () => generateSudoku(rngFor(dateKey, "sudoku")),
    [dateKey],
  );
  const [state, setState] = usePersistentState<State>(dateKey, "sudoku", () => ({
    values: [...puzzle],
    mistakes: 0,
  }));
  const [sel, setSel] = useState<number | null>(null);

  const { values, mistakes } = state;
  const done = values.every((v, i) => v === solution[i]);

  const enter = (n: number) => {
    if (done || sel === null || puzzle[sel]) return;
    const wrong = n !== 0 && n !== solution[sel] && values[sel] !== n;
    const nextValues = values.map((v, i) => (i === sel ? n : v));
    const nextMistakes = mistakes + (wrong ? 1 : 0);
    setState({ values: nextValues, mistakes: nextMistakes });
    if (nextValues.every((v, i) => v === solution[i])) {
      onFinish({
        points: Math.max(20, 100 - nextMistakes * 10),
        share: `Sudoku resuelto ✅\nErrores: ${nextMistakes}`,
      });
    }
  };

  const move = (dr: number, dc: number) =>
    setSel((s) => {
      const cur = s ?? 0;
      const r = Math.min(8, Math.max(0, Math.floor(cur / 9) + dr));
      const c = Math.min(8, Math.max(0, (cur % 9) + dc));
      return r * 9 + c;
    });

  useKeys((k) => {
    if (/^[1-9]$/.test(k)) enter(Number(k));
    else if (k === "Backspace" || k === "Delete" || k === "0") enter(0);
    else if (k === "ArrowUp") move(-1, 0);
    else if (k === "ArrowDown") move(1, 0);
    else if (k === "ArrowLeft") move(0, -1);
    else if (k === "ArrowRight") move(0, 1);
  });

  const selVal = sel !== null ? values[sel] : 0;

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-slate-600">
        Errores: <b className="text-rose-600">{mistakes}</b>
      </p>
      <div data-board="" className="mx-auto grid aspect-square w-full max-w-md grid-cols-9 overflow-hidden rounded-xl border-2 border-slate-800 bg-white shadow-lg">
        {values.map((v, i) => {
          const r = Math.floor(i / 9);
          const c = i % 9;
          const given = puzzle[i] !== 0;
          const wrong = v !== 0 && !given && v !== solution[i];
          const isSel = sel === i;
          const related =
            sel !== null &&
            (Math.floor(sel / 9) === r ||
              sel % 9 === c ||
              (Math.floor(sel / 27) === Math.floor(r / 3) &&
                Math.floor((sel % 9) / 3) === Math.floor(c / 3)));
          const same = selVal !== 0 && v === selVal;
          return (
            <button
              key={i}
              onClick={() => setSel(i)}
              className={`flex items-center justify-center text-lg font-bold sm:text-2xl ${
                c % 3 === 2 && c !== 8 ? "border-r-2 border-r-slate-800" : "border-r border-r-slate-200"
              } ${
                r % 3 === 2 && r !== 8 ? "border-b-2 border-b-slate-800" : "border-b border-b-slate-200"
              } ${
                isSel
                  ? "bg-indigo-300"
                  : same
                    ? "bg-indigo-200"
                    : related
                      ? "bg-indigo-50"
                      : "bg-white"
              } ${given ? "text-slate-900" : wrong ? "text-rose-600" : "text-indigo-600"}`}
            >
              {v || ""}
            </button>
          );
        })}
      </div>
      <div className="mx-auto grid max-w-md grid-cols-5 gap-2 sm:grid-cols-10">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            onClick={() => enter(n)}
            disabled={done}
            className="h-12 rounded-lg bg-white text-xl font-black text-slate-800 shadow ring-1 ring-slate-200 hover:bg-indigo-50 active:scale-95"
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => enter(0)}
          disabled={done}
          aria-label="Borrar"
          className="h-12 rounded-lg bg-white text-xl shadow ring-1 ring-slate-200 hover:bg-rose-50 active:scale-95"
        >
          ⌫
        </button>
      </div>
    </div>
  );
}
