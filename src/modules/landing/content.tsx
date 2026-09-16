import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowRight, Flower2, Heart } from 'lucide-react';
import type { CSSProperties, MouseEvent } from 'react';
import { FaqSection } from './components/FaqSection';
import { FeaturesSection } from './components/FeaturesSection';
import { HeroSection } from './components/HeroSection';
import { PlansSection } from './components/PlanSection';
import { RoadmapSection } from './components/RoadmapSection';
import { ShowcaseSection } from './components/ShowcaseSection';
import { createScrollToSection } from './data/animations';
import { useScrollReveal } from './hooks/useScrollReveal';

interface LandingContentProps {
  onCreateGift?: (e: MouseEvent) => void;
}

export function LandingContent({ onCreateGift }: LandingContentProps) {
  const navigate = useNavigate();
  // Un solo observador revela todos los `[data-reveal]` de la página.
  const siteRef = useScrollReveal<HTMLDivElement>();

  const handleCreateGift =
    onCreateGift ||
    ((event: MouseEvent) => {
      event.preventDefault();
      navigate({ to: '/template' });
    });

  return (
    <div className="bloom-site" ref={siteRef}>
      <HeroSection
        onViewDemo={createScrollToSection('demo')}
        onCreateGift={handleCreateGift}
      />
      <ShowcaseSection />
      <FeaturesSection />
      <RoadmapSection />
      <PlansSection />
      <FaqSection />
      <section className="bloom-final">
        <div className="bloom-container">
          <Flower2 className="bloom-final-flower" aria-hidden="true" />
          <span
            className="bloom-eyebrow"
            data-reveal
            style={{ '--reveal-i': 0 } as CSSProperties}
          >
            EL MEJOR DETALLE ES ACORDARTE
          </span>
          <h2 data-reveal style={{ '--reveal-i': 1 } as CSSProperties}>
            Que este 21 no se quede
            <br />
            en un «te iba a regalar».
            <br />
            <em>Haz que florezca.</em>
          </h2>
          <Link
            to="/template"
            className="bloom-button bloom-button-cta"
            data-reveal="grow"
            style={{ '--reveal-i': 2 } as CSSProperties}
          >
            Crear mi regalo <ArrowRight size={18} />
          </Link>
          <p data-reveal style={{ '--reveal-i': 3 } as CSSProperties}>
            <Heart size={15} /> Hecho por ti. Pensado para alguien especial.
          </p>
        </div>
      </section>
    </div>
  );
}
