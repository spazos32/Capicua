"use client";

import Link from "next/link";
import { ArrowRight, Check, PartyPopper } from "lucide-react";
import { GAMES } from "@/games/registry";
import { prettyDate } from "@/lib/daily";
import { readResult, useCountdown, useToday } from "@/lib/storage";

const pad = (n: number) => String(n).padStart(2, "0");

function formatCountdown(s: number) {
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

export default function Home() {
  const day = useToday();
  const countdown = useCountdown();
  // `day` es null hasta montar en el cliente, así que leer localStorage acá es seguro
  const results = Object.fromEntries(
    GAMES.map((g) => [g.id, day ? readResult(day, g.id) : null]),
  );

  const done = GAMES.filter((g) => results[g.id]).length;
  const total = GAMES.reduce((s, g) => s + (results[g.id]?.points ?? 0), 0);
  const next = GAMES.find((g) => !results[g.id]);
  const allDone = done === GAMES.length;

  return (
    <main id="main" className="mx-auto w-full max-w-5xl px-4 pb-12 pt-8 sm:pt-12">
      <header className="mb-8 text-center">
        <h1 className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-6xl font-black tracking-tight text-transparent sm:text-7xl">
          Capicúa
        </h1>
        <p className="mx-auto mt-2 max-w-md text-lg font-semibold text-muted">
          Minijuegos nuevos todos los días, para jugar con amigos.
        </p>
        <p className="mt-1 h-6 text-sm font-bold uppercase tracking-wide text-accent">
          {day ? prettyDate(day) : ""}
        </p>

        <section
          aria-label="Tu progreso de hoy"
          className="clay mx-auto mt-5 max-w-sm rounded-[28px] p-4 text-left"
        >
          <div className="flex items-end justify-between">
            <p className="text-sm font-bold text-muted">Tu progreso de hoy</p>
            <p className="tabular text-sm font-black text-foreground">
              {done}/{GAMES.length} juegos · {total} pts
            </p>
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={GAMES.length}
            aria-valuenow={done}
            aria-label="Juegos completados hoy"
            className="mt-2 h-4 overflow-hidden rounded-full bg-violet-100"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-600 to-pink-600 transition-[width] duration-500"
              style={{ width: `${(done / GAMES.length) * 100}%` }}
            />
          </div>

          {allDone ? (
            <p className="mt-3 flex items-center gap-2 rounded-2xl bg-emerald-100 px-3 py-2 text-sm font-bold text-emerald-900">
              <PartyPopper aria-hidden className="h-5 w-5 shrink-0" />
              ¡Completaste todos los juegos de hoy!
            </p>
          ) : (
            next && (
              <Link
                href={`/juego/${next.id}`}
                className="mt-3 flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-orange-600 px-4 py-2 text-base font-black text-white shadow-[0_6px_0_#9a3412] transition active:translate-y-1 active:shadow-[0_2px_0_#9a3412]"
              >
                {done === 0 ? "Empezar a jugar" : `Seguir con ${next.title}`}
                <ArrowRight aria-hidden className="h-5 w-5" />
              </Link>
            )
          )}
        </section>
      </header>

      <section aria-label="Juegos de hoy">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {GAMES.map((g, i) => {
            const r = results[g.id];
            return (
              <li
                key={g.id}
                className="animate-rise"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <Link
                  href={`/juego/${g.id}`}
                  aria-label={
                    r ? `${g.title}, completado, ${r.points} puntos` : `${g.title}, sin jugar`
                  }
                  className={`clay-color group relative flex min-h-48 flex-col justify-between rounded-[28px] bg-gradient-to-br ${g.gradient} p-4 text-white transition duration-200 hover:-translate-y-1 active:scale-95`}
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 ring-2 ring-white/30">
                    <g.Icon aria-hidden className="h-8 w-8" strokeWidth={2.25} />
                  </span>
                  <div>
                    <h2 className="text-xl font-black leading-tight">{g.title}</h2>
                    <p className="mt-1 text-sm font-semibold leading-snug">
                      {g.description}
                    </p>
                  </div>
                  <span
                    className={`absolute right-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ${
                      r ? "bg-white text-emerald-800" : "bg-black/25 text-white"
                    }`}
                  >
                    {r ? (
                      <>
                        <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />
                        <span className="tabular">{r.points}</span>
                      </>
                    ) : (
                      "Jugar"
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <footer className="mt-8 text-center text-sm font-semibold text-muted">
        <p>
          Puzzles nuevos en{" "}
          <span className="tabular rounded-lg bg-white px-2 py-0.5 font-black text-accent">
            {countdown === null ? "--:--:--" : formatCountdown(countdown)}
          </span>
        </p>
        <p className="mt-1 text-xs">Cambian todos los días a las 00:00 (hora de Argentina).</p>
      </footer>
    </main>
  );
}
