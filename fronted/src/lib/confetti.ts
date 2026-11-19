const COLORS = [
  "#002fa7",
  "#82aaff",
  "#4ade80",
  "#f7c948",
  "#f06b6b",
  "#8f6fd9",
  "#22aeb8",
];

export function burstConfetti(x: number, y: number, count = 36): void {
  if (
    typeof window === "undefined" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  for (let i = 0; i < count; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";

    const angle = Math.random() * Math.PI * 2;
    const distance = 60 + Math.random() * 150;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance - 90;

    piece.style.left = `${x}px`;
    piece.style.top = `${y}px`;
    piece.style.background = COLORS[i % COLORS.length];
    piece.style.setProperty("--dx", `${dx}px`);
    piece.style.setProperty("--dy", `${dy}px`);
    piece.style.setProperty("--rot", `${Math.round(Math.random() * 720 - 360)}deg`);
    piece.style.animationDelay = `${Math.random() * 0.08}s`;

    document.body.appendChild(piece);
    piece.addEventListener("animationend", () => piece.remove());
  }
}
