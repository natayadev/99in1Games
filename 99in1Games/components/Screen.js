import { PALETTE } from "@/lib/board";

export default function Screen({ grid, panel }) {
  return (
    <div className="lcd">
      <div className="grid">
        {grid.flatMap((row, y) =>
          row.map((v, x) => (
            <div
              key={y * 10 + x}
              className={v ? "cell on" : "cell"}
              style={v ? { "--on": PALETTE[(v - 1) % PALETTE.length] } : undefined}
            />
          ))
        )}
      </div>
      <div className="panel">{panel}</div>
    </div>
  );
}
