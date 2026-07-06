"use client";
import { useEffect, useState } from "react";
import { COLS, ROWS, emptyGrid, normKey, PALETTE } from "@/lib/board";
import Controls from "@/components/Controls";
import GameTetris from "@/components/GameTetris";
import GameTank from "@/components/GameTank";
import GameRacing from "@/components/GameRacing";
import GameSnake from "@/components/GameSnake";
import GameBreaker from "@/components/GameBreaker";

const GAMES = [
  { id: "tetris", label: "Tetris", Comp: GameTetris },
  { id: "tank", label: "Battle Tank", Comp: GameTank },
  { id: "racing", label: "Formula 1", Comp: GameRacing },
  { id: "snake", label: "Snake", Comp: GameSnake },
  { id: "breaker", label: "Brick Breaker", Comp: GameBreaker },
];

export default function Home() {
  const [game, setGame] = useState(null);
  const [rainbow, setRainbow] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("rainbow", rainbow);
  }, [rainbow]);

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
      {active ? <active.Comp key={active.id} /> : <MenuScreen onPick={setGame} />}

      <Controls onColor={() => setRainbow((r) => !r)} />
    </main>
  );
}

function MenuScreen({ onPick }) {
  const [sel, setSel] = useState(0);

  useEffect(() => {
    const onKey = (e) => {
      const k = normKey(e.key);
      if (k === "ArrowUp") {
        e.preventDefault();
        setSel((s) => (s + GAMES.length - 1) % GAMES.length);
      } else if (k === "ArrowDown") {
        e.preventDefault();
        setSel((s) => (s + 1) % GAMES.length);
      } else if (k === "Enter" || k === " ") {
        e.preventDefault();
        onPick(GAMES[sel].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sel, onPick]);

  const grid = emptyGrid();
  for (let y = 0; y < ROWS; y++) {
    grid[y][0] = (y % 10) + 1;
    grid[y][COLS - 1] = ((y + 5) % 10) + 1;
  }
  for (let x = 0; x < COLS; x++) {
    grid[0][x] = (x % 10) + 1;
    grid[ROWS - 1][x] = ((x + 5) % 10) + 1;
  }
  return (
    <div className="lcd">
      <div className="grid">
        {grid.flatMap((row, y) =>
          row.map((v, x) => (
            <div
              key={y * COLS + x}
              className={v ? "cell on" : "cell"}
              style={v ? { "--on": PALETTE[(v - 1) % PALETTE.length] } : undefined}
            />
          ))
        )}
      </div>
      <div className="panel">
        <div className="flash">Pick game</div>
        <div className="howto">
          <div>How to play</div>
          <p>←→↓ / ADS move</p>
          <p>↑ / W rotate·shoot</p>
          <p>SPACE / A action</p>
          <p>ENTER pause</p>
          <p>ESC exit</p>
        </div>
      </div>
      <div className="menu-overlay">
        <ul className="menu">
          {GAMES.map((x, i) => (
            <li key={x.id}>
              <button
                className={i === sel ? "selected" : ""}
                onMouseEnter={() => setSel(i)}
                onClick={() => onPick(x.id)}
              >
                {i + 1}. {x.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
