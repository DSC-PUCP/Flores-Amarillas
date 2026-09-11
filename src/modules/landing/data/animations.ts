export const createScrollToSection =
  (sectionId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      section.scrollIntoView({
        behavior: reducedMotion ? 'instant' : 'smooth',
      });
    }
  };
