"use client";

import { useEffect, useRef } from "react";

export type KeyHandler = (key: string) => void;

/**
 * Escucha el teclado físico. Entrega letras en mayúscula (A-Z) y los nombres
 * "Backspace", "Enter", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Tab", " ".
 */
export function useKeys(handler: KeyHandler, enabled = true) {
  const ref = useRef(handler);
  useEffect(() => {
    ref.current = handler;
  });
  useEffect(() => {
    if (!enabled) return;
    const onDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && /INPUT|TEXTAREA|SELECT/.test(t.tagName)) return;
      let key: string | null = null;
      if (/^[a-zA-Z]$/.test(e.key)) key = e.key.toUpperCase();
      else if (/^[0-9]$/.test(e.key)) key = e.key;
      else if (
        [
          "Backspace",
          "Delete",
          "Enter",
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "Tab",
          " ",
        ].includes(e.key)
      )
        key = e.key;
      if (!key) return;
      e.preventDefault();
      ref.current(key);
    };
    window.addEventListener("keydown", onDown);
    return () => window.removeEventListener("keydown", onDown);
  }, [enabled]);
}
