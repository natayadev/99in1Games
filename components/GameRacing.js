"use client";
import { useEffect, useRef, useState } from "react";
import Screen from "./Screen";
import { ROWS, emptyGrid, stamp, normKey, randColor } from "@/lib/board";

const CAR = [
  [0, 1, 0],
  [1, 1, 1],
  [0, 1, 0],
  [1, 0, 1],
];
const LANES = [1, 4, 7];
const PLAYER_Y = ROWS - 4;

function hits(e, lane) {
  if (e.lane !== lane) return false;
  for (let r = 0; r < 4; r++) {
    const pr = e.y + r - PLAYER_Y;
    if (pr < 0 || pr >= 4) continue;
    for (let c = 0; c < 3; c++) if (CAR[r][c] && CAR[pr][c]) return true;
  }
  return false;
}

const newState = () => ({
  lane: 1,
  enemies: [],
  score: 0,
  level: 1,
  t: 0,
  off: 0,
  over: false,
  paused: false,
  acc: 0,
});

export default function GameRacing() {
  const g = useRef(newState());
  const [grid, setGrid] = useState(emptyGrid());
  const [hud, setHud] = useState({ score: 0, speed: 1, over: false, paused: false });

  const speedOf = (s) => s.level + Math.floor(s.t / 30000);

  const render = () => {
    const s = g.current;
    const view = emptyGrid();
    for (let y = 0; y < ROWS; y++) if ((y + s.off) % 4 !== 0) view[y][0] = 5;
    s.enemies.forEach((e) => stamp(view, CAR, LANES[e.lane], e.y, e.c));
    stamp(view, CAR, LANES[s.lane], PLAYER_Y, 9);
    setGrid(view);
    setHud({ score: s.score, speed: speedOf(s), over: s.over, paused: s.paused });
  };

  const step = () => {
    const s = g.current;
    s.off += 1;
    s.enemies.forEach((e) => (e.y += 1));
    const before = s.enemies.length;
    s.enemies = s.enemies.filter((e) => e.y < ROWS);
    s.score += (before - s.enemies.length) * 10;
    s.level = 1 + Math.floor(s.score / 100);
    if (s.enemies.every((e) => e.y >= 3) && Math.random() < 0.5) {
      s.enemies.push({ lane: Math.floor(Math.random() * 3), y: -4, c: randColor() });
    }
    if (s.enemies.some((e) => hits(e, s.lane))) s.over = true;
  };

  useEffect(() => {
    const id = setInterval(() => {
      const s = g.current;
      if (!s.over && !s.paused) {
        s.t += 50;
        s.acc += 50;
        const speed = Math.max(80, 300 - (speedOf(s) - 1) * 30);
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
      if (k === "ArrowLeft") s.lane = Math.max(0, s.lane - 1);
      else if (k === "ArrowRight") s.lane = Math.min(2, s.lane + 1);
      else if (k === "ArrowDown" || k === " ") {
        e.preventDefault();
        step();
        s.score += 1;
      }
      if (k.startsWith("Arrow")) e.preventDefault();
      if (s.enemies.some((en) => hits(en, s.lane))) s.over = true;
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
