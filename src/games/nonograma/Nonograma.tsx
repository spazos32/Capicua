"use client";

import { useMemo, useState } from "react";
import { rngFor } from "@/lib/rng";
import { usePersistentState } from "@/lib/storage";
import type { GameProps } from "..";

const N = 10;

function runs(line: number[]): number[] {
  const out: number[] = [];
  let n = 0;
  for (const v of line) {
    if (v === 1) n++;
    else if (n) {
      out.push(n);
      n = 0;
    }
  }
  if (n) out.push(n);
  return out.length ? out : [0];
}

const same = (a: number[], b: number[]) =>
  a.length === b.length && a.every((v, i) => v === b[i]);

type State = { cells: number[]; fixes: number };

export default function Nonograma({ dateKey, onFinish }: GameProps) {
  const { rowClues, colClues } = useMemo(() => {
    const rng = rngFor(dateKey, "nonograma");
    const target: number[] = Array(N * N).fill(0);
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N / 2; c++) {
        const v = rng() < 0.6 ? 1 : 0;
        target[r * N + c] = v;
        target[r * N + (N - 1 - c)] = v;
      }
    }
    const rows = Array.from({ length: N }, (_, r) => runs(target.slice(r * N, r * N + N)));
    const cols = Array.from({ length: N }, (_, c) =>
      runs(Array.from({ length: N }, (_, r) => target[r * N + c])),
    );
    return { rowClues: rows, colClues: cols };
  }, [dateKey]);

  const [state, setState] = usePersistentState<State>(dateKey, "nonograma", () => ({
    cells: Array(N * N).fill(0),
    fixes: 0,
  }));
  const [mark, setMark] = useState(false);
  const { cells, fixes } = state;

  const check = (c: number[]) =>
    rowClues.every((rc, r) => same(runs(c.slice(r * N, r * N + N)), rc)) &&
    colClues.every((cc, col) =>
      same(runs(Array.from({ length: N }, (_, r) => (c[r * N + col] === 1 ? 1 : 0))), cc),
    );

  const done = check(cells);

  const tap = (i: number) => {
    if (done) return;
    const cur = cells[i];
    let next: number;
    let nextFixes = fixes;
    if (mark) next = cur === 2 ? 0 : cur === 0 ? 2 : cur;
    else if (cur === 1) {
      next = 0;
      nextFixes++;
    } else next = 1;
    const nc = cells.map((v, k) => (k === i ? next : v));
    setState({ cells: nc, fixes: nextFixes });
    if (check(nc)) {
      const rows = Array.from({ length: N }, (_, r) =>
        nc
          .slice(r * N, r * N + N)
          .map((v) => (v === 1 ? "⬛" : "⬜"))
          .join(""),
      ).join("\n");
      onFinish({
        points: Math.max(40, 100 - nextFixes * 4),
        share: `Nonograma resuelto ✅\n${rows}`,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-2">
        {[false, true].map((m) => (
          <button
            key={String(m)}
            onClick={() => setMark(m)}
            className={`min-h-11 rounded-full px-4 py-2 text-sm font-bold shadow ring-1 ${
              mark === m
                ? "bg-fuchsia-600 text-white ring-fuchsia-600"
                : "bg-white text-slate-700 ring-slate-200"
            }`}
          >
            {m ? "✕ Marcar vacío" : "■ Pintar"}
          </button>
        ))}
      </div>

      <div className="mx-auto w-fit overflow-x-auto rounded-xl bg-white p-2 shadow-lg ring-1 ring-slate-200">
        <table data-board="" className="border-collapse">
          <thead>
            <tr>
              <th />
              {colClues.map((cc, c) => (
                <th key={c} className="align-bottom pb-1">
                  <div className="flex flex-col items-center text-[11px] font-bold leading-tight text-slate-600 sm:text-xs">
                    {cc.map((n, k) => (
                      <span key={k}>{n}</span>
                    ))}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowClues.map((rc, r) => (
              <tr key={r}>
                <th className="whitespace-nowrap pr-2 text-right text-[11px] font-bold text-slate-600 sm:text-xs">
                  {rc.join(" ")}
                </th>
                {Array.from({ length: N }, (_, c) => {
                  const v = cells[r * N + c];
                  return (
                    <td
                      key={c}
                      className={`p-0 ${c === 4 ? "border-r-2 border-r-slate-400" : ""} ${
                        r === 4 ? "border-b-2 border-b-slate-400" : ""
                      }`}
                    >
                      <button
                        onClick={() => tap(r * N + c)}
                        className={`m-px flex h-7 w-7 items-center justify-center rounded-sm text-xs font-bold sm:h-9 sm:w-9 ${
                          v === 1
                            ? "bg-fuchsia-600"
                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                        }`}
                      >
                        {v === 2 ? "✕" : ""}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-center text-xs text-slate-600">
        Cada número indica cuántas casillas seguidas van pintadas · Correcciones: {fixes}
      </p>
    </div>
  );
}
