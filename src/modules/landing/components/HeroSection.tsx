import {
  ArrowDown,
  ArrowRight,
  Check,
  Flower2,
  Heart,
  MousePointer2,
} from 'lucide-react';
import type { MouseEvent } from 'react';

interface HeroSectionProps {
  onViewDemo: (e: MouseEvent) => void;
  onCreateGift: (e: MouseEvent) => void;
}

export function HeroSection({ onViewDemo, onCreateGift }: HeroSectionProps) {
  return (
    <section className="bloom-hero" aria-labelledby="hero-title">
      <div className="bloom-container bloom-hero-grid">
        <div className="bloom-hero-copy">
          <span className="bloom-event">
            <Flower2 size={16} /> 21 DE SEPTIEMBRE · FLORES AMARILLAS
          </span>
          <h1 id="hero-title">
            Flores amarillas.
            <br />Y todo eso
            <br />
            <em>que sientes.</em>
          </h1>
          <p>
            Hay personas que te hacen florecer. Regálales una página con tus
            fotos, tus palabras y una sorpresa que se abre con un enlace.
          </p>
          <div className="bloom-actions">
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
          <div className="bloom-hero-assurances">
            <span>
              <Check size={15} /> Sin crear una cuenta
            </span>
            <span>
              <Check size={15} /> Pruébalo aquí mismo
            </span>
          </div>
        </div>
        <div className="bloom-hero-art">
          <div className="bloom-art-orbit" aria-hidden="true" />
          <div className="bloom-art-circle" aria-hidden="true" />
          <span
            className="bloom-art-spark bloom-art-spark-one"
            aria-hidden="true"
          >
            ✳
          </span>
          <span
            className="bloom-art-spark bloom-art-spark-two"
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
        <span>Tus palabras</span>
        <Flower2 />
        <span>Sus fotos favoritas</span>
        <Flower2 />
        <span>Una sorpresa por descubrir</span>
        <Flower2 />
        <span>Un enlace para regalar</span>
        <Flower2 />
      </div>
    </section>
  );
}
