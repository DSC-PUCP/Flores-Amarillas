import { Heart } from 'lucide-react';
import { useMemo } from 'react';

type HeartsVariant = 'hero' | 'section';

interface FloatingHeartsProps {
  variant?: HeartsVariant;
}

export function FloatingHearts({ variant = 'section' }: FloatingHeartsProps) {
  const hearts = useMemo(() => {
    const isHero = variant === 'hero';

    return Array.from({ length: isHero ? 10 : 70 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: isHero
        ? Math.random() * 80 + 20 // HERO → grandes
        : Math.random() * 40 + 20, // SECCIONES → pequeños
      animationDuration: isHero
        ? Math.random() * 10 + 14
        : Math.random() * 10 + 9,
      delay: Math.random() * 10,
      opacity: isHero ? Math.random() * 0.4 + 0.2 : Math.random() * 0.3 + 0.1,
      color: isHero
        ? Math.random() > 0.5
          ? 'text-rose-300'
          : 'text-pink-200'
        : Math.random() > 0.5
          ? 'text-rose-300/40'
          : 'text-pink-300/40',
    }));
  }, [variant]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className={`absolute ${heart.color} animate-float-fade`}
          style={
            {
              left: `${heart.left}%`,
              top: `${heart.top}%`,
              '--duration': `${heart.animationDuration}s`,
              '--delay': `${heart.delay}s`,
              '--heart-opacity': heart.opacity,
            } as any
          }
        >
          <Heart
            size={heart.size}
            strokeWidth={variant === 'hero' ? 2 : 1}
            fill={variant === 'hero' ? 'none' : 'currentColor'}
          />
        </div>
      ))}
    </div>
  );
}
