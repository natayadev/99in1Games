"use client";
import { useEffect, useRef, useState } from "react";
import Screen from "./Screen";
import { COLS, ROWS, emptyGrid, normKey } from "@/lib/board";

const PADDLE_Y = ROWS - 1;
const PADDLE_W = 3;

const newBricks = () =>
  Array.from({ length: 4 }, (_, y) => Array(COLS).fill(y + 2));

const newState = (level = 1, score = 0, lives = 3) => ({
  bricks: newBricks(),
  paddle: 3,
  ball: { x: 4, y: PADDLE_Y - 1, dx: 1, dy: -1 },
  stuck: true,
  score,
  lives,
  level,
  t: 0,
  over: false,
  paused: false,
  acc: 0,
});

export default function GameBreaker() {
  const g = useRef(newState());
  const [grid, setGrid] = useState(emptyGrid());
  const [hud, setHud] = useState({ score: 0, lives: 3, speed: 1, over: false, paused: false });

  const speedOf = (s) => s.level + Math.floor(s.t / 30000);

  const render = () => {
    const s = g.current;
    const view = emptyGrid();
    s.bricks.forEach((row, y) => row.forEach((v, x) => (view[y][x] = v)));
    for (let i = 0; i < PADDLE_W; i++) view[PADDLE_Y][s.paddle + i] = 10;
    if (s.ball.y >= 0 && s.ball.y < ROWS) view[s.ball.y][s.ball.x] = 1;
    setGrid(view);
    setHud({ score: s.score, lives: s.lives, speed: speedOf(s), over: s.over, paused: s.paused });
  };

  const step = () => {
    const s = g.current;
    if (s.stuck) {
      s.ball.x = s.paddle + 1;
      s.ball.y = PADDLE_Y - 1;
      return;
    }
    const b = s.ball;
    let nx = b.x + b.dx;
    let ny = b.y + b.dy;
    if (nx < 0 || nx >= COLS) {
      b.dx = -b.dx;
      nx = b.x + b.dx;
    }
    if (ny < 0) {
      b.dy = -b.dy;
      ny = b.y + b.dy;
    }
    if (ny >= 0 && ny < s.bricks.length && s.bricks[ny][nx]) {
      s.bricks[ny][nx] = 0;
      s.score += 10 * s.level;
      b.dy = -b.dy;
      if (s.bricks.every((row) => row.every((v) => !v))) {
        g.current = newState(s.level + 1, s.score, s.lives);
        return;
      }
      return;
    }
    if (ny === PADDLE_Y) {
      if (nx >= s.paddle && nx < s.paddle + PADDLE_W) {
        b.dy = -1;
        if (nx === s.paddle) b.dx = -1;
        else if (nx === s.paddle + PADDLE_W - 1) b.dx = 1;
        b.y = PADDLE_Y - 1;
        b.x = nx;
        return;
      }
    }
    if (ny >= ROWS) {
      s.lives -= 1;
      if (s.lives <= 0) s.over = true;
      else s.stuck = true;
      return;
    }
    b.x = nx;
    b.y = ny;
  };

  useEffect(() => {
    const id = setInterval(() => {
      const s = g.current;
      if (!s.over && !s.paused) {
        s.t += 50;
        s.acc += 50;
        const speed = Math.max(70, 170 - (speedOf(s) - 1) * 20);
        if (s.acc >= speed) {
          s.acc = 0;
          step();
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
      if (k === "ArrowLeft") s.paddle = Math.max(0, s.paddle - 1);
      else if (k === "ArrowRight") s.paddle = Math.min(COLS - PADDLE_W, s.paddle + 1);
      else if (k === " " || k === "ArrowUp") {
        e.preventDefault();
        if (s.stuck) {
          s.stuck = false;
          s.ball.dx = Math.random() < 0.5 ? -1 : 1;
          s.ball.dy = -1;
        }
      }
      if (k.startsWith("Arrow")) e.preventDefault();
      if (s.stuck) {
        s.ball.x = s.paddle + 1;
      }
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
          <div>Lives<div className="value">{hud.lives}</div></div>
          <div>Speed<div className="value">{hud.speed}</div></div>
          {hud.over && <div className="flash">GAME OVER · ENTER</div>}
          {hud.paused && !hud.over && <div className="flash">PAUSED</div>}
        </>
      }
    />
  );
}
