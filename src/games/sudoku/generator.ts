import { shuffle, type Rng } from "@/lib/rng";

const ROW = (i: number) => Math.floor(i / 9);
const COL = (i: number) => i % 9;
const BOX = (i: number) => Math.floor(ROW(i) / 3) * 3 + Math.floor(COL(i) / 3);

function candidates(grid: number[], i: number): number {
  let used = 0;
  const r = ROW(i);
  const c = COL(i);
  const b = BOX(i);
  for (let j = 0; j < 81; j++) {
    if (grid[j] && (ROW(j) === r || COL(j) === c || BOX(j) === b)) {
      used |= 1 << grid[j];
    }
  }
  return ~used & 0x3fe; // bits 1..9
}

/** Cuenta soluciones hasta `limit` (para asegurar que haya una sola). */
function countSolutions(grid: number[], limit: number): number {
  let best = -1;
  let bestMask = 0;
  let bestCount = 10;
  for (let i = 0; i < 81; i++) {
    if (grid[i]) continue;
    const mask = candidates(grid, i);
    let n = 0;
    for (let d = 1; d <= 9; d++) if (mask & (1 << d)) n++;
    if (n < bestCount) {
      best = i;
      bestMask = mask;
      bestCount = n;
      if (n <= 1) break;
    }
  }
  if (best === -1) return 1;
  if (bestCount === 0) return 0;
  let total = 0;
  for (let d = 1; d <= 9 && total < limit; d++) {
    if (!(bestMask & (1 << d))) continue;
    grid[best] = d;
    total += countSolutions(grid, limit - total);
    grid[best] = 0;
  }
  return total;
}

function fillGrid(grid: number[], rng: Rng): boolean {
  const i = grid.indexOf(0);
  if (i === -1) return true;
  const mask = candidates(grid, i);
  for (const d of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], rng)) {
    if (!(mask & (1 << d))) continue;
    grid[i] = d;
    if (fillGrid(grid, rng)) return true;
    grid[i] = 0;
  }
  return false;
}

export function generateSudoku(rng: Rng, blanks = 44) {
  const solution = Array(81).fill(0);
  fillGrid(solution, rng);
  const puzzle = [...solution];
  let removed = 0;
  for (const i of shuffle([...Array(81).keys()], rng)) {
    if (removed >= blanks) break;
    const keep = puzzle[i];
    puzzle[i] = 0;
    if (countSolutions([...puzzle], 2) === 1) removed++;
    else puzzle[i] = keep;
  }
  return { puzzle, solution };
}
