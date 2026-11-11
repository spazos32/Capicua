"use client";

import Link from "next/link";
import { useState } from "react";
import { GAME_BY_ID } from "@/games/registry";
import { GAME_COMPONENTS } from "@/games";
import { prettyDate } from "@/lib/daily";
import {
  readResult,
  saveResult,
  useToday,
  type GameResult,
} from "@/lib/storage";

function ResultCard({ result }: { result: GameResult }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.share);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // sin permisos de portapapeles
    }
  };
  return (
    <div className="mx-auto mb-4 max-w-md rounded-2xl bg-white p-4 text-center shadow-lg ring-1 ring-slate-200">
      <p className="text-sm font-medium text-slate-500">¡Terminaste por hoy!</p>
      <p className="text-4xl font-black text-indigo-600">
        {result.points}
        <span className="text-lg font-bold text-slate-400"> / 100</span>
      </p>
      <pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-slate-700">
        {result.share}
      </pre>
      <button
        onClick={copy}
        className="mt-3 rounded-full bg-indigo-600 px-5 py-2 text-sm font-bold text-white hover:bg-indigo-700"
      >
        {copied ? "¡Copiado!" : "Copiar resultado"}
      </button>
    </div>
  );
}

export default function GamePage({ id }: { id: string }) {
  const meta = GAME_BY_ID[id];
  const day = useToday();
  const Game = GAME_COMPONENTS[id];
  const [, refresh] = useState(0);
  // `day` es null hasta montar en el cliente, así que leer localStorage acá es seguro
  const result = day ? readResult(day, id) : null;

  const onFinish = (r: GameResult) => {
    if (!day || readResult(day, id)) return;
    saveResult(day, id, r);
    refresh((n) => n + 1);
  };

  if (!meta || !Game) {
    return <p className="p-8 text-center">Juego no encontrado.</p>;
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-3 pb-16 pt-4">
      <header className="mb-4 flex items-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow ring-1 ring-slate-200 hover:bg-slate-50"
        >
          ← Inicio
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-black text-slate-900">
            {meta.emoji} {meta.title}
          </h1>
          {day && <p className="text-xs text-slate-500">{prettyDate(day)}</p>}
        </div>
      </header>
      {result && <ResultCard result={result} />}
      {day ? (
        <Game key={day} dateKey={day} onFinish={onFinish} />
      ) : (
        <p className="p-8 text-center text-slate-500">Cargando…</p>
      )}
    </div>
  );
}
