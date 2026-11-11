"use client";

export type KeyState = "correct" | "present" | "absent";

const ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

const STATE_CLASS: Record<KeyState, string> = {
  correct: "bg-emerald-500 text-white",
  present: "bg-amber-400 text-white",
  absent: "bg-slate-400 text-white",
};

export function Keyboard({
  onKey,
  onBack,
  onEnter,
  states = {},
}: {
  onKey: (letter: string) => void;
  onBack: () => void;
  onEnter?: () => void;
  states?: Record<string, KeyState>;
}) {
  const base =
    "h-12 rounded-lg font-bold text-sm sm:text-base select-none active:scale-95 transition-transform shadow-sm";
  return (
    <div className="mx-auto w-full max-w-lg space-y-1.5 px-1">
      {ROWS.map((row, i) => (
        <div key={row} className="flex justify-center gap-1">
          {i === 2 && onEnter && (
            <button
              onClick={onEnter}
              className={`${base} bg-indigo-600 px-3 text-white`}
            >
              ENVIAR
            </button>
          )}
          {row.split("").map((l) => (
            <button
              key={l}
              onClick={() => onKey(l)}
              className={`${base} min-w-0 flex-1 ${
                states[l] ? STATE_CLASS[states[l]] : "bg-white text-slate-800"
              }`}
            >
              {l}
            </button>
          ))}
          {i === 2 && (
            <button
              onClick={onBack}
              aria-label="Borrar"
              className={`${base} bg-white px-3 text-slate-800`}
            >
              ⌫
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
