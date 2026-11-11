import type { ComponentType } from "react";
import type { GameResult } from "@/lib/storage";
import Crucigrama from "./crucigrama/Crucigrama";
import Sudoku from "./sudoku/Sudoku";
import Wordle from "./wordle/Wordle";
import Sopa from "./sopa/Sopa";
import Nonograma from "./nonograma/Nonograma";
import Cuenta from "./cuenta/Cuenta";
import Conexiones from "./conexiones/Conexiones";
import Trivia from "./trivia/Trivia";
import Timeline from "./timeline/Timeline";
import Criptico from "./criptico/Criptico";

export type GameProps = {
  dateKey: string;
  onFinish: (r: GameResult) => void;
};

export const GAME_COMPONENTS: Record<string, ComponentType<GameProps>> = {
  crucigrama: Crucigrama,
  sudoku: Sudoku,
  wordle: Wordle,
  sopa: Sopa,
  nonograma: Nonograma,
  cuenta: Cuenta,
  conexiones: Conexiones,
  trivia: Trivia,
  timeline: Timeline,
  criptico: Criptico,
};
