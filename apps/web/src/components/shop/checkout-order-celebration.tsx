'use client';

import { useEffect, useState } from 'react';

const CONFETTI = [
  { left: '6%', delay: '0s', duration: '2.8s', color: '#4389f7', size: 7, rotate: 15 },
  { left: '14%', delay: '0.15s', duration: '3.2s', color: '#e0a31e', size: 6, rotate: -20 },
  { left: '22%', delay: '0.05s', duration: '2.6s', color: '#4389f7', size: 5, rotate: 35 },
  { left: '31%', delay: '0.25s', duration: '3.4s', color: '#f7b90c', size: 7, rotate: -10 },
  { left: '39%', delay: '0.1s', duration: '2.9s', color: '#4389f7', size: 6, rotate: 25 },
  { left: '48%', delay: '0.35s', duration: '3.1s', color: '#e0a31e', size: 5, rotate: -30 },
  { left: '56%', delay: '0.08s', duration: '2.7s', color: '#4389f7', size: 7, rotate: 12 },
  { left: '64%', delay: '0.22s', duration: '3.3s', color: '#f7b90c', size: 6, rotate: -18 },
  { left: '72%', delay: '0.12s', duration: '2.5s', color: '#4389f7', size: 5, rotate: 40 },
  { left: '80%', delay: '0.28s', duration: '3s', color: '#e0a31e', size: 7, rotate: -25 },
  { left: '88%', delay: '0.18s', duration: '2.8s', color: '#4389f7', size: 6, rotate: 8 },
  { left: '94%', delay: '0.32s', duration: '3.2s', color: '#f7b90c', size: 5, rotate: -35 },
  { left: '18%', delay: '0.45s', duration: '3.5s', color: '#4389f7', size: 6, rotate: 22 },
  { left: '44%', delay: '0.52s', duration: '3.1s', color: '#e0a31e', size: 7, rotate: -12 },
  { left: '68%', delay: '0.48s', duration: '2.9s', color: '#4389f7', size: 5, rotate: 30 },
  { left: '85%', delay: '0.55s', duration: '3.3s', color: '#f7b90c', size: 6, rotate: -28 },
] as const;

const FIREWORKS = [
  { top: '18%', left: '12%', delay: '0.2s', color: '#4389f7' },
  { top: '14%', left: '82%', delay: '0.55s', color: '#e0a31e' },
  { top: '24%', left: '50%', delay: '0.85s', color: '#4389f7' },
  { top: '10%', left: '35%', delay: '1.15s', color: '#f7b90c' },
  { top: '20%', left: '68%', delay: '1.45s', color: '#4389f7' },
] as const;

const SPARK_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

export function CheckoutOrderCelebration() {
  const [active, setActive] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setActive(false), 5200);
    return () => window.clearTimeout(timer);
  }, []);

  if (!active) {
    return null;
  }

  return (
    <div className="pb-checkout-celebration" aria-hidden>
      {CONFETTI.map((piece, index) => (
        <span
          key={`confetti-${index}`}
          className="pb-checkout-celebration__confetti"
          style={{
            left: piece.left,
            width: piece.size,
            height: piece.size * 1.4,
            backgroundColor: piece.color,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
            transform: `rotate(${piece.rotate}deg)`,
          }}
        />
      ))}

      {FIREWORKS.map((firework, index) => (
        <div
          key={`firework-${index}`}
          className="pb-checkout-celebration__firework"
          style={{
            top: firework.top,
            left: firework.left,
            animationDelay: firework.delay,
            ['--firework-color' as string]: firework.color,
          }}
        >
          {SPARK_ANGLES.map((angle) => (
            <span
              key={angle}
              className="pb-checkout-celebration__spark"
              style={{ ['--spark-angle' as string]: `${angle}deg` }}
            />
          ))}
        </div>
      ))}

      <div className="pb-checkout-celebration__rocket pb-checkout-celebration__rocket--left">
        <span className="pb-checkout-celebration__rocket-icon" />
        <span className="pb-checkout-celebration__rocket-trail" />
      </div>

      <div className="pb-checkout-celebration__rocket pb-checkout-celebration__rocket--right">
        <span className="pb-checkout-celebration__rocket-icon" />
        <span className="pb-checkout-celebration__rocket-trail" />
      </div>
    </div>
  );
}
