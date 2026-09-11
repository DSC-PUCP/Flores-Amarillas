import { Link } from '@tanstack/react-router';
import {
  ArrowRight,
  Flower2,
  LayoutTemplate,
  Send,
  SquarePen,
} from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: LayoutTemplate,
    title: 'Encuentra su estilo',
    text: 'Explora los diseños disponibles y revisa qué incluye cada plan antes de elegir.',
  },
  {
    number: '02',
    icon: SquarePen,
    title: 'Hazlo muy de ustedes',
    text: 'Escribe tu dedicatoria, añade sus nombres y sube las fotos que quieras recordar.',
  },
  {
    number: '03',
    icon: Send,
    title: 'Hazle llegar la sorpresa',
    text: 'Revisa el resultado y comparte su enlace. Si eliges un diseño de pago, actívalo antes de enviarlo.',
  },
];

export function RoadmapSection() {
  return (
    <section
      id="how-it-works"
      className="bloom-section bloom-how"
      aria-labelledby="how-title"
    >
      <div className="bloom-container">
        <div className="bloom-how-top">
          <div>
            <span className="bloom-eyebrow">
              <span /> TÚ PONES EL CARIÑO
            </span>
            <h2 id="how-title">
              Nosotros ponemos
              <br />
              <em>el resto.</em>
            </h2>
          </div>
          <Flower2
            className="bloom-how-flower"
            strokeWidth={1}
            aria-hidden="true"
          />
        </div>
        <div className="bloom-steps">
          {STEPS.map(({ number, icon: Icon, title, text }) => (
            <article key={number}>
              <div className="bloom-step-top">
                <span>{number}</span>
                <Icon size={25} strokeWidth={1.5} />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <div className="bloom-how-bottom">
          <p>
            No necesitas saber diseñar. Solo saber a quién quieres alegrarle el
            día.
          </p>
          <Link to="/template" className="bloom-text-link">
            Vamos a crear ese regalo <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
