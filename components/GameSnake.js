"use client";
import { useEffect, useRef, useState } from "react";
import Screen from "./Screen";
import { COLS, ROWS, emptyGrid, normKey } from "@/lib/board";

function placeFood(snake) {
  while (true) {
    const f = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
    if (!snake.some((c) => c.x === f.x && c.y === f.y)) return f;
  }
}

const newState = () => {
  const snake = [
    { x: 4, y: 11 },
    { x: 4, y: 12 },
    { x: 4, y: 13 },
  ];
  return {
    snake,
    dir: { x: 0, y: -1 },
    queue: [],
    food: placeFood(snake),
    foods: 0,
    score: 0,
    level: 1,
    t: 0,
    over: false,
    paused: false,
    acc: 0,
  };
};

export default function GameSnake() {
  const g = useRef(newState());
  const [grid, setGrid] = useState(emptyGrid());
  const [hud, setHud] = useState({ score: 0, speed: 1, over: false, paused: false });

  const speedOf = (s) => s.level + Math.floor(s.t / 30000);

  const render = () => {
    const s = g.current;
    const view = emptyGrid();
    s.snake.forEach((c) => (view[c.y][c.x] = 8));
    view[s.food.y][s.food.x] = 2;
    setGrid(view);
    setHud({ score: s.score, speed: speedOf(s), over: s.over, paused: s.paused });
  };

  const step = () => {
    const s = g.current;
    if (s.queue.length) {
      const d = s.queue.shift();
      if (d.x !== -s.dir.x || d.y !== -s.dir.y) s.dir = d;
    }
    const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y };
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
      s.over = true;
      return;
    }
    const eats = head.x === s.food.x && head.y === s.food.y;
    const body = eats ? s.snake : s.snake.slice(0, -1);
    if (body.some((c) => c.x === head.x && c.y === head.y)) {
      s.over = true;
      return;
    }
    s.snake = [head, ...body];
    if (eats) {
      s.score += 10 * s.level;
      s.foods += 1;
      s.level = 1 + Math.floor(s.foods / 5);
      s.food = placeFood(s.snake);
    }
  };

  useEffect(() => {
    const id = setInterval(() => {
      const s = g.current;
      if (!s.over && !s.paused) {
        s.t += 50;
        s.acc += 50;
        const speed = Math.max(90, 280 - (speedOf(s) - 1) * 25);
        if (s.acc >= speed) {
          s.acc = 0;
          step();
        }
      }
      render();
    }, 50);

    const DIRS = {
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
    };

    const onKey = (e) => {
      const s = g.current;
      const k = normKey(e.key);
      if (k === "Enter") {
        if (s.over) g.current = newState();
        else s.paused = !s.paused;
        return;
      }
      if (s.over || s.paused) return;
      if (DIRS[k]) {
        e.preventDefault();
        if (s.queue.length < 2) s.queue.push(DIRS[k]);
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
          <div>Speed<div className="value">{hud.speed}</div></div>
          {hud.over && <div className="flash">GAME OVER · ENTER</div>}
          {hud.paused && !hud.over && <div className="flash">PAUSED</div>}
        </>
      }
    />
  );
}
