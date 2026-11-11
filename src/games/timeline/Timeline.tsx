"use client";

import { useMemo } from "react";
import { rngFor, shuffle } from "@/lib/rng";
import { usePersistentState } from "@/lib/storage";
import type { GameProps } from "..";
import { EVENTS } from "./events";

const COUNT = 5;
const MAX_ATTEMPTS = 3;

type State = { order: number[]; attempts: number; locked: number[] };

export default function Timeline({ dateKey, onFinish }: GameProps) {
  // eventos del día en orden cronológico (índice = posición correcta)
  const solution = useMemo(() => {
    const rng = rngFor(dateKey, "timeline");
    const picked: typeof EVENTS = [];
    for (const e of shuffle(EVENTS, rng)) {
      if (picked.length < COUNT && !picked.some((p) => p.year === e.year)) picked.push(e);
    }
    return picked.sort((a, b) => a.year - b.year);
  }, [dateKey]);

  const [state, setState] = usePersistentState<State>(dateKey, "timeline", () => ({
    order: shuffle([...Array(COUNT).keys()], rngFor(dateKey, "timeline-orden")),
    attempts: 0,
    locked: [],
  }));
  const { order, attempts, locked } = state;

  const correctAt = (o: number[]) => o.map((id, pos) => id === pos);
  const solved = order.every((id, pos) => id === pos) && attempts > 0;
  const failed = !solved && attempts >= MAX_ATTEMPTS;
  const over = solved || failed;

  const move = (pos: number, delta: -1 | 1) => {
    const to = pos + delta;
    if (over || to < 0 || to >= COUNT || locked.includes(pos) || locked.includes(to)) return;
    const next = [...order];
    [next[pos], next[to]] = [next[to], next[pos]];
    setState({ ...state, order: next });
  };

  const submit = () => {
    if (over) return;
    const ok = correctAt(order);
    const used = attempts + 1;
    const nowSolved = ok.every(Boolean);
    const nowFailed = !nowSolved && used >= MAX_ATTEMPTS;
    const newLocked = ok.flatMap((v, i) => (v ? [i] : []));
    setState({ order, attempts: used, locked: newLocked });
    if (nowSolved || nowFailed) {
      const hits = ok.filter(Boolean).length;
      onFinish({
        points: nowSolved ? 100 - (used - 1) * 25 : hits * 10,
        share: `Línea de tiempo ${nowSolved ? `✅ en ${used}/${MAX_ATTEMPTS}` : `❌ (${hits}/${COUNT})`}`,
      });
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <p className="text-center text-sm text-slate-600">
        Ordená del <b>más antiguo</b> (arriba) al <b>más reciente</b> (abajo). Intentos:{" "}
        <b>
          {attempts}/{MAX_ATTEMPTS}
        </b>
      </p>
      <ol className="space-y-2">
        {order.map((id, pos) => {
          const e = solution[id];
          const ok = locked.includes(pos) || over ? id === pos : null;
          return (
            <li
              key={id}
              className={`flex items-center gap-2 rounded-xl p-3 shadow-sm ring-2 ${
                ok === true
                  ? "bg-emerald-100 ring-emerald-400"
                  : "bg-white ring-slate-200"
              }`}
            >
              <span className="flex-1 text-sm font-semibold text-slate-800">{e.text}</span>
              {over ? (
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-black text-white">
                  {e.year}
                </span>
              ) : (
                <div className="flex gap-1">
                  <button
                    onClick={() => move(pos, -1)}
                    disabled={pos === 0 || locked.includes(pos)}
                    aria-label="Subir"
                    className="h-9 w-9 rounded-lg bg-slate-100 font-black hover:bg-blue-100"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => move(pos, 1)}
                    disabled={pos === COUNT - 1 || locked.includes(pos)}
                    aria-label="Bajar"
                    className="h-9 w-9 rounded-lg bg-slate-100 font-black hover:bg-blue-100"
                  >
                    ↓
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {!over && (
        <>
          {attempts > 0 && (
            <p className="text-center text-sm text-slate-600">
              Los eventos en verde ya están bien ubicados y quedan fijos.
            </p>
          )}
          <button
            onClick={submit}
            className="w-full rounded-xl bg-blue-600 py-3 font-black text-white shadow"
          >
            Comprobar orden
          </button>
        </>
      )}
    </div>
  );
}
