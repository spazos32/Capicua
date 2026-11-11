"use client";

import { useMemo, useState } from "react";
import { int, rngFor, shuffle, type Rng } from "@/lib/rng";
import { usePersistentState } from "@/lib/storage";
import type { GameProps } from "..";

const SIZE = 12;
const WORDS_PER_PUZZLE = 8;

const THEMES: { name: string; words: string[] }[] = [
  {
    name: "Animales",
    words: "PERRO GATO CABALLO TIGRE LEON JIRAFA DELFIN BALLENA TORTUGA ZORRO LOBO PINGUINO AGUILA CONEJO".split(" "),
  },
  {
    name: "Frutas y verduras",
    words: "MANZANA BANANA NARANJA LIMON FRUTILLA SANDIA DURAZNO TOMATE ZANAHORIA CEBOLLA PERA UVA LECHUGA".split(" "),
  },
  {
    name: "Países",
    words: "ARGENTINA BRASIL URUGUAY CHILE PARAGUAY PERU COLOMBIA MEXICO ESPANA ITALIA FRANCIA JAPON EGIPTO CANADA".split(" "),
  },
  {
    name: "Deportes",
    words: "FUTBOL TENIS RUGBY BASQUET NATACION CICLISMO GOLF BOXEO ATLETISMO VOLEY HOCKEY ESQUI SURF PADEL".split(" "),
  },
  {
    name: "Profesiones",
    words: "DOCTOR MEDICO COCINERO PILOTO MAESTRO BOMBERO ABOGADO CARTERO POLICIA PINTOR ACTOR CHOFER DENTISTA JUEZ".split(" "),
  },
  {
    name: "En casa",
    words: "CAMA MESA SILLA SOFA PUERTA VENTANA ESPEJO LAMPARA COCINA BANO JARDIN TECHO PARED ESCALERA".split(" "),
  },
  {
    name: "Naturaleza",
    words: "RIO LAGO MONTE VOLCAN ISLA DESIERTO SELVA PLAYA CASCADA BOSQUE VALLE OCEANO CAMPO ARROYO".split(" "),
  },
  {
    name: "Música",
    words: "PIANO GUITARRA VIOLIN BATERIA FLAUTA TANGO CANCION RITMO MELODIA CORO BAJO TROMPETA ARPA TAMBOR".split(" "),
  },
];

const DIRS: [number, number][] = [
  [0, 1], [1, 0], [1, 1], [-1, 1],
  [0, -1], [-1, 0], [-1, -1], [1, -1],
];

function generate(rng: Rng) {
  const theme = THEMES[int(rng, 0, THEMES.length - 1)];
  const words = shuffle(theme.words, rng).slice(0, WORDS_PER_PUZZLE);
  const grid: string[] = Array(SIZE * SIZE).fill("");
  const placed: { word: string; cells: number[] }[] = [];

  for (const word of [...words].sort((a, b) => b.length - a.length)) {
    for (let attempt = 0; attempt < 400; attempt++) {
      const [dr, dc] = DIRS[int(rng, 0, DIRS.length - 1)];
      const r = int(rng, 0, SIZE - 1);
      const c = int(rng, 0, SIZE - 1);
      const er = r + dr * (word.length - 1);
      const ec = c + dc * (word.length - 1);
      if (er < 0 || ec < 0 || er >= SIZE || ec >= SIZE) continue;
      const cells = Array.from({ length: word.length }, (_, k) => (r + dr * k) * SIZE + c + dc * k);
      if (cells.some((cell, k) => grid[cell] && grid[cell] !== word[k])) continue;
      cells.forEach((cell, k) => (grid[cell] = word[k]));
      placed.push({ word, cells });
      break;
    }
  }
  const abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < grid.length; i++) if (!grid[i]) grid[i] = abc[int(rng, 0, 25)];
  return { theme: theme.name, grid, placed };
}

type State = { found: string[]; wrong: number };

export default function Sopa({ dateKey, onFinish }: GameProps) {
  const puzzle = useMemo(() => generate(rngFor(dateKey, "sopa")), [dateKey]);
  const [state, setState] = usePersistentState<State>(dateKey, "sopa", () => ({
    found: [],
    wrong: 0,
  }));
  const [first, setFirst] = useState<number | null>(null);
  const { found, wrong } = state;
  const total = puzzle.placed.length;
  const done = found.length === total;

  const foundCells = new Set(
    puzzle.placed.filter((p) => found.includes(p.word)).flatMap((p) => p.cells),
  );

  const tap = (i: number) => {
    if (done) return;
    if (first === null) return setFirst(i);
    if (first === i) return setFirst(null);
    const hit = puzzle.placed.find(
      (p) =>
        !found.includes(p.word) &&
        ((p.cells[0] === first && p.cells[p.cells.length - 1] === i) ||
          (p.cells[0] === i && p.cells[p.cells.length - 1] === first)),
    );
    setFirst(null);
    if (!hit) return setState({ found, wrong: wrong + 1 });
    const nextFound = [...found, hit.word];
    setState({ found: nextFound, wrong });
    if (nextFound.length === total) {
      onFinish({
        points: Math.max(50, 100 - wrong * 3),
        share: `Sopa de letras (${puzzle.theme}) completa ✅\nIntentos fallidos: ${wrong}`,
      });
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-slate-600">
        Tema: <b>{puzzle.theme}</b> · Tocá la primera y la última letra de cada palabra
      </p>
      <div
        className="mx-auto grid w-full max-w-md select-none gap-px overflow-hidden rounded-xl border-2 border-slate-800 bg-slate-300 shadow-lg"
        style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}
      >
        {puzzle.grid.map((l, i) => (
          <button
            key={i}
            onClick={() => tap(i)}
            className={`flex aspect-square items-center justify-center text-sm font-bold sm:text-lg ${
              first === i
                ? "bg-amber-300"
                : foundCells.has(i)
                  ? "bg-emerald-300 text-emerald-900"
                  : "bg-white text-slate-800"
            }`}
          >
            {l}
          </button>
        ))}
      </div>
      <ul className="mx-auto flex max-w-md flex-wrap justify-center gap-2">
        {puzzle.placed.map((p) => (
          <li
            key={p.word}
            className={`rounded-full px-3 py-1 text-sm font-bold ${
              found.includes(p.word)
                ? "bg-emerald-100 text-emerald-700 line-through"
                : "bg-white text-slate-700 shadow-sm ring-1 ring-slate-200"
            }`}
          >
            {p.word}
          </li>
        ))}
      </ul>
      <p className="text-center text-xs text-slate-500">
        Encontradas {found.length}/{total} · Fallos {wrong}
      </p>
    </div>
  );
}
