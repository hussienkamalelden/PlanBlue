'use client';

const PIECES = [
  { left: '8%', delay: '0s', duration: '7s', color: '#027DDA', size: '6px' },
  { left: '18%', delay: '1.2s', duration: '8s', color: '#F7B90C', size: '5px' },
  { left: '28%', delay: '0.4s', duration: '6.5s', color: '#027DDA', size: '4px' },
  { left: '42%', delay: '2s', duration: '9s', color: '#F7B90C', size: '6px' },
  { left: '55%', delay: '0.8s', duration: '7.5s', color: '#027DDA', size: '5px' },
  { left: '68%', delay: '1.6s', duration: '8.5s', color: '#F7B90C', size: '4px' },
  { left: '78%', delay: '0.2s', duration: '6s', color: '#027DDA', size: '6px' },
  { left: '88%', delay: '2.4s', duration: '9.5s', color: '#F7B90C', size: '5px' },
  { left: '95%', delay: '1s', duration: '7s', color: '#027DDA', size: '4px' },
  { left: '35%', delay: '3s', duration: '8s', color: '#F7B90C', size: '5px' },
  { left: '62%', delay: '2.8s', duration: '7.2s', color: '#027DDA', size: '6px' },
  { left: '12%', delay: '3.5s', duration: '9s', color: '#F7B90C', size: '4px' },
];

export function FestivalConfetti() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {PIECES.map((piece, index) => (
        <span
          key={index}
          className="animate-confetti-fall absolute top-0 rounded-sm opacity-70"
          style={{
            left: piece.left,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
          }}
        />
      ))}
    </div>
  );
}
