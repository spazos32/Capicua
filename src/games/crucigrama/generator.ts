import { shuffle, type Rng } from "@/lib/rng";
import { CLUES } from "./clues";

export const SIZE = 13;

export type Dir = "across" | "down";

export type Entry = {
  answer: string;
  clue: string;
  row: number;
  col: number;
  dir: Dir;
  number: number;
};

export type Crossword = {
  size: number;
  /** solución por celda; null = casilla negra */
  solution: (string | null)[];
  /** número de pista en la celda (0 = sin número) */
  numbers: number[];
  entries: Entry[];
};

type Placed = { answer: string; clue: string; row: number; col: number; dir: Dir };

function build(rng: Rng): Placed[] {
  const letters: (string | null)[][] = Array.from({ length: SIZE }, () =>
    Array(SIZE).fill(null),
  );
  const dirs: number[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  const byLetter = new Map<string, [number, number][]>();
  const placed: Placed[] = [];

  const empty = (r: number, c: number) =>
    r < 0 || c < 0 || r >= SIZE || c >= SIZE || letters[r][c] === null;

  const fits = (word: string, r: number, c: number, dir: Dir): boolean => {
    const dr = dir === "down" ? 1 : 0;
    const dc = dir === "across" ? 1 : 0;
    const er = r + dr * word.length;
    const ec = c + dc * word.length;
    if (r < 0 || c < 0 || er - dr >= SIZE || ec - dc >= SIZE) return false;
    if (!empty(r - dr, c - dc) || !empty(er, ec)) return false;
    const bit = dir === "across" ? 1 : 2;
    let crossings = 0;
    for (let k = 0; k < word.length; k++) {
      const rr = r + dr * k;
      const cc = c + dc * k;
      const cur = letters[rr][cc];
      if (cur !== null) {
        if (cur !== word[k] || dirs[rr][cc] & bit) return false;
        crossings++;
      } else if (dir === "across") {
        if (!empty(rr - 1, cc) || !empty(rr + 1, cc)) return false;
      } else if (!empty(rr, cc - 1) || !empty(rr, cc + 1)) return false;
    }
    return crossings >= 1 && crossings < word.length;
  };

  const put = (p: Placed) => {
    const dr = p.dir === "down" ? 1 : 0;
    const dc = p.dir === "across" ? 1 : 0;
    const bit = p.dir === "across" ? 1 : 2;
    for (let k = 0; k < p.answer.length; k++) {
      const rr = p.row + dr * k;
      const cc = p.col + dc * k;
      if (letters[rr][cc] === null) {
        letters[rr][cc] = p.answer[k];
        const list = byLetter.get(p.answer[k]) ?? [];
        list.push([rr, cc]);
        byLetter.set(p.answer[k], list);
      }
      dirs[rr][cc] |= bit;
    }
    placed.push(p);
  };

  const pool = shuffle(CLUES, rng).filter((c) => c.answer.length <= 9);
  const first = pool.find((c) => c.answer.length >= 7) ?? pool[0];
  put({
    ...first,
    row: Math.floor(SIZE / 2),
    col: Math.floor((SIZE - first.answer.length) / 2),
    dir: "across",
  });

  for (let pass = 0; pass < 2; pass++) {
    for (const w of pool) {
      if (placed.some((p) => p.answer === w.answer)) continue;
      const options: Placed[] = [];
      for (let i = 0; i < w.answer.length; i++) {
        for (const [r, c] of byLetter.get(w.answer[i]) ?? []) {
          if (fits(w.answer, r, c - i, "across"))
            options.push({ ...w, row: r, col: c - i, dir: "across" });
          if (fits(w.answer, r - i, c, "down"))
            options.push({ ...w, row: r - i, col: c, dir: "down" });
        }
      }
      if (options.length) put(options[Math.floor(rng() * options.length)]);
    }
  }
  return placed;
}

export function generateCrossword(rng: Rng): Crossword {
  let best: Placed[] = [];
  let bestScore = -1;
  for (let attempt = 0; attempt < 40; attempt++) {
    const p = build(rng);
    const score = p.length * 100 + p.reduce((s, w) => s + w.answer.length, 0);
    if (score > bestScore) {
      best = p;
      bestScore = score;
    }
  }

  const solution: (string | null)[] = Array(SIZE * SIZE).fill(null);
  for (const p of best) {
    for (let k = 0; k < p.answer.length; k++) {
      const r = p.row + (p.dir === "down" ? k : 0);
      const c = p.col + (p.dir === "across" ? k : 0);
      solution[r * SIZE + c] = p.answer[k];
    }
  }

  const starts = new Set(best.map((p) => p.row * SIZE + p.col));
  const numbers: number[] = Array(SIZE * SIZE).fill(0);
  let n = 0;
  for (let i = 0; i < SIZE * SIZE; i++) {
    if (starts.has(i)) numbers[i] = ++n;
  }

  const entries: Entry[] = best
    .map((p) => ({ ...p, number: numbers[p.row * SIZE + p.col] }))
    .sort((a, b) => a.number - b.number);

  return { size: SIZE, solution, numbers, entries };
}
