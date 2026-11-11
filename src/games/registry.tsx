import {
  Brain,
  Brush,
  Calculator,
  CaseSensitive,
  Grid3x3,
  Hash,
  Hourglass,
  KeyRound,
  Link2,
  Search,
  type LucideIcon,
} from "lucide-react";

export type GameMeta = {
  id: string;
  title: string;
  Icon: LucideIcon;
  description: string;
  /** reglas cortas para el panel "¿Cómo se juega?" */
  howTo: string;
  /** clases completas de Tailwind (no se pueden armar dinámicamente); todas cumplen contraste AA con texto blanco */
  gradient: string;
};

export const GAMES: GameMeta[] = [
  {
    id: "crucigrama",
    title: "Crucigrama",
    Icon: Grid3x3,
    description: "Grilla grande de 13×13 con pistas",
    howTo:
      "Tocá una casilla y escribí la respuesta de la pista. Tocá de nuevo la misma casilla (o Enter) para cambiar entre horizontal y vertical. Podés revisar errores, pero cada revisión resta 10 puntos.",
    gradient: "from-indigo-600 to-violet-700",
  },
  {
    id: "sudoku",
    title: "Sudoku",
    Icon: Hash,
    description: "Completá la grilla sin repetir números",
    howTo:
      "Cada fila, columna y cuadro de 3×3 debe tener los números del 1 al 9 sin repetir. Cada número equivocado resta 10 puntos.",
    gradient: "from-sky-700 to-blue-700",
  },
  {
    id: "wordle",
    title: "Palabra del día",
    Icon: CaseSensitive,
    description: "Adiviná la palabra de 5 letras en 6 intentos",
    howTo:
      "Escribí una palabra de 5 letras. Verde: letra bien ubicada. Amarillo: está en la palabra pero en otro lugar. Gris: no está. Cuantos menos intentos, más puntos.",
    gradient: "from-emerald-700 to-teal-700",
  },
  {
    id: "sopa",
    title: "Sopa de letras",
    Icon: Search,
    description: "Encontrá todas las palabras escondidas",
    howTo:
      "Las palabras pueden estar en cualquier dirección. Tocá la primera y la última letra de cada una. Los intentos fallidos restan puntos.",
    gradient: "from-orange-700 to-amber-700",
  },
  {
    id: "nonograma",
    title: "Nonograma",
    Icon: Brush,
    description: "Pintá casillas según los números",
    howTo:
      "Cada número indica cuántas casillas seguidas van pintadas en esa fila o columna. Usá “Marcar vacío” para anotar las que seguro no van. Borrar una casilla pintada resta puntos.",
    gradient: "from-fuchsia-700 to-pink-600",
  },
  {
    id: "cuenta",
    title: "Cuenta atrás",
    Icon: Calculator,
    description: "Llegá al número con operaciones",
    howTo:
      "Tocá un número, una operación y otro número. Cada número se usa una sola vez y los resultados deben ser enteros positivos. Entregá el más cercano al objetivo.",
    gradient: "from-rose-600 to-red-700",
  },
  {
    id: "conexiones",
    title: "Conexiones",
    Icon: Link2,
    description: "Agrupá 16 palabras en 4 categorías",
    howTo:
      "Elegí 4 palabras que tengan algo en común y tocá Enviar. Tenés 4 errores. Hay palabras que parecen de dos grupos: ¡cuidado!",
    gradient: "from-teal-700 to-cyan-700",
  },
  {
    id: "trivia",
    title: "Trivia",
    Icon: Brain,
    description: "10 preguntas de cultura general",
    howTo: "Respondé 10 preguntas de opción múltiple. Cada acierto suma 10 puntos.",
    gradient: "from-amber-700 to-yellow-700",
  },
  {
    id: "timeline",
    title: "Línea de tiempo",
    Icon: Hourglass,
    description: "Ordená los eventos del más antiguo al más nuevo",
    howTo:
      "Usá las flechas para ordenar 5 eventos del más antiguo (arriba) al más reciente (abajo). Tenés 3 intentos; los eventos bien ubicados quedan fijos.",
    gradient: "from-blue-600 to-indigo-700",
  },
  {
    id: "criptico",
    title: "Críptico",
    Icon: KeyRound,
    description: "Pistas con anagramas escondidos",
    howTo:
      "Cada pista esconde las letras mezcladas de la respuesta y una definición. Tenés 2 intentos por pista: a la primera suma 20 puntos, a la segunda 10.",
    gradient: "from-purple-600 to-fuchsia-700",
  },
];

export const GAME_BY_ID = Object.fromEntries(GAMES.map((g) => [g.id, g]));
