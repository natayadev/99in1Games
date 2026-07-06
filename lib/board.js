const KEYMAP = {
  w: "ArrowUp", W: "ArrowUp",
  a: "ArrowLeft", A: "ArrowLeft",
  s: "ArrowDown", S: "ArrowDown",
  d: "ArrowRight", D: "ArrowRight",
};
export const normKey = (key) => KEYMAP[key] || key;

export const COLS = 10;
export const ROWS = 20;

export const PALETTE = [
  "#9e0142", "#d53e4f", "#f46d43", "#fdae61", "#fee08b",
  "#e6f598", "#abdda4", "#66c2a5", "#3288bd", "#5e4fa2",
];

export const randColor = () => 1 + Math.floor(Math.random() * PALETTE.length);

export const emptyGrid = () =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(0));

export const stamp = (grid, shape, px, py, v = 1) => {
  for (let y = 0; y < shape.length; y++)
    for (let x = 0; x < shape[y].length; x++) {
      if (!shape[y][x]) continue;
      const ny = py + y;
      const nx = px + x;
      if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS) grid[ny][nx] = v;
    }
};
