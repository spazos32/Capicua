import GamePage from "@/components/GamePage";
import { GAMES } from "@/games/registry";

// Las 10 rutas se generan estáticas; no hace falta validar navegación instantánea.
export const instant = false;

export function generateStaticParams() {
  return GAMES.map((g) => ({ id: g.id }));
}

export default async function Page(props: PageProps<"/juego/[id]">) {
  const { id } = await props.params;
  return <GamePage id={id} />;
}
