"use client";

import { useMemo, useState } from "react";
import { hashString, rngFor, shuffle } from "@/lib/rng";
import { usePersistentState } from "@/lib/storage";
import type { GameProps } from "..";
import { PUZZLES } from "./puzzles";

const MAX_MISTAKES = 4;
const COLORS = [
  "bg-yellow-300 text-yellow-950",
  "bg-emerald-300 text-emerald-950",
  "bg-sky-300 text-sky-950",
  "bg-purple-300 text-purple-950",
];
const SQUARES = ["🟨", "🟩", "🟦", "🟪"];

type State = { solved: number[]; mistakes: number; order: string[]; log: number[] };

export default function Conexiones({ dateKey, onFinish }: GameProps) {
  const groups = PUZZLES[hashString(`${dateKey}:conexiones`) % PUZZLES.length];
  const allWords = useMemo(() => groups.flatMap((g) => g.words), [groups]);
  const [state, setState] = usePersistentState<State>(dateKey, "conexiones", () => ({
    solved: [],
    mistakes: 0,
    order: shuffle(allWords, rngFor(dateKey, "conexiones-orden")),
    log: [],
  }));
  const [picked, setPicked] = useState<string[]>([]);
  const [msg, setMsg] = useState("");
  const { solved, mistakes, order, log } = state;

  const lost = mistakes >= MAX_MISTAKES;
  const won = solved.length === 4;
  const over = lost || won;

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(""), 2000);
  };

  const groupOf = (w: string) => groups.findIndex((g) => g.words.includes(w as never));
  const solvedWords = new Set(solved.flatMap((gi) => groups[gi].words as string[]));
  const remaining = order.filter((w) => !solvedWords.has(w));

  const toggle = (w: string) => {
    if (over) return;
    setPicked((p) => (p.includes(w) ? p.filter((x) => x !== w) : p.length < 4 ? [...p, w] : p));
  };

  const finish = (s: State) => {
    const w = s.solved.length === 4;
    const rows = s.log.map((g) => (g < 0 ? "⬛⬛⬛⬛" : SQUARES[g].repeat(4))).join("\n");
    onFinish({
      points: w
        ? Math.max(40, 100 - s.mistakes * 15)
        : s.solved.length * 15,
      share: `Conexiones ${w ? "✅" : "❌"}\n${rows}`,
    });
  };

  const submit = () => {
    if (picked.length !== 4 || over) return;
    const counts = [0, 0, 0, 0];
    picked.forEach((w) => counts[groupOf(w)]++);
    const gi = counts.findIndex((n) => n === 4);
    let next: State;
    if (gi >= 0) {
      next = { ...state, solved: [...solved, gi], log: [...log, gi] };
    } else {
      if (Math.max(...counts) === 3) flash("¡Casi! Te falta una");
      else flash("Ese grupo no es");
      next = { ...state, mistakes: mistakes + 1, log: [...log, -1] };
    }
    // si pierde, se revelan los grupos restantes en orden
    if (next.mistakes >= MAX_MISTAKES) {
      const rest = [0, 1, 2, 3].filter((g) => !next.solved.includes(g));
      next = { ...next, solved: [...next.solved, ...rest] };
      setState(next);
      finish({ ...next, solved: next.solved.slice(0, next.solved.length - rest.length) });
    } else {
      setState(next);
      if (next.solved.length === 4) finish(next);
    }
    setPicked([]);
  };

  const shuffleNow = () => setState({ ...state, order: shuffle(order, Math.random) });

  const solvedOrder = solved.map((gi) => ({ gi, g: groups[gi] }));

  return (
    <div className="space-y-4">
      <div className="mx-auto max-w-lg space-y-2">
        {solvedOrder.map(({ gi, g }) => (
          <div key={gi} className={`rounded-xl px-3 py-3 text-center ${COLORS[gi]}`}>
            <p className="text-sm font-black uppercase">{g.name}</p>
            <p className="text-sm font-semibold">{g.words.join(" · ")}</p>
          </div>
        ))}
        {!over && (
          <div className="grid grid-cols-4 gap-2">
            {remaining.map((w) => (
              <button
                key={w}
                onClick={() => toggle(w)}
                className={`flex h-16 items-center justify-center rounded-xl px-1 text-[11px] font-black leading-tight shadow-sm ring-1 sm:text-sm ${
                  picked.includes(w)
                    ? "bg-slate-800 text-white ring-slate-800"
                    : "bg-white text-slate-800 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="h-5 text-center text-sm font-semibold text-teal-700">{msg}</p>

      {!over && (
        <>
          <p className="text-center text-sm text-slate-600">
            Errores restantes:{" "}
            {Array.from({ length: MAX_MISTAKES }, (_, i) => (
              <span key={i}>{i < MAX_MISTAKES - mistakes ? "●" : "○"} </span>
            ))}
          </p>
          <div className="flex justify-center gap-2">
            <button
              onClick={shuffleNow}
              className="min-h-11 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow ring-1 ring-slate-200"
            >
              Mezclar
            </button>
            <button
              onClick={() => setPicked([])}
              disabled={!picked.length}
              className="min-h-11 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow ring-1 ring-slate-200"
            >
              Deseleccionar
            </button>
            <button
              onClick={submit}
              disabled={picked.length !== 4}
              className="min-h-11 rounded-full bg-teal-600 px-5 py-2 text-sm font-bold text-white shadow"
            >
              Enviar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
