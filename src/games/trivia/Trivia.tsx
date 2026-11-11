"use client";

import { useMemo } from "react";
import { rngFor, shuffle } from "@/lib/rng";
import { usePersistentState } from "@/lib/storage";
import type { GameProps } from "..";
import { QUESTIONS } from "./questions";

const COUNT = 10;

type State = { answers: number[]; revealed: boolean; finished: boolean };

export default function Trivia({ dateKey, onFinish }: GameProps) {
  const quiz = useMemo(() => {
    const rng = rngFor(dateKey, "trivia");
    return shuffle(QUESTIONS, rng)
      .slice(0, COUNT)
      .map((q) => {
        const options = shuffle([q.answer, ...q.wrong], rng);
        return { q: q.q, options, correct: options.indexOf(q.answer) };
      });
  }, [dateKey]);

  const [state, setState] = usePersistentState<State>(dateKey, "trivia", () => ({
    answers: [],
    revealed: false,
    finished: false,
  }));
  const { answers, revealed, finished } = state;
  const score = answers.filter((a, i) => a === quiz[i].correct).length;

  const answer = (i: number) => {
    if (revealed) return;
    setState({ ...state, answers: [...answers, i], revealed: true });
  };

  const next = () => {
    if (answers.length < COUNT) return setState({ ...state, revealed: false });
    setState({ ...state, finished: true });
    onFinish({
      points: score * 10,
      share: `Trivia: ${score}/${COUNT}\n${answers
        .map((a, i) => (a === quiz[i].correct ? "🟩" : "🟥"))
        .join("")}`,
    });
  };

  if (finished) {
    return (
      <ul className="mx-auto max-w-lg space-y-2">
        {quiz.map((q, i) => {
          const ok = answers[i] === q.correct;
          return (
            <li
              key={i}
              className={`rounded-xl p-3 text-sm shadow-sm ring-1 ${
                ok ? "bg-emerald-50 ring-emerald-200" : "bg-rose-50 ring-rose-200"
              }`}
            >
              <p className="font-bold text-slate-900">
                {ok ? "✅" : "❌"} {q.q}
              </p>
              <p className="text-slate-700">Respuesta: {q.options[q.correct]}</p>
            </li>
          );
        })}
      </ul>
    );
  }

  const idx = revealed ? answers.length - 1 : answers.length;
  const q = quiz[idx];
  const picked = revealed ? answers[idx] : -1;

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
        <span>
          Pregunta {idx + 1} de {COUNT}
        </span>
        <span>Aciertos: {score}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white">
        <div
          className="h-full bg-amber-400 transition-all"
          style={{ width: `${(answers.length / COUNT) * 100}%` }}
        />
      </div>
      <h2 className="rounded-2xl bg-white p-4 text-lg font-black text-slate-900 shadow ring-1 ring-slate-200">
        {q.q}
      </h2>
      <div className="space-y-2">
        {q.options.map((o, i) => {
          let style = "bg-white text-slate-800 ring-slate-200 hover:bg-amber-50";
          if (revealed) {
            if (i === q.correct) style = "bg-emerald-200 text-emerald-900 ring-emerald-400";
            else if (i === picked) style = "bg-rose-200 text-rose-900 ring-rose-400";
            else style = "bg-white text-slate-400 ring-slate-200";
          }
          return (
            <button
              key={i}
              onClick={() => answer(i)}
              disabled={revealed}
              className={`w-full rounded-xl px-4 py-3 text-left font-semibold shadow-sm ring-2 disabled:opacity-100 ${style}`}
            >
              {o}
            </button>
          );
        })}
      </div>
      {revealed && (
        <button
          onClick={next}
          className="w-full rounded-xl bg-amber-500 py-3 font-black text-white shadow"
        >
          {answers.length === COUNT ? "Ver resultado" : "Siguiente"}
        </button>
      )}
    </div>
  );
}
