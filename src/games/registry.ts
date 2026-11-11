export type GameMeta = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  /** clases completas de Tailwind (no se pueden armar dinámicamente) */
  gradient: string;
};

export const GAMES: GameMeta[] = [
  {
    id: "crucigrama",
    title: "Crucigrama",
    emoji: "🧩",
    description: "Grilla grande de 13×13 con pistas",
    gradient: "from-indigo-500 to-violet-500",
  },
  {
    id: "sudoku",
    title: "Sudoku",
    emoji: "🔢",
    description: "Completá la grilla sin repetir números",
    gradient: "from-sky-500 to-cyan-400",
  },
  {
    id: "wordle",
    title: "Palabra del día",
    emoji: "🔤",
    description: "Adiviná la palabra de 5 letras en 6 intentos",
    gradient: "from-emerald-500 to-lime-400",
  },
  {
    id: "sopa",
    title: "Sopa de letras",
    emoji: "🔍",
    description: "Encontrá todas las palabras escondidas",
    gradient: "from-orange-500 to-amber-400",
  },
  {
    id: "nonograma",
    title: "Nonograma",
    emoji: "🖼️",
    description: "Pintá casillas según los números",
    gradient: "from-fuchsia-500 to-pink-400",
  },
  {
    id: "cuenta",
    title: "Cuenta atrás",
    emoji: "➗",
    description: "Llegá al número con operaciones",
    gradient: "from-rose-500 to-red-400",
  },
  {
    id: "conexiones",
    title: "Conexiones",
    emoji: "🔗",
    description: "Agrupá 16 palabras en 4 categorías",
    gradient: "from-teal-500 to-emerald-400",
  },
  {
    id: "trivia",
    title: "Trivia",
    emoji: "🧠",
    description: "10 preguntas de cultura general",
    gradient: "from-yellow-500 to-orange-400",
  },
  {
    id: "timeline",
    title: "Línea de tiempo",
    emoji: "⏳",
    description: "Ordená los eventos del más antiguo al más nuevo",
    gradient: "from-blue-500 to-indigo-400",
  },
  {
    id: "criptico",
    title: "Críptico",
    emoji: "🕵️",
    description: "Pistas con anagramas escondidos",
    gradient: "from-purple-500 to-fuchsia-400",
  },
];

export const GAME_BY_ID = Object.fromEntries(GAMES.map((g) => [g.id, g]));
