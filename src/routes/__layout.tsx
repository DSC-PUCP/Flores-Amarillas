import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from '@tanstack/react-router';
import { ArrowRight, Flower2, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import bloomCss from '@/modules/landing/bloom.css?url';

export const Route = createFileRoute('/__layout')({
  head: () => ({ links: [{ rel: 'stylesheet', href: bloomCss }] }),
  component: LayoutComponent,
});

const NAV_ITEMS = [
  { hash: 'demo', label: 'Prueba el regalo' },
  { hash: 'how-it-works', label: 'Cómo funciona' },
  { hash: 'plans', label: 'Planes' },
  { hash: 'faq', label: 'Preguntas' },
];

function LayoutComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [progress, setProgress] = useState(0);
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  useEffect(() => {
    setIsOpen(false);
    setActiveSection('');
    if (pathname !== '/home') {
      setProgress(0);
      return;
    }
    const updateProgress = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(
        height > 0 ? Math.min(1, Math.max(0, window.scrollY / height)) : 0
      );
      if (window.scrollY < 200) setActiveSection('');
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { rootMargin: '-15% 0px -55% 0px', threshold: 0 }
    );
    for (const item of NAV_ITEMS) {
      const node = document.getElementById(item.hash);
      if (node) observer.observe(node);
    }
    return () => {
      window.removeEventListener('scroll', updateProgress);
      observer.disconnect();
    };
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        document.getElementById('bloom-menu-toggle')?.focus();
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isOpen]);

  return (
    <div className="bloom-shell">
      <a href="#main-content" className="bloom-skip">
        Saltar al contenido
      </a>
      <header className="bloom-nav">
        <div className="bloom-nav-inner">
          <Link
            to="/home"
            className="bloom-logo"
            onClick={() => setIsOpen(false)}
          >
            <span className="bloom-logo-mark">
              <Flower2 />
            </span>
            <span>
              Dedicatorias <em>en Flor</em>
            </span>
          </Link>
          <nav className="bloom-nav-links" aria-label="Navegación principal">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.hash}
                to="/home"
                hash={item.hash}
                aria-current={
                  pathname === '/home' && activeSection === item.hash
                    ? 'location'
                    : undefined
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="bloom-nav-action">
            <Link to="/template" className="bloom-button">
              Crear mi regalo <ArrowRight size={14} />
            </Link>
            <button
              id="bloom-menu-toggle"
              type="button"
              className="bloom-menu-toggle"
              aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={isOpen}
              aria-controls="bloom-mobile-menu"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
        {isOpen && (
          <nav
            id="bloom-mobile-menu"
            className="bloom-mobile-menu"
            aria-label="Navegación móvil"
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.hash}
                to="/home"
                hash={item.hash}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
        <div
          className="bloom-scroll-progress"
          style={{ scale: `${progress} 1` }}
          aria-hidden="true"
        />
      </header>
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="bloom-footer">
        <div className="bloom-container">
          <Link to="/home" className="bloom-logo">
            <span className="bloom-logo-mark">
              <Flower2 />
            </span>
            <span>
              Dedicatorias <em>en Flor</em>
            </span>
          </Link>
          <p>© 2026 · Pequeños detalles. Bonitas formas de querer.</p>
          <div className="bloom-footer-links">
            <Link to="/home" hash="demo">
              Ver el regalo
            </Link>
            <Link to="/home" hash="faq">
              ¿Tienes dudas?
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
