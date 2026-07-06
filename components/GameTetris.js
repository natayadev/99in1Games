"use client";
import { useEffect, useRef, useState } from "react";
import Screen from "./Screen";
import { COLS, ROWS, emptyGrid, stamp, normKey, randColor } from "@/lib/board";

const SHAPES = [
  [[1, 1, 1, 1]],
  [[1, 1], [1, 1]],
  [[0, 1, 0], [1, 1, 1]],
  [[1, 0], [1, 0], [1, 1]],
  [[0, 1], [0, 1], [1, 1]],
  [[0, 1, 1], [1, 1, 0]],
  [[1, 1, 0], [0, 1, 1]],
];

const rotate = (s) => s[0].map((_, i) => s.map((r) => r[i]).reverse());

function collides(board, shape, px, py) {
  for (let y = 0; y < shape.length; y++)
    for (let x = 0; x < shape[y].length; x++) {
      if (!shape[y][x]) continue;
      const nx = px + x;
      const ny = py + y;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && board[ny][nx]) return true;
    }
  return false;
}

const newState = () => ({
  board: emptyGrid(),
  ...spawn(),
  score: 0,
  lines: 0,
  level: 1,
  t: 0,
  over: false,
  paused: false,
  acc: 0,
});

function spawn() {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  return {
    shape,
    x: Math.floor((COLS - shape[0].length) / 2),
    y: -shape.length,
    color: randColor(),
  };
}

export default function GameTetris() {
  const g = useRef(newState());
  const [grid, setGrid] = useState(emptyGrid());
  const [hud, setHud] = useState({ score: 0, lines: 0, speed: 1, over: false, paused: false });

  const speedOf = (s) => s.level + Math.floor(s.t / 30000);

  const render = () => {
    const s = g.current;
    const view = s.board.map((r) => [...r]);
    stamp(view, s.shape, s.x, s.y, s.color);
    setGrid(view);
    setHud({ score: s.score, lines: s.lines, speed: speedOf(s), over: s.over, paused: s.paused });
  };

  const lock = () => {
    const s = g.current;
    if (s.y < 0) {
      s.over = true;
      return;
    }
    stamp(s.board, s.shape, s.x, s.y, s.color);
    const kept = s.board.filter((row) => row.some((v) => !v));
    const cleared = ROWS - kept.length;
    if (cleared) {
      s.board = [
        ...Array.from({ length: cleared }, () => Array(COLS).fill(0)),
        ...kept,
      ];
      s.lines += cleared;
      s.score += [0, 100, 300, 500, 800][cleared] * s.level;
      s.level = 1 + Math.floor(s.lines / 8);
    }
    Object.assign(s, spawn());
    if (collides(s.board, s.shape, s.x, s.y)) s.over = true;
  };

  const drop = () => {
    const s = g.current;
    if (!collides(s.board, s.shape, s.x, s.y + 1)) s.y += 1;
    else lock();
  };

  useEffect(() => {
    const id = setInterval(() => {
      const s = g.current;
      if (!s.over && !s.paused) {
        s.t += 50;
        s.acc += 50;
        const speed = Math.max(100, 600 - (speedOf(s) - 1) * 60);
        if (s.acc >= speed) {
          s.acc = 0;
          drop();
        }
      }
      render();
    }, 50);

    const onKey = (e) => {
      const s = g.current;
      const k = normKey(e.key);
      if (k === "Enter") {
        if (s.over) g.current = newState();
        else s.paused = !s.paused;
        return;
      }
      if (s.over || s.paused) return;
      if (k === "ArrowLeft" && !collides(s.board, s.shape, s.x - 1, s.y)) s.x -= 1;
      else if (k === "ArrowRight" && !collides(s.board, s.shape, s.x + 1, s.y)) s.x += 1;
      else if (k === "ArrowDown") drop();
      else if (k === "ArrowUp") {
        const rot = rotate(s.shape);
        for (const off of [0, -1, 1, -2, 2])
          if (!collides(s.board, rot, s.x + off, s.y)) {
            s.shape = rot;
            s.x += off;
            break;
          }
      } else if (k === " ") {
        e.preventDefault();
        while (!collides(s.board, s.shape, s.x, s.y + 1)) s.y += 1;
        lock();
      }
      if (k.startsWith("Arrow")) e.preventDefault();
    };

    window.addEventListener("keydown", onKey);
    return () => {
      clearInterval(id);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <Screen
      grid={grid}
      panel={
        <>
          <div>Score<div className="value">{hud.score}</div></div>
          <div>Lines<div className="value">{hud.lines}</div></div>
          <div>Speed<div className="value">{hud.speed}</div></div>
          {hud.over && <div className="flash">GAME OVER · ENTER</div>}
          {hud.paused && !hud.over && <div className="flash">PAUSED</div>}
        </>
      }
    />
  );
}
