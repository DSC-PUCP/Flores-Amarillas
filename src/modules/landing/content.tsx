import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowRight, Flower2, Heart } from 'lucide-react';
import type { MouseEvent } from 'react';
import { FaqSection } from './components/FaqSection';
import { FeaturesSection } from './components/FeaturesSection';
import { HeroSection } from './components/HeroSection';
import { PlansSection } from './components/PlanSection';
import { RoadmapSection } from './components/RoadmapSection';
import { ShowcaseSection } from './components/ShowcaseSection';
import { createScrollToSection } from './data/animations';

interface LandingContentProps {
  onCreateGift?: (e: MouseEvent) => void;
}

export function LandingContent({ onCreateGift }: LandingContentProps) {
  const navigate = useNavigate();
  const handleCreateGift =
    onCreateGift ||
    ((event: MouseEvent) => {
      event.preventDefault();
      navigate({ to: '/template' });
    });

  return (
    <div className="bloom-site">
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
          <span className="bloom-eyebrow">EL MEJOR DETALLE ES ACORDARTE</span>
          <h2>
            Que este 21 no se quede
            <br />
            en un «te iba a regalar».
            <br />
            <em>Haz que florezca.</em>
          </h2>
          <Link to="/template" className="bloom-button bloom-button-green">
            Crear mi regalo <ArrowRight size={18} />
          </Link>
          <p>
            <Heart size={15} /> Hecho por ti. Pensado para alguien especial.
          </p>
        </div>
      </section>
    </div>
  );
}
