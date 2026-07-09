const COLORS = ['#58cc02', '#4aab00', '#ffc800', '#e6b000', '#ff4b4b'];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Dependency-free confetti burst — small colored rectangles animated with
 * the Web Animations API and removed on finish. No canvas, no npm package.
 * Reserved for genuine "you did well" moments (a perfect score), not every
 * correct answer — see STYLE.md's "celebratory touches" section.
 */
export function burstConfetti(originEl?: HTMLElement | null, count = 28): void {
  if (typeof document === 'undefined') return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

  const rect = originEl?.getBoundingClientRect();
  const originX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
  const originY = rect ? rect.top + rect.height / 2 : window.innerHeight / 3;

  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:100;overflow:hidden;';
  document.body.appendChild(container);

  for (let i = 0; i < count; i++) {
    const piece = document.createElement('span');
    const size = randomInt(6, 10);
    piece.style.cssText = `
      position:absolute;
      left:${originX}px;
      top:${originY}px;
      width:${size}px;
      height:${size * 0.6}px;
      background:${COLORS[randomInt(0, COLORS.length - 1)]};
      border-radius:2px;
    `;
    container.appendChild(piece);

    const angle = randomInt(0, 360) * (Math.PI / 180);
    const distance = randomInt(80, 220);
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance - randomInt(40, 120);
    const rotation = randomInt(-540, 540);
    const duration = randomInt(700, 1200);

    piece
      .animate(
        [
          { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
          {
            transform: `translate(${dx}px, ${dy + 300}px) rotate(${rotation}deg)`,
            opacity: 0,
            offset: 1,
          },
        ],
        { duration, easing: 'cubic-bezier(0.25, 0.8, 0.4, 1)', fill: 'forwards' }
      )
      .finished.then(() => piece.remove())
      .catch(() => piece.remove());
  }

  setTimeout(() => container.remove(), 1500);
}
