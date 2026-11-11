"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { secondsToNextDay, todayKey } from "./daily";

export type GameResult = { points: number; share: string };

const k = (date: string, game: string, part: string) =>
  `capicua:${date}:${game}:${part}`;

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // modo privado o storage lleno: el juego sigue funcionando sin guardar
  }
}

export function readResult(date: string, game: string): GameResult | null {
  return read<GameResult>(k(date, game, "result"));
}

export function saveResult(date: string, game: string, r: GameResult) {
  write(k(date, game, "result"), r);
}

/** Devuelve la fecha de hoy recién cuando el componente está montado en el cliente. */
export function useToday(): string | null {
  return useSyncExternalStore(
    () => () => {},
    todayKey,
    () => null,
  );
}

/** Segundos hasta el próximo cambio de día; null hasta montar en el cliente. */
export function useCountdown(): number | null {
  return useSyncExternalStore(
    (notify) => {
      const id = setInterval(notify, 1000);
      return () => clearInterval(id);
    },
    secondsToNextDay,
    () => null,
  );
}

/** Estado que se guarda en localStorage por juego y por día. */
export function usePersistentState<T>(
  date: string,
  game: string,
  init: () => T,
): [T, (u: T | ((p: T) => T)) => void] {
  const [state, setState] = useState<T>(
    () => read<T>(k(date, game, "state")) ?? init(),
  );
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    write(k(date, game, "state"), state);
  }, [state, date, game]);
  const set = useCallback(
    (u: T | ((p: T) => T)) => setState(u),
    [],
  );
  return [state, set];
}
