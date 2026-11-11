"use client";

import { useMemo, useState } from "react";
import { Keyboard } from "@/components/Keyboard";
import { useKeys } from "@/components/useKeys";
import { rngFor, shuffle } from "@/lib/rng";
import { usePersistentState } from "@/lib/storage";
import type { GameProps } from "..";
import { CRIPTICOS } from "./clues";

const COUNT = 5;
type Res = "ok1" | "ok2" | "fail";
type State = { results: Res[]; tries: number };

const POINTS: Record<Res, number> = { ok1: 20, ok2: 10, fail: 0 };
const EMOJI: Record<Res, string> = { ok1: "🟩", ok2: "🟨", fail: "🟥" };

export default function Criptico({ dateKey, onFinish }: GameProps) {
  const clues = useMemo(
    () => shuffle(CRIPTICOS, rngFor(dateKey, "criptico")).slice(0, COUNT),
    [dateKey],
  );
  const [state, setState] = usePersistentState<State>(dateKey, "criptico", () => ({
    results: [],
    tries: 0,
  }));
  const [guess, setGuess] = useState("");
  const [msg, setMsg] = useState("");
  const { results, tries } = state;
  const over = results.length === COUNT;
  const cur = clues[Math.min(results.length, COUNT - 1)];

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(""), 2200);
  };

  const push = (r: Res, tries2 = 0) => {
    const next = [...results, r];
    setState({ results: next, tries: tries2 });
    setGuess("");
    if (next.length === COUNT) {
      onFinish({
        points: next.reduce((s, x) => s + POINTS[x], 0),
        share: `Críptico\n${next.map((x) => EMOJI[x]).join("")}`,
      });
    }
  };

  const submit = () => {
    if (over) return;
    if (guess.length !== cur.answer.length) return flash("Faltan letras");
    if (guess === cur.answer) {
      flash("¡Correcto!");
      return push(tries === 0 ? "ok1" : "ok2");
    }
    if (tries + 1 >= 2) {
      flash(`Era ${cur.answer}`);
      return push("fail");
    }
    setState({ results, tries: tries + 1 });
    setGuess("");
    flash("Casi… probá de nuevo (te damos la primera letra)");
  };

  const onKey = (k: string) => {
    if (over) return;
    if (k === "Enter") return submit();
    if (k === "Backspace" || k === "Delete") return setGuess((g) => g.slice(0, -1));
    if (/^[A-Z]$/.test(k)) setGuess((g) => (g.length < cur.answer.length ? g + k : g));
  };
  useKeys(onKey, !over);

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex justify-center gap-2">
        {Array.from({ length: COUNT }, (_, i) => (
          <span
            key={i}
            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${
              results[i]
                ? results[i] === "fail"
                  ? "bg-rose-400 text-white"
                  : "bg-emerald-400 text-white"
                : i === results.length
                  ? "bg-purple-600 text-white"
                  : "bg-white text-slate-400"
            }`}
          >
            {i + 1}
          </span>
        ))}
      </div>

      {!over && (
        <>
          <div className="rounded-2xl bg-white p-4 text-center shadow ring-1 ring-slate-200">
            <p className="text-lg font-black text-slate-900">{cur.clue}</p>
            <p className="mt-1 text-sm text-slate-600">({cur.answer.length} letras)</p>
          </div>
          <div className="flex justify-center gap-1.5">
            {Array.from({ length: cur.answer.length }, (_, i) => {
              const hint = tries > 0 && i === 0 && !guess[0];
              return (
                <div
                  key={i}
                  className="flex h-12 w-10 items-center justify-center rounded-lg border-2 border-purple-300 bg-white text-xl font-black text-slate-900"
                >
                  {guess[i] ?? (hint ? <span className="text-purple-300">{cur.answer[0]}</span> : "")}
                </div>
              );
            })}
          </div>
          <p className="h-5 text-center text-sm font-semibold text-purple-700">{msg}</p>
          <Keyboard onKey={onKey} onBack={() => onKey("Backspace")} onEnter={submit} />
        </>
      )}

      {over && (
        <ul className="space-y-2">
          {clues.map((c, i) => (
            <li key={i} className="rounded-xl bg-white p-3 text-sm shadow-sm ring-1 ring-slate-200">
              {EMOJI[results[i]]} <b>{c.answer}</b> — {c.clue}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
