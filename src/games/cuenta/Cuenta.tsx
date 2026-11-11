"use client";

import { useMemo, useState } from "react";
import { int, rngFor, shuffle, type Rng } from "@/lib/rng";
import { usePersistentState } from "@/lib/storage";
import type { GameProps } from "..";

type Op = "+" | "−" | "×" | "÷";
type Tile = { id: number; value: number };
type State = { tiles: Tile[]; history: Tile[][]; submitted: number | null };

function apply(a: number, op: Op, b: number): number | null {
  switch (op) {
    case "+":
      return a + b;
    case "−":
      return a > b ? a - b : null;
    case "×":
      return a * b;
    case "÷":
      return b > 1 && a % b === 0 ? a / b : null;
  }
}

/** Genera números y un objetivo que seguro se puede alcanzar. */
function generate(rng: Rng): { numbers: number[]; target: number } {
  for (;;) {
    const small = Array.from({ length: 4 }, () => int(rng, 1, 10));
    const large = shuffle([25, 50, 75, 100], rng).slice(0, 2);
    const numbers = shuffle([...small, ...large], rng);
    let pool = [...numbers];
    let last = 0;
    const steps = int(rng, 3, 5);
    for (let s = 0; s < steps && pool.length > 1; s++) {
      const idx = shuffle([...pool.keys()], rng);
      const [i, j] = [idx[0], idx[1]];
      const ops = shuffle<Op>(["+", "−", "×", "÷"], rng);
      let res: number | null = null;
      for (const op of ops) {
        res = apply(pool[i], op, pool[j]) ?? apply(pool[j], op, pool[i]);
        if (res !== null && res < 10000) break;
        res = null;
      }
      if (res === null) continue;
      pool = pool.filter((_, k) => k !== i && k !== j);
      pool.push(res);
      last = res;
    }
    if (last >= 101 && last <= 999 && !numbers.includes(last)) {
      return { numbers, target: last };
    }
  }
}

export default function Cuenta({ dateKey, onFinish }: GameProps) {
  const { numbers, target } = useMemo(() => generate(rngFor(dateKey, "cuenta")), [dateKey]);
  const initial = useMemo<Tile[]>(
    () => numbers.map((value, id) => ({ id, value })),
    [numbers],
  );
  const [state, setState] = usePersistentState<State>(dateKey, "cuenta", () => ({
    tiles: initial,
    history: [],
    submitted: null,
  }));
  const [a, setA] = useState<number | null>(null);
  const [op, setOp] = useState<Op | null>(null);
  const [msg, setMsg] = useState("");
  const { tiles, history, submitted } = state;
  const done = submitted !== null;

  const finish = (value: number) => {
    const diff = Math.abs(target - value);
    setState({ ...state, submitted: value });
    onFinish({
      points: Math.max(0, 100 - diff * 10),
      share: `Cuenta atrás: objetivo ${target}\nLlegué a ${value}${diff === 0 ? " ✅" : ` (a ${diff})`}`,
    });
  };

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(""), 1800);
  };

  const pickTile = (id: number) => {
    if (done) return;
    if (a === null || op === null) {
      setA(id);
      return;
    }
    if (a === id) return setA(null);
    const ta = tiles.find((t) => t.id === a)!;
    const tb = tiles.find((t) => t.id === id)!;
    const res = apply(ta.value, op, tb.value);
    if (res === null) {
      flash("Esa operación no da un entero positivo");
      return;
    }
    const nextId = Math.max(...tiles.map((t) => t.id), 0) + 1;
    const next = [...tiles.filter((t) => t.id !== a && t.id !== id), { id: nextId, value: res }];
    setState({
      tiles: next,
      history: [...history, tiles],
      submitted: res === target ? res : null,
    });
    setA(null);
    setOp(null);
    if (res === target) {
      onFinish({
        points: 100,
        share: `Cuenta atrás: objetivo ${target}\nLlegué exacto ✅`,
      });
    }
  };

  const undo = () => {
    if (done || !history.length) return;
    setState({ tiles: history[history.length - 1], history: history.slice(0, -1), submitted: null });
    setA(null);
    setOp(null);
  };

  const closest = tiles.reduce((b, t) =>
    Math.abs(t.value - target) < Math.abs(b.value - target) ? t : b,
  );

  return (
    <div className="space-y-5">
      <div className="mx-auto max-w-xs rounded-2xl bg-white py-4 text-center shadow-lg ring-1 ring-slate-200">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Objetivo</p>
        <p className="text-6xl font-black text-rose-600">{target}</p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {tiles.map((t) => (
          <button
            key={t.id}
            onClick={() => pickTile(t.id)}
            disabled={done}
            className={`h-16 min-w-16 rounded-2xl px-3 text-2xl font-black shadow ring-2 transition ${
              a === t.id
                ? "bg-rose-500 text-white ring-rose-500"
                : "bg-white text-slate-800 ring-slate-200 hover:ring-rose-300"
            }`}
          >
            {t.value}
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-2">
        {(["+", "−", "×", "÷"] as Op[]).map((o) => (
          <button
            key={o}
            onClick={() => setOp(o === op ? null : o)}
            disabled={done}
            className={`h-12 w-12 rounded-xl text-2xl font-black shadow ring-2 ${
              op === o
                ? "bg-rose-500 text-white ring-rose-500"
                : "bg-white text-slate-800 ring-slate-200"
            }`}
          >
            {o}
          </button>
        ))}
      </div>

      <p className="h-5 text-center text-sm font-semibold text-rose-600">{msg}</p>

      <div className="flex justify-center gap-2">
        <button
          onClick={undo}
          disabled={done || !history.length}
          className="min-h-11 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow ring-1 ring-slate-200"
        >
          ↩ Deshacer
        </button>
        <button
          onClick={() => finish(closest.value)}
          disabled={done}
          className="min-h-11 rounded-full bg-rose-600 px-4 py-2 text-sm font-bold text-white shadow"
        >
          Entregar ({closest.value})
        </button>
      </div>
      <p className="text-center text-xs text-slate-600">
        Tocá un número, una operación y otro número. Cada número se usa una sola vez.
        Entregá el más cercano al objetivo (−10 pts por cada unidad de diferencia).
      </p>
    </div>
  );
}
