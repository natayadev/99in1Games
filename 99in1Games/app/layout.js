import "./globals.css";

export const metadata = {
  title: "99 in 1 — Pocket Brick Game",
  description:
    "Emulador retro de la Pocket Brick Game: Tetris, Tanques, Carreras, Viborita y Rompeladrillos.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
