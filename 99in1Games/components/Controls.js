"use client";

const press = (key) =>
  window.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));

export default function Controls() {
  return (
    <div className="controls">
      <div className="dpad">
        <button className="up" aria-label="Arriba" onClick={() => press("ArrowUp")}>▲</button>
        <button className="left" aria-label="Izquierda" onClick={() => press("ArrowLeft")}>◀</button>
        <button className="mid" aria-hidden="true" tabIndex={-1} />
        <button className="right" aria-label="Derecha" onClick={() => press("ArrowRight")}>▶</button>
        <button className="down" aria-label="Abajo" onClick={() => press("ArrowDown")}>▼</button>
      </div>
      <div className="side-buttons">
        <button className="btn-small" onClick={() => press("Enter")}>START</button>
        <button className="btn-small" onClick={() => press("Escape")}>MENÚ</button>
      </div>
      <button className="btn-action" onClick={() => press(" ")}>A</button>
    </div>
  );
}
