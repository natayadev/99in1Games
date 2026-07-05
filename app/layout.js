import "./globals.css";

export const metadata = {
  title: "99 in 1 — Pocket Brick Game",
  description:
    "Retro Pocket Brick Game emulator: Tetris, Battle Tank, Formula 1, Snake and Brick Breaker.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
