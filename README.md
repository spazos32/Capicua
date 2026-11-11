# Capicúa

Minijuegos nuevos todos los días, para jugar con amigos. Sin login ni backend: el puzzle del día se genera en el navegador a partir de la fecha (horario de Argentina), así que todos juegan el mismo, y el progreso se guarda en `localStorage`.

## Juegos

| Juego | Cómo se arma el puzzle del día |
|---|---|
| Crucigrama 13×13 | Se genera con un banco de ~190 palabras con pista (`src/games/crucigrama/clues.ts`) |
| Sudoku | Se genera con solución única |
| Palabra del día | Lista de palabras de 5 letras |
| Sopa de letras | Tema y palabras del día, 12×12 con 8 direcciones |
| Nonograma | Dibujo simétrico 10×10 generado |
| Cuenta atrás | 6 números y un objetivo siempre alcanzable |
| Conexiones | Puzzles curados a mano |
| Trivia | 10 preguntas de un banco de ~50 |
| Línea de tiempo | 5 eventos de un banco, ordenar en 3 intentos |
| Críptico | 5 pistas de anagrama de un banco |

Cada juego da de 0 a 100 puntos y el resultado se puede copiar para compartir.

## Desarrollo

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

Stack: Next.js (App Router) + TypeScript + Tailwind. Pensado para desplegar en Vercel.

## Estructura

- `src/lib/` — fecha diaria, generador aleatorio con semilla, guardado local
- `src/components/` — pantalla de juego, teclado en pantalla
- `src/games/registry.ts` — lista de juegos de la portada
- `src/games/<juego>/` — un componente por juego (más sus datos o generador)

## Próximos pasos

- Cuentas, grupos con código de invitación y leaderboard (Supabase)
- Más puzzles curados (conexiones, críptico, trivia) y crucigramas con pistas revisadas
