// WASD funciona igual que las flechas
const KEYMAP = {
  w: "ArrowUp", W: "ArrowUp",
  a: "ArrowLeft", A: "ArrowLeft",
  s: "ArrowDown", S: "ArrowDown",
  d: "ArrowRight", D: "ArrowRight",
};
export const normKey = (key) => KEYMAP[key] || key;

export const COLS = 10;
export const ROWS = 20;

export const emptyGrid = () =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(0));

// Dibuja una figura (matriz de 0/1) sobre la cuadrícula
export const stamp = (grid, shape, px, py) => {
  for (let y = 0; y < shape.length; y++)
    for (let x = 0; x < shape[y].length; x++) {
      if (!shape[y][x]) continue;
      const ny = py + y;
      const nx = px + x;
      if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS) grid[ny][nx] = 1;
    }
};
