import {
  createFileRoute,
  Link,
  Outlet,
  useRouter,
} from '@tanstack/react-router';
import { Heart, Menu, Moon, Sun, X } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/__layout')({
  component: LayoutComponent,
});

function LayoutComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const router = useRouter();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsOpen(false);
  };

  const scrollToPlans = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(false);

    const scroll = () => {
      const section = document.getElementById('plans');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    };

    // Si no está en home, navegar primero
    if (router.state.location.pathname !== '/home') {
      router.navigate({ to: '/home' });
      setTimeout(scroll, 100);
    } else {
      scroll();
    }
  };

  return (
    <div className={`${darkMode ? 'dark' : ''} min-h-screen flex flex-col`}>
      <nav className=" fixed w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 transition-colors duration-300 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link
              to="/home"
              onClick={scrollToTop}
              className="flex items-center gap-2 group"
            >
              <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-2 rounded-lg group-hover:scale-110 transition-transform shadow-lg shadow-rose-500/20">
                <Heart className="h-6 w-6 text-white fill-current" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-slate-100">
                Love<span className="text-rose-500">Dedicatorias</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/home"
                onClick={scrollToTop}
                className="text-slate-600 dark:text-slate-300 hover:text-rose-600 transition-colors font-medium"
                activeProps={{ className: 'text-rose-600 font-medium' }}
              >
                Inicio
              </Link>
              <button
                onClick={scrollToPlans}
                className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Crear Dedicatoria
              </button>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-slate-900 dark:text-slate-100 p-2"
              >
                {isOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <div className="px-4 pt-2 pb-6 space-y-2">
              <Link
                to="/home"
                onClick={scrollToTop}
                className="block px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-rose-600"
              >
                Inicio
              </Link>
              <div className="pt-4">
                <button
                  onClick={scrollToPlans}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Crear Dedicatoria
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1 pt-20">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-300">
          © 2026 Valentine Web Gift. Hecho con 💖
        </div>
      </footer>

      {/* Botón Dark / Light flotante */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="
          fixed bottom-6 right-6 z-50
          h-12 w-12 rounded-full
          flex items-center justify-center
          bg-white dark:bg-slate-900
          border border-slate-200 dark:border-slate-700
          shadow-md hover:shadow-lg
          transition-all duration-300
        "
        aria-label="Cambiar tema"
      >
        {darkMode ? (
          <Sun className="h-5 w-5 text-yellow-400" />
        ) : (
          <Moon className="h-5 w-5 text-blue-500" />
        )}
      </button>
    </div>
  );
}
