'use client';

const CONFETTI_COLORS = ['#4389f7', '#e0a31e', '#f7b90c', '#22c55e', '#16a34a'] as const;

const CONFETTI = Array.from({ length: 52 }, (_, index) => ({
  left: `${((index * 1.92 + (index % 4) * 1.3) % 97) + 1.5}%`,
  delay: `${((index * 0.07) % 2.8).toFixed(2)}s`,
  duration: `${(2 + (index % 6) * 0.32).toFixed(2)}s`,
  color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
  size: 9 + (index % 5),
  variant: index % 3,
}));

const FIREWORKS = [
  { top: '12%', left: '8%', delay: '0s', color: '#4389f7' },
  { top: '8%', left: '28%', delay: '0.45s', color: '#22c55e' },
  { top: '16%', left: '48%', delay: '0.9s', color: '#e0a31e' },
  { top: '10%', left: '68%', delay: '1.35s', color: '#4389f7' },
  { top: '14%', left: '88%', delay: '1.8s', color: '#f7b90c' },
  { top: '22%', left: '18%', delay: '2.25s', color: '#16a34a' },
  { top: '20%', left: '38%', delay: '2.7s', color: '#4389f7' },
  { top: '18%', left: '58%', delay: '0.3s', color: '#e0a31e' },
  { top: '24%', left: '78%', delay: '0.75s', color: '#22c55e' },
  { top: '6%', left: '92%', delay: '1.2s', color: '#4389f7' },
  { top: '26%', left: '5%', delay: '1.65s', color: '#f7b90c' },
  { top: '28%', left: '92%', delay: '2.1s', color: '#16a34a' },
] as const;

const SPARK_ANGLES = Array.from({ length: 16 }, (_, index) => index * 22.5);

export function CheckoutOrderCelebration() {
  return (
    <div className="pb-checkout-celebration" aria-hidden>
      {CONFETTI.map((piece, index) => (
        <span
          key={`confetti-${index}`}
          className={`pb-checkout-celebration__confetti pb-checkout-celebration__confetti--v${piece.variant}`}
          style={{
            left: piece.left,
            width: piece.size,
            height: piece.variant === 2 ? piece.size * 0.45 : piece.size * 1.35,
            backgroundColor: piece.color,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
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
              key={`inner-${angle}`}
              className="pb-checkout-celebration__spark pb-checkout-celebration__spark--inner"
              style={{
                ['--spark-angle' as string]: `${angle}deg`,
                animationDelay: firework.delay,
              }}
            />
          ))}
          {SPARK_ANGLES.map((angle) => (
            <span
              key={`outer-${angle}`}
              className="pb-checkout-celebration__spark pb-checkout-celebration__spark--outer"
              style={{
                ['--spark-angle' as string]: `${angle + 11.25}deg`,
                animationDelay: firework.delay,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
