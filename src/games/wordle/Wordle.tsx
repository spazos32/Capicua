"use client";

import { useState } from "react";
import { Keyboard, type KeyState } from "@/components/Keyboard";
import { useKeys } from "@/components/useKeys";
import { hashString } from "@/lib/rng";
import { usePersistentState } from "@/lib/storage";
import type { GameProps } from "..";
import { WORDS } from "./words";

const LIST = [...new Set(WORDS)];
const MAX = 6;

type Mark = "correct" | "present" | "absent";

function score(guess: string, answer: string): Mark[] {
  const res: Mark[] = Array(5).fill("absent");
  const left: Record<string, number> = {};
  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) res[i] = "correct";
    else left[answer[i]] = (left[answer[i]] ?? 0) + 1;
  }
  for (let i = 0; i < 5; i++) {
    if (res[i] === "correct") continue;
    if (left[guess[i]] > 0) {
      res[i] = "present";
      left[guess[i]]--;
    }
  }
  return res;
}

const CELL: Record<Mark, string> = {
  correct: "bg-emerald-500 border-emerald-500 text-white",
  present: "bg-amber-400 border-amber-400 text-white",
  absent: "bg-slate-400 border-slate-400 text-white",
};
const EMOJI: Record<Mark, string> = { correct: "🟩", present: "🟨", absent: "⬛" };

export default function Wordle({ dateKey, onFinish }: GameProps) {
  const answer = LIST[hashString(`${dateKey}:wordle`) % LIST.length];
  const [guesses, setGuesses] = usePersistentState<string[]>(
    dateKey,
    "wordle",
    () => [],
  );
  const [current, setCurrent] = useState("");
  const [msg, setMsg] = useState("");

  const won = guesses.includes(answer);
  const over = won || guesses.length >= MAX;

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(""), 1800);
  };

  const submit = () => {
    if (over) return;
    if (current.length < 5) return flash("Faltan letras");
    const next = [...guesses, current];
    setGuesses(next);
    setCurrent("");
    const w = current === answer;
    if (w || next.length >= MAX) {
      const points = w ? 100 - (next.length - 1) * 12 : 10;
      const rows = next
        .map((g) => score(g, answer).map((m) => EMOJI[m]).join(""))
        .join("\n");
      onFinish({
        points,
        share: `Palabra del día ${w ? next.length : "X"}/${MAX}\n${rows}`,
      });
    }
  };

  const onKey = (k: string) => {
    if (over) return;
    if (k === "Enter") return submit();
    if (k === "Backspace" || k === "Delete") return setCurrent((c) => c.slice(0, -1));
    if (/^[A-Z]$/.test(k)) setCurrent((c) => (c.length < 5 ? c + k : c));
  };
  useKeys(onKey, !over);

  const keyStates: Record<string, KeyState> = {};
  const rank = { absent: 0, present: 1, correct: 2 } as const;
  for (const g of guesses) {
    score(g, answer).forEach((m, i) => {
      const l = g[i];
      if (!keyStates[l] || rank[m] > rank[keyStates[l]]) keyStates[l] = m;
    });
  }

  const rows = Array.from({ length: MAX }, (_, r) => {
    if (r < guesses.length) return { text: guesses[r], marks: score(guesses[r], answer) };
    if (r === guesses.length && !over) return { text: current, marks: null };
    return { text: "", marks: null };
  });

  return (
    <div className="space-y-4">
      <div className="mx-auto grid w-fit gap-1.5">
        {rows.map((row, r) => (
          <div key={r} className="flex gap-1.5">
            {Array.from({ length: 5 }, (_, c) => (
              <div
                key={c}
                className={`flex h-14 w-14 items-center justify-center rounded-lg border-2 text-2xl font-black sm:h-16 sm:w-16 ${
                  row.marks
                    ? CELL[row.marks[c]]
                    : row.text[c]
                      ? "border-slate-500 bg-white text-slate-900"
                      : "border-slate-300 bg-white/60"
                }`}
              >
                {row.text[c] ?? ""}
              </div>
            ))}
          </div>
        ))}
      </div>
      <p className="h-6 text-center text-sm font-semibold text-slate-600">
        {msg || (over && !won ? `La palabra era ${answer}` : "")}
      </p>
      <Keyboard
        onKey={onKey}
        onBack={() => onKey("Backspace")}
        onEnter={submit}
        states={keyStates}
      />
    </div>
  );
}
