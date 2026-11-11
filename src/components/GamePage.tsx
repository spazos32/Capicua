"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, CircleHelp, Copy, Trophy } from "lucide-react";
import { GAME_BY_ID, GAMES } from "@/games/registry";
import { GAME_COMPONENTS } from "@/games";
import { prettyDate } from "@/lib/daily";
import {
  readResult,
  saveResult,
  useToday,
  type GameResult,
} from "@/lib/storage";

function ResultCard({
  result,
  nextId,
  day,
}: {
  result: GameResult;
  nextId: string | null;
  day: string;
}) {
  const [copied, setCopied] = useState(false);
  const next = nextId ? GAME_BY_ID[nextId] : null;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`Capicúa · ${prettyDate(day)}\n${result.share}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // sin permisos de portapapeles
    }
  };
  return (
    <section
      aria-live="polite"
      className="clay animate-pop mx-auto mb-5 max-w-md rounded-[28px] p-5 text-center"
    >
      <Trophy aria-hidden className="mx-auto h-8 w-8 text-amber-600" />
      <p className="mt-1 text-sm font-bold text-muted">¡Terminaste por hoy!</p>
      <p className="tabular text-5xl font-black text-accent">
        {result.points}
        <span className="text-lg font-bold text-muted"> / 100</span>
      </p>
      <pre className="mt-2 whitespace-pre-wrap font-sans text-sm font-semibold text-foreground">
        {result.share}
      </pre>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <button
          onClick={copy}
          className="flex min-h-11 items-center gap-2 rounded-full bg-violet-100 px-5 py-2 text-sm font-black text-violet-900 hover:bg-violet-200"
        >
          {copied ? (
            <Check aria-hidden className="h-4 w-4" />
          ) : (
            <Copy aria-hidden className="h-4 w-4" />
          )}
          {copied ? "¡Copiado!" : "Copiar resultado"}
        </button>
        {next ? (
          <Link
            href={`/juego/${next.id}`}
            className="flex min-h-11 items-center gap-2 rounded-full bg-orange-600 px-5 py-2 text-sm font-black text-white shadow-[0_4px_0_#9a3412] active:translate-y-0.5 active:shadow-[0_2px_0_#9a3412]"
          >
            Siguiente: {next.title}
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        ) : (
          <Link
            href="/"
            className="flex min-h-11 items-center gap-2 rounded-full bg-orange-600 px-5 py-2 text-sm font-black text-white shadow-[0_4px_0_#9a3412] active:translate-y-0.5 active:shadow-[0_2px_0_#9a3412]"
          >
            Ver todos los juegos
          </Link>
        )}
      </div>
    </section>
  );
}

export default function GamePage({ id }: { id: string }) {
  const meta = GAME_BY_ID[id];
  const day = useToday();
  const Game = GAME_COMPONENTS[id];
  const [, refresh] = useState(0);
  // `day` es null hasta montar en el cliente, así que leer localStorage acá es seguro
  const result = day ? readResult(day, id) : null;
  const nextId =
    day && GAMES.find((g) => g.id !== id && !readResult(day, g.id))?.id;

  const onFinish = (r: GameResult) => {
    if (!day || readResult(day, id)) return;
    saveResult(day, id, r);
    refresh((n) => n + 1);
  };

  if (!meta || !Game) {
    return <p className="p-8 text-center">Juego no encontrado.</p>;
  }

  return (
    <main id="main" className="mx-auto w-full max-w-3xl px-3 pb-16 pt-4">
      <header className="mb-3 flex items-center gap-3">
        <Link
          href="/"
          aria-label="Volver al inicio"
          className="clay flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-foreground hover:bg-violet-50"
        >
          <ArrowLeft aria-hidden className="h-5 w-5" strokeWidth={2.5} />
        </Link>
        <span
          aria-hidden
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.gradient} text-white`}
        >
          <meta.Icon className="h-6 w-6" strokeWidth={2.25} />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-black leading-tight text-foreground">
            {meta.title}
          </h1>
          {day && <p className="text-xs font-bold text-muted">{prettyDate(day)}</p>}
        </div>
      </header>

      <details className="clay group mx-auto mb-4 max-w-2xl rounded-2xl px-4 py-2">
        <summary className="flex min-h-11 list-none items-center gap-2 text-sm font-black text-accent [&::-webkit-details-marker]:hidden">
          <CircleHelp aria-hidden className="h-5 w-5" />
          ¿Cómo se juega?
        </summary>
        <p className="pb-2 text-sm font-semibold leading-relaxed text-muted">{meta.howTo}</p>
      </details>

      {result && day && <ResultCard result={result} nextId={nextId || null} day={day} />}
      {day ? (
        <Game key={day} dateKey={day} onFinish={onFinish} />
      ) : (
        <p className="p-8 text-center font-semibold text-muted" role="status">
          Cargando…
        </p>
      )}
    </main>
  );
}
