import { useNavigate } from '@tanstack/react-router';
import { FeaturesSection } from './components/FeaturesSection';
import { HeroSection } from './components/HeroSection';
import { PlansSection } from './components/PlanSection';
import { RoadmapSection } from './components/RoadmapSection';
import { createScrollToSection } from './data/animations';
import './animations.css'; // Importa el CSS
import { FloatingHearts } from './FloatingHearts';

interface LandingContentProps {
  onCreateGift?: (e: React.MouseEvent) => void;
}

export function LandingContent({ onCreateGift }: LandingContentProps) {
  const navigate = useNavigate();
  const scrollToPlans = createScrollToSection('plans');

  const handleCreateGift =
    onCreateGift ||
    ((e: React.MouseEvent) => {
      e.preventDefault();
      navigate({ to: '/template' });
    });

  return (
    <div className="relative min-h-screen overflow-hidden bg-white dark:bg-slate-900">
      <FloatingHearts />

      <div className="relative z-10">
        <HeroSection
          onViewPlans={scrollToPlans}
          onCreateGift={handleCreateGift}
        />
        <FeaturesSection />
        <RoadmapSection />
        <PlansSection />
      </div>
    </div>
  );
}
