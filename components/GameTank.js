"use client";
import { useEffect, useRef, useState } from "react";
import Screen from "./Screen";
import { COLS, ROWS, emptyGrid, stamp, normKey, randColor } from "@/lib/board";

const TANK_UP = [
  [0, 1, 0],
  [1, 1, 1],
  [1, 0, 1],
];
const TANK_DOWN = [
  [1, 0, 1],
  [1, 1, 1],
  [0, 1, 0],
];
const PLAYER_Y = ROWS - 3;

const inEnemy = (e, x, y) => {
  const r = y - e.y;
  const c = x - e.x;
  return r >= 0 && r < 3 && c >= 0 && c < 3 && TANK_DOWN[r][c] === 1;
};

const overlapsPlayer = (e, px) => {
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++) {
      if (!TANK_DOWN[r][c]) continue;
      const pr = e.y + r - PLAYER_Y;
      const pc = e.x + c - px;
      if (pr >= 0 && pr < 3 && pc >= 0 && pc < 3 && TANK_UP[pr][pc]) return true;
    }
  return false;
};

const newState = () => ({
  x: 3,
  bullets: [],
  enemies: [],
  score: 0,
  level: 1,
  t: 0,
  tick: 0,
  over: false,
  paused: false,
});

export default function GameTank() {
  const g = useRef(newState());
  const [grid, setGrid] = useState(emptyGrid());
  const [hud, setHud] = useState({ score: 0, speed: 1, over: false, paused: false });

  const speedOf = (s) => s.level + Math.floor(s.t / 30000);

  const render = () => {
    const s = g.current;
    const view = emptyGrid();
    s.enemies.forEach((e) => stamp(view, TANK_DOWN, e.x, e.y, e.c));
    stamp(view, TANK_UP, s.x, PLAYER_Y, 9);
    s.bullets.forEach((b) => {
      if (b.y >= 0 && b.y < ROWS) view[b.y][b.x] = 2;
    });
    setGrid(view);
    setHud({ score: s.score, speed: speedOf(s), over: s.over, paused: s.paused });
  };

  const resolveHits = () => {
    const s = g.current;
    s.bullets = s.bullets.filter((b) => {
      const hit = s.enemies.find((e) => inEnemy(e, b.x, b.y));
      if (hit) {
        s.enemies = s.enemies.filter((e) => e !== hit);
        s.score += 100;
        s.level = 1 + Math.floor(s.score / 500);
        return false;
      }
      return b.y >= 0;
    });
  };

  const step = () => {
    const s = g.current;
    s.t += 60;
    s.tick += 1;
    if (s.tick % 2 === 0) {
      s.bullets.forEach((b) => (b.y -= 1));
      resolveHits();
    }
    const enemySpeed = Math.max(3, 12 - speedOf(s));
    if (s.tick % enemySpeed === 0) {
      s.enemies.forEach((e) => (e.y += 1));
      resolveHits();
      s.enemies = s.enemies.filter((e) => e.y < ROWS);
      if (s.enemies.some((e) => overlapsPlayer(e, s.x))) s.over = true;
    }
    if (s.tick % 25 === 0 && s.enemies.length < 3) {
      const x = Math.floor(Math.random() * (COLS - 2));
      if (!s.enemies.some((e) => Math.abs(e.x - x) < 3 && e.y < 4))
        s.enemies.push({ x, y: -3, c: randColor() });
    }
  };

  useEffect(() => {
    const id = setInterval(() => {
      const s = g.current;
      if (!s.over && !s.paused) step();
      render();
    }, 60);

    const onKey = (e) => {
      const s = g.current;
      const k = normKey(e.key);
      if (k === "Enter") {
        if (s.over) g.current = newState();
        else s.paused = !s.paused;
        return;
      }
      if (s.over || s.paused) return;
      if (k === "ArrowLeft") s.x = Math.max(0, s.x - 1);
      else if (k === "ArrowRight") s.x = Math.min(COLS - 3, s.x + 1);
      else if (k === " " || k === "ArrowUp") {
        e.preventDefault();
        if (s.bullets.length < 4)
          s.bullets.push({ x: s.x + 1, y: PLAYER_Y - 1 });
        resolveHits();
      }
      if (k.startsWith("Arrow")) e.preventDefault();
      if (s.enemies.some((en) => overlapsPlayer(en, s.x))) s.over = true;
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
