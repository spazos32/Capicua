"use client";

import Link from "next/link";
import { GAMES } from "@/games/registry";
import { prettyDate } from "@/lib/daily";
import { readResult, useToday } from "@/lib/storage";

export default function Home() {
  const day = useToday();
  // `day` es null hasta montar en el cliente, así que leer localStorage acá es seguro
  const results = Object.fromEntries(
    GAMES.map((g) => [g.id, day ? readResult(day, g.id) : null]),
  );

  const done = GAMES.filter((g) => results[g.id]).length;
  const total = GAMES.reduce((s, g) => s + (results[g.id]?.points ?? 0), 0);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-8">
      <header className="mb-8 text-center">
        <h1 className="bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-orange-500 bg-clip-text text-5xl font-black tracking-tight text-transparent sm:text-6xl">
          Capicúa
        </h1>
        <p className="mt-2 text-slate-600">
          Minijuegos nuevos todos los días, para jugar con amigos.
        </p>
        <p className="mt-1 h-5 text-sm font-semibold text-slate-500">
          {day ? prettyDate(day) : ""}
        </p>
        <div className="mx-auto mt-4 flex max-w-xs items-center justify-around rounded-2xl bg-white/80 py-3 shadow ring-1 ring-slate-200 backdrop-blur">
          <div>
            <p className="text-2xl font-black text-slate-900">
              {done}/{GAMES.length}
            </p>
            <p className="text-xs text-slate-500">juegos hoy</p>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <p className="text-2xl font-black text-indigo-600">{total}</p>
            <p className="text-xs text-slate-500">puntos hoy</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {GAMES.map((g) => {
          const r = results[g.id];
          return (
            <Link
              key={g.id}
              href={`/juego/${g.id}`}
              className={`group relative flex min-h-44 flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br ${g.gradient} p-4 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl active:scale-95`}
            >
              <span className="text-4xl drop-shadow">{g.emoji}</span>
              <div>
                <h2 className="text-lg font-black leading-tight">{g.title}</h2>
                <p className="mt-1 text-xs leading-snug text-white/85">
                  {g.description}
                </p>
              </div>
              <span
                className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-xs font-bold ${
                  r ? "bg-white text-slate-800" : "bg-black/20 text-white"
                }`}
              >
                {r ? `✓ ${r.points}` : "Jugar"}
              </span>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
