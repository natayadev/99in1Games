"use client";
import { useEffect, useState } from "react";
import { COLS, ROWS, emptyGrid } from "@/lib/board";
import Controls from "@/components/Controls";
import GameTetris from "@/components/GameTetris";
import GameTank from "@/components/GameTank";
import GameRacing from "@/components/GameRacing";
import GameSnake from "@/components/GameSnake";
import GameBreaker from "@/components/GameBreaker";

const GAMES = [
  { id: "tetris", label: "A · Tetris", Comp: GameTetris },
  { id: "tank", label: "B · Tanques", Comp: GameTank },
  { id: "racing", label: "C · Carreras", Comp: GameRacing },
  { id: "snake", label: "D · Viborita", Comp: GameSnake },
  { id: "breaker", label: "E · Rompeladrillos", Comp: GameBreaker },
];

export default function Home() {
  const [game, setGame] = useState(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setGame(null);
      const n = parseInt(e.key, 10);
      if (!game && n >= 1 && n <= GAMES.length) setGame(GAMES[n - 1].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [game]);

  const active = GAMES.find((x) => x.id === game);

  return (
    <main className="console">
      <h1>99 in 1</h1>
      <p className="subtitle">★ Pocket Brick Game ★</p>

      {active ? <active.Comp key={active.id} /> : <MenuScreen onPick={setGame} />}

      <Controls />

      <p className="hint">
        ←→↓ / ASD mover · ↑ / W girar-disparar · A acción · START pausa · MENÚ salir
      </p>
    </main>
  );
}

// Menú con la misma pantalla LCD (mismo tamaño que los juegos)
function MenuScreen({ onPick }) {
  const grid = emptyGrid();
  for (let y = 0; y < ROWS; y++) {
    grid[y][0] = 1;
    grid[y][COLS - 1] = 1;
  }
  for (let x = 0; x < COLS; x++) {
    grid[0][x] = 1;
    grid[ROWS - 1][x] = 1;
  }
  return (
    <div className="lcd">
      <div className="grid">
        {grid.flatMap((row, y) =>
          row.map((v, x) => (
            <div key={y * COLS + x} className={v ? "cell on" : "cell"} />
          ))
        )}
      </div>
      <div className="panel">
        <div>99 in 1<div className="value">★</div></div>
        <div className="flash">Elige juego 1-5</div>
      </div>
      <div className="menu-overlay">
        <ul className="menu">
          {GAMES.map((x, i) => (
            <li key={x.id}>
              <button onClick={() => onPick(x.id)}>
                {i + 1}. {x.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
