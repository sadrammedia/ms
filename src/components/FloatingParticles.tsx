import React, { useMemo } from 'react';

interface FloatingParticlesProps {
  type?: 'none' | 'petals' | 'sparkles' | 'stars' | 'balloons';
  color?: string;
}

export const FloatingParticles: React.FC<FloatingParticlesProps> = ({
  type = 'none',
  color = '#C5A059'
}) => {
  if (type === 'none') return null;

  // Generate deterministic-looking random particle positions
  const particles = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: `${(i * 5.7) % 94 + 3}%`,
      delay: `${(i * 0.45) % 6}s`,
      duration: `${6 + ((i * 1.3) % 7)}s`,
      size: 10 + (i % 4) * 5,
      rotation: (i * 47) % 360,
      opacity: 0.35 + ((i % 5) * 0.12)
    }));
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden" aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: p.left,
            bottom: type === 'petals' ? 'auto' : '-30px',
            top: type === 'petals' ? '-30px' : 'auto',
            animation: type === 'petals' 
              ? `fallingPetals ${p.duration} linear infinite` 
              : `floatingUpward ${p.duration} ease-in-out infinite`,
            animationDelay: p.delay,
            opacity: p.opacity
          }}
        >
          {type === 'petals' && (
            <svg
              width={p.size}
              height={p.size * 1.3}
              viewBox="0 0 24 32"
              fill={color}
              style={{
                transform: `rotate(${p.rotation}deg)`,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }}
            >
              <path d="M12 0C7 8 2 16 2 24a10 10 0 0020 0C22 16 17 8 12 0z" opacity="0.85" />
            </svg>
          )}

          {type === 'sparkles' && (
            <svg
              width={p.size * 0.9}
              height={p.size * 0.9}
              viewBox="0 0 24 24"
              fill={color}
              style={{
                transform: `rotate(${p.rotation}deg)`,
                filter: 'drop-shadow(0 0 6px rgba(255,215,0,0.5))'
              }}
            >
              <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0z" />
            </svg>
          )}

          {type === 'stars' && (
            <svg
              width={p.size * 0.8}
              height={p.size * 0.8}
              viewBox="0 0 24 24"
              fill={color}
              style={{
                transform: `rotate(${p.rotation}deg)`,
                filter: 'drop-shadow(0 0 5px rgba(212,175,55,0.4))'
              }}
            >
              <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
            </svg>
          )}

          {type === 'balloons' && (
            <svg
              width={p.size * 1.2}
              height={p.size * 1.6}
              viewBox="0 0 24 32"
              fill={color}
              style={{
                filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.12))'
              }}
            >
              <ellipse cx="12" cy="12" rx="10" ry="12" />
              <polygon points="12,24 9,28 15,28" />
              <path d="M12 28 Q 14 31 12 34" stroke={color} strokeWidth="1" fill="none" />
            </svg>
          )}
        </div>
      ))}

      <style>{`
        @keyframes fallingPetals {
          0% {
            transform: translateY(0) rotate(0deg) translateX(0);
          }
          50% {
            transform: translateY(50vh) rotate(180deg) translateX(25px);
          }
          100% {
            transform: translateY(105vh) rotate(360deg) translateX(-15px);
          }
        }
        @keyframes floatingUpward {
          0% {
            transform: translateY(0) rotate(0deg) scale(0.85);
          }
          50% {
            transform: translateY(-50vh) rotate(15deg) scale(1.05);
          }
          100% {
            transform: translateY(-105vh) rotate(-15deg) scale(0.9);
          }
        }
      `}</style>
    </div>
  );
};
