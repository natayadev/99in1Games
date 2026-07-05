"use client";

const press = (key) =>
  window.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));

export default function Controls({ onColor }) {
  return (
    <div className="controls">
      <div className="dpad">
        <button className="up" aria-label="Up" onClick={() => press("ArrowUp")}>▲</button>
        <button className="left" aria-label="Left" onClick={() => press("ArrowLeft")}>◀</button>
        <button className="mid" aria-hidden="true" tabIndex={-1} />
        <button className="right" aria-label="Right" onClick={() => press("ArrowRight")}>▶</button>
        <button className="down" aria-label="Down" onClick={() => press("ArrowDown")}>▼</button>
      </div>
      <div className="side-buttons">
        <button className="btn-small" onClick={() => press("Enter")}>START</button>
        <button className="btn-small" onClick={() => press("Escape")}>MENU</button>
        <button className="btn-small" onClick={onColor}>COLOR</button>
      </div>
      <button className="btn-action" onClick={() => press(" ")}>A</button>
    </div>
  );
}
