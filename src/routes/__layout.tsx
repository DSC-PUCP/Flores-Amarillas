import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from '@tanstack/react-router';
import { ArrowRight, ArrowUp, Flower2, Menu, X } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import bloomCss from '@/modules/landing/bloom.css?url';
import motionCss from '@/modules/landing/motion.css?url';

export const Route = createFileRoute('/__layout')({
  head: () => ({
    links: [
      { rel: 'stylesheet', href: bloomCss },
      // Después de bloom.css: la capa de movimiento necesita ganarle al
      // `animation: none` con el que aquel archivo cierra.
      { rel: 'stylesheet', href: motionCss },
    ],
  }),
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
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  useEffect(() => {
    setIsOpen(false);
    setActiveSection('');
    if (pathname !== '/home') {
      setProgress(0);
      setIsScrolled(false);
      return;
    }
    const updateProgress = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(
        height > 0 ? Math.min(1, Math.max(0, window.scrollY / height)) : 0
      );
      setIsScrolled(window.scrollY > 12);
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

  const scrollToTop = () => {
    const instant = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    window.scrollTo({ top: 0, behavior: instant ? 'instant' : 'smooth' });
  };

  return (
    <div className="bloom-shell">
      <a href="#main-content" className="bloom-skip">
        Saltar al contenido
      </a>
      <header className="bloom-nav" data-scrolled={isScrolled}>
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
        {/* Queda siempre en el DOM para poder animar también el cierre: si se
            montara y desmontara, la salida no tendría transición. Cerrado
            colapsa a alto cero y `visibility: hidden` lo saca del recorrido
            por teclado y del lector de pantalla. */}
        <nav
          id="bloom-mobile-menu"
          className="bloom-mobile-menu"
          data-open={isOpen}
          aria-label="Navegación móvil"
        >
          {NAV_ITEMS.map((item, index) => (
            <Link
              key={item.hash}
              to="/home"
              hash={item.hash}
              style={{ '--enter-i': index } as CSSProperties}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div
          className="bloom-scroll-progress"
          style={{ scale: `${progress} 1` }}
          aria-hidden="true"
        />
      </header>
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <button
        type="button"
        className="bloom-to-top"
        data-visible={progress > 0.12}
        // Fuera de vista el botón no debe recibir foco por tabulación.
        tabIndex={progress > 0.12 ? 0 : -1}
        aria-hidden={progress > 0.12 ? undefined : true}
        aria-label="Volver al inicio de la página"
        onClick={scrollToTop}
      >
        <ArrowUp size={19} />
      </button>
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
