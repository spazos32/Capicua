"use client";

import { useMemo, useState } from "react";
import { Keyboard } from "@/components/Keyboard";
import { useKeys } from "@/components/useKeys";
import { rngFor } from "@/lib/rng";
import { usePersistentState } from "@/lib/storage";
import type { GameProps } from "..";
import { generateCrossword, type Dir, type Entry } from "./generator";

type State = { letters: string[]; checks: number };

export default function Crucigrama({ dateKey, onFinish }: GameProps) {
  const cw = useMemo(() => generateCrossword(rngFor(dateKey, "crucigrama")), [dateKey]);
  const { size, solution, numbers, entries } = cw;

  const [state, setState] = usePersistentState<State>(dateKey, "crucigrama", () => ({
    letters: Array(size * size).fill(""),
    checks: 0,
  }));
  const { letters, checks } = state;
  const [sel, setSel] = useState<number>(() => {
    const e = entries[0];
    return e.row * size + e.col;
  });
  const [dir, setDir] = useState<Dir>(() => entries[0].dir);
  const [flagged, setFlagged] = useState<Set<number>>(new Set());

  // índice: celda + dirección -> pista
  const cellEntry = useMemo(() => {
    const m: Record<Dir, Map<number, Entry>> = { across: new Map(), down: new Map() };
    for (const e of entries) {
      for (let k = 0; k < e.answer.length; k++) {
        const r = e.row + (e.dir === "down" ? k : 0);
        const c = e.col + (e.dir === "across" ? k : 0);
        m[e.dir].set(r * size + c, e);
      }
    }
    return m;
  }, [entries, size]);

  const cellsOf = (e: Entry) =>
    Array.from({ length: e.answer.length }, (_, k) =>
      (e.row + (e.dir === "down" ? k : 0)) * size + e.col + (e.dir === "across" ? k : 0),
    );

  const done = solution.every((s, i) => s === null || letters[i] === s);
  const active = cellEntry[dir].get(sel) ?? cellEntry[dir === "across" ? "down" : "across"].get(sel);
  const activeCells = new Set(active ? cellsOf(active) : []);

  const select = (i: number) => {
    if (solution[i] === null) return;
    if (i === sel) {
      const other: Dir = dir === "across" ? "down" : "across";
      if (cellEntry[other].has(i)) setDir(other);
      return;
    }
    setSel(i);
    if (!cellEntry[dir].has(i)) setDir(dir === "across" ? "down" : "across");
  };

  const selectEntry = (e: Entry) => {
    setDir(e.dir);
    setSel(e.row * size + e.col);
  };

  const finishIfDone = (next: string[], used: number) => {
    if (solution.every((s, i) => s === null || next[i] === s)) {
      onFinish({
        points: Math.max(40, 100 - used * 10),
        share: `Crucigrama ${size}×${size} resuelto ✅\nRevisiones: ${used}`,
      });
    }
  };

  const type = (letter: string) => {
    if (done || solution[sel] === null) return;
    const next = letters.map((l, i) => (i === sel ? letter : l));
    setState({ letters: next, checks });
    setFlagged((f) => {
      if (!f.has(sel)) return f;
      const n = new Set(f);
      n.delete(sel);
      return n;
    });
    const e = cellEntry[dir].get(sel);
    if (e) {
      const cells = cellsOf(e);
      const idx = cells.indexOf(sel);
      if (idx < cells.length - 1) setSel(cells[idx + 1]);
    }
    finishIfDone(next, checks);
  };

  const back = () => {
    if (done) return;
    if (letters[sel]) {
      setState({ letters: letters.map((l, i) => (i === sel ? "" : l)), checks });
      return;
    }
    const e = cellEntry[dir].get(sel);
    if (!e) return;
    const cells = cellsOf(e);
    const idx = cells.indexOf(sel);
    if (idx > 0) {
      const prev = cells[idx - 1];
      setSel(prev);
      setState({ letters: letters.map((l, i) => (i === prev ? "" : l)), checks });
    }
  };

  const arrow = (dr: number, dc: number) => {
    const r = Math.floor(sel / size);
    const c = sel % size;
    for (let step = 1; step < size; step++) {
      const nr = r + dr * step;
      const nc = c + dc * step;
      if (nr < 0 || nc < 0 || nr >= size || nc >= size) return;
      if (solution[nr * size + nc] !== null) {
        setSel(nr * size + nc);
        if (dr !== 0 && cellEntry.down.has(nr * size + nc)) setDir("down");
        if (dc !== 0 && cellEntry.across.has(nr * size + nc)) setDir("across");
        return;
      }
    }
  };

  const nextEntry = () => {
    if (!active) return;
    const i = entries.indexOf(active);
    selectEntry(entries[(i + 1) % entries.length]);
  };

  useKeys((k) => {
    if (/^[A-Z]$/.test(k)) type(k);
    else if (k === "Backspace" || k === "Delete") back();
    else if (k === "ArrowUp") arrow(-1, 0);
    else if (k === "ArrowDown") arrow(1, 0);
    else if (k === "ArrowLeft") arrow(0, -1);
    else if (k === "ArrowRight") arrow(0, 1);
    else if (k === "Tab") nextEntry();
    else if (k === " " || k === "Enter") select(sel);
  }, !done);

  const check = () => {
    if (done) return;
    const wrong = new Set<number>();
    letters.forEach((l, i) => {
      if (l && solution[i] !== l) wrong.add(i);
    });
    setFlagged(wrong);
    setState({ letters, checks: checks + 1 });
  };

  const entryDone = (e: Entry) => cellsOf(e).every((i) => letters[i] === solution[i]);

  const list = (d: Dir, title: string) => (
    <div>
      <h3 className="mb-1 text-sm font-black uppercase tracking-wide text-slate-600">
        {title}
      </h3>
      <ul className="space-y-1">
        {entries
          .filter((e) => e.dir === d)
          .map((e) => (
            <li key={`${e.dir}${e.number}`}>
              <button
                onClick={() => selectEntry(e)}
                className={`w-full rounded-lg px-2 py-1 text-left text-sm ${
                  active === e ? "bg-indigo-100 font-semibold" : "hover:bg-white"
                } ${entryDone(e) ? "text-slate-600 line-through" : "text-slate-800"}`}
              >
                <b className="mr-1 text-indigo-600">{e.number}.</b>
                {e.clue} <span className="text-slate-400">({e.answer.length})</span>
              </button>
            </li>
          ))}
      </ul>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="mx-auto min-h-14 max-w-xl rounded-xl bg-white px-3 py-2 text-sm shadow ring-1 ring-slate-200">
        {active ? (
          <>
            <b className="text-indigo-600">
              {active.number} {active.dir === "across" ? "Horizontal" : "Vertical"}
            </b>{" "}
            · {active.clue} ({active.answer.length})
          </>
        ) : (
          "Elegí una casilla"
        )}
      </div>

      <div
        data-board="" className="mx-auto grid w-full max-w-xl overflow-hidden rounded-lg border-2 border-slate-800 bg-slate-800 shadow-lg"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`, gap: 1 }}
      >
        {solution.map((s, i) => {
          if (s === null) return <div key={i} className="aspect-square bg-slate-800" />;
          const isSel = i === sel;
          const wrong = flagged.has(i);
          return (
            <button
              key={i}
              onClick={() => select(i)}
              className={`relative flex aspect-square items-center justify-center text-sm font-bold uppercase sm:text-xl ${
                isSel
                  ? "bg-amber-300"
                  : activeCells.has(i)
                    ? "bg-indigo-100"
                    : "bg-white"
              } ${wrong ? "text-rose-600" : "text-slate-900"}`}
            >
              {numbers[i] > 0 && (
                <span className="absolute left-0.5 top-0 text-[8px] font-semibold leading-tight text-slate-600 sm:text-[10px]">
                  {numbers[i]}
                </span>
              )}
              {letters[i]}
            </button>
          );
        })}
      </div>

      <div className="flex justify-center gap-2">
        <button
          onClick={check}
          disabled={done}
          className="min-h-11 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow ring-1 ring-slate-200 hover:bg-slate-50"
        >
          Revisar errores (−10 pts)
        </button>
        <span className="self-center text-xs text-slate-600">Revisiones: {checks}</span>
      </div>

      <Keyboard onKey={type} onBack={back} />

      <div className="grid gap-4 pt-2 sm:grid-cols-2">
        {list("across", "Horizontales")}
        {list("down", "Verticales")}
      </div>
    </div>
  );
}
