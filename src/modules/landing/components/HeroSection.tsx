import {
  ArrowDown,
  ArrowRight,
  Check,
  Flower2,
  Heart,
  MousePointer2,
} from 'lucide-react';
import type { CSSProperties, MouseEvent } from 'react';
import { Ambient } from '../art/Ambient';
import { useParallax } from '../hooks/useParallax';

interface HeroSectionProps {
  onViewDemo: (e: MouseEvent) => void;
  onCreateGift: (e: MouseEvent) => void;
}

/** Palabras de la cinta. Se repiten dos veces para que la marquesina no corte. */
const RIBBON_WORDS = [
  'Tus palabras',
  'Sus fotos favoritas',
  'Una sorpresa por descubrir',
  'Un enlace para regalar',
];

function RibbonTrack({ hidden }: { hidden?: boolean }) {
  return (
    <div className="bloom-ribbon-track" aria-hidden={hidden || undefined}>
      {RIBBON_WORDS.map((word) => (
        <span key={word} className="bloom-ribbon-item">
          {word}
          <Flower2 />
        </span>
      ))}
    </div>
  );
}

export function HeroSection({ onViewDemo, onCreateGift }: HeroSectionProps) {
  // El arte responde al puntero y al scroll escribiendo variables CSS.
  const artRef = useParallax<HTMLDivElement>();

  return (
    <section className="bloom-hero" aria-labelledby="hero-title">
      {/* Va al nivel del hero, no del arte, para que los pétalos crucen toda
          la escena y no solo la columna derecha. */}
      <Ambient />
      <div className="bloom-container bloom-hero-grid">
        <div className="bloom-hero-copy">
          <span
            className="bloom-event"
            style={{ '--enter-i': 0 } as CSSProperties}
          >
            <Flower2 size={16} /> 21 DE SEPTIEMBRE · FLORES AMARILLAS
          </span>
          <h1 id="hero-title" style={{ '--enter-i': 1 } as CSSProperties}>
            Flores amarillas.
            <br />Y todo eso
            <br />
            <em>que sientes.</em>
          </h1>
          <p style={{ '--enter-i': 2 } as CSSProperties}>
            Hay personas que te hacen florecer. Regálales una página con tus
            fotos, tus palabras y una sorpresa que se abre con un enlace.
          </p>
          <div
            className="bloom-actions"
            style={{ '--enter-i': 3 } as CSSProperties}
          >
            <button
              type="button"
              className="bloom-button bloom-button-green"
              onClick={onCreateGift}
            >
              Crear mi regalo <ArrowRight size={18} />
            </button>
            <button
              type="button"
              className="bloom-button bloom-button-outline"
              onClick={onViewDemo}
            >
              Quiero ver cómo es <ArrowDown size={17} />
            </button>
          </div>
          <div
            className="bloom-hero-assurances"
            style={{ '--enter-i': 4 } as CSSProperties}
          >
            <span>
              <Check size={15} /> Sin crear una cuenta
            </span>
            <span>
              <Check size={15} /> Pruébalo aquí mismo
            </span>
          </div>
        </div>
        <div className="bloom-hero-art" ref={artRef}>
          <div className="bloom-art-orbit" aria-hidden="true" />
          <div className="bloom-art-circle" aria-hidden="true" />
          <span
            className="bloom-art-spark bloom-art-spark-one"
            style={{ '--twinkle': '5.5s' } as CSSProperties}
            aria-hidden="true"
          >
            ✳
          </span>
          <span
            className="bloom-art-spark bloom-art-spark-two"
            style={{ '--twinkle': '4.1s' } as CSSProperties}
            aria-hidden="true"
          >
            ✦
          </span>
          <img
            className="bloom-hero-bouquet"
            src="/images/sunflower-bouquet.webp"
            alt="Ramo de girasoles amarillos con hojas verdes y un lazo coral"
            width="768"
            height="1024"
            fetchPriority="high"
          />
          <span className="bloom-round-sticker">
            UN DETALLE
            <Heart size={22} fill="currentColor" />
            MUY TUYO
          </span>
          <button
            type="button"
            onClick={onViewDemo}
            className="bloom-hero-letter"
          >
            <span className="bloom-letter-top">
              <span>UN POQUITO DE SOL PARA TI</span>
              <Flower2 size={23} />
            </span>
            <span className="bloom-letter-message">
              Qué bonito que
              <br />
              existas en mi vida.
            </span>
            <span className="bloom-letter-bottom">
              De mí, para ti <Heart size={15} />
            </span>
            <span className="bloom-letter-seal">
              <Flower2 size={23} />
            </span>
          </button>
          <div className="bloom-delivery-note">
            <span className="bloom-delivery-icon">
              <Heart size={19} />
            </span>
            <span>
              <strong>Tienes una sorpresa</strong>
              <small>Alguien pensó en ti. Y se nota.</small>
            </span>
            <Check size={16} />
          </div>
          <span className="bloom-art-hint">
            <MousePointer2 size={16} /> Toca la carta y pruébalo
          </span>
        </div>
      </div>
      <div className="bloom-ribbon">
        <RibbonTrack />
        {/* Copia idéntica: al desplazar la primera un ancho completo, esta
            ocupa su lugar y el bucle no tiene costura. */}
        <RibbonTrack hidden />
      </div>
    </section>
  );
}
