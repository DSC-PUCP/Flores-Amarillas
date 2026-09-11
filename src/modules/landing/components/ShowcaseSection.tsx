import { Link } from '@tanstack/react-router';
import { ArrowRight, Expand, Flower2, RotateCcw, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const MESSAGES = [
  {
    label: 'Para mi amor',
    name: 'Sofía',
    message:
      'Si tuviera que elegir un lugar bonito, sería a tu lado. Estas flores son para recordarte lo mucho que te quiero.',
  },
  {
    label: 'Para mi amiga',
    name: 'Lucía',
    message:
      'Por las risas, por escucharme y por estar incluso en los días grises. Qué suerte tener una amiga como tú.',
  },
  {
    label: 'Para mi familia',
    name: 'Mamá',
    message:
      'Gracias por cuidarme, por creer en mí y por enseñarme a florecer. Hoy este poquito de sol es para ti.',
  },
];

export function ShowcaseSection() {
  const [audience, setAudience] = useState(0);
  const [recipient, setRecipient] = useState(MESSAGES[0].name);
  const [message, setMessage] = useState(MESSAGES[0].message);
  const [preview, setPreview] = useState({ recipient, message });
  const [version, setVersion] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPreview({
        recipient: recipient.trim() || 'Sofía',
        message: message.trim() || MESSAGES[0].message,
      });
    }, 600);
    return () => clearTimeout(timeout);
  }, [recipient, message]);

  const selectAudience = (index: number) => {
    setAudience(index);
    setRecipient(MESSAGES[index].name);
    setMessage(MESSAGES[index].message);
  };

  useEffect(() => {
    if (loaded) {
      frameRef.current?.contentWindow?.postMessage(
        { type: 'flower-demo:update', ...preview },
        window.location.origin
      );
    }
  }, [preview, loaded]);

  useEffect(() => {
    const sendWhenReady = (event: MessageEvent<unknown>) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== frameRef.current?.contentWindow
      )
        return;
      if (
        typeof event.data === 'object' &&
        event.data !== null &&
        'type' in event.data &&
        event.data.type === 'flower-demo:ready'
      ) {
        setLoaded(true);
        frameRef.current?.contentWindow?.postMessage(
          { type: 'flower-demo:update', ...preview },
          window.location.origin
        );
      }
    };
    window.addEventListener('message', sendWhenReady);
    return () => window.removeEventListener('message', sendWhenReady);
  }, [preview]);

  return (
    <section
      id="demo"
      className="bloom-demo bloom-section"
      aria-labelledby="demo-title"
    >
      <div className="bloom-container">
        <div className="bloom-section-heading">
          <span className="bloom-eyebrow">
            <span /> ÁBRELO. SONRÍE. IMAGINA SU CARA.
          </span>
          <h2 id="demo-title">
            Así se siente recibir
            <br />
            <em>algo hecho para ti.</em>
          </h2>
          <p>
            Esto sí se puede tocar. Escribe su nombre, abre el sobre y descubre
            la dedicatoria.
          </p>
        </div>
        <div className="bloom-demo-grid">
          <div className="bloom-demo-editor">
            <div className="bloom-small-label">
              <Sparkles size={16} /> DALE TU TOQUE
            </div>
            <h3>Empieza por esa persona.</h3>
            <p>
              Una idea para tu pareja, tu amistad de siempre o quien te hace
              sentir en casa.
            </p>
            <fieldset
              className="bloom-audience"
              aria-label="Ideas de dedicatoria"
            >
              {MESSAGES.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  aria-pressed={audience === index}
                  onClick={() => selectAudience(index)}
                >
                  {item.label}
                </button>
              ))}
            </fieldset>
            <label className="bloom-field">
              ¿Para quién son estas flores?
              <input
                name="demo-recipient"
                value={recipient}
                onChange={(event) => setRecipient(event.target.value)}
                maxLength={25}
                autoComplete="off"
                placeholder="Escribe su nombre"
              />
            </label>
            <label className="bloom-field">
              Algo que quieras decirle
              <textarea
                name="demo-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={250}
                rows={4}
              />
            </label>
            <div className="bloom-field-footer">
              <span>La vista se actualiza al escribir</span>
              <span>{message.length}/250</span>
            </div>
            <a href="#gift-preview" className="bloom-mobile-preview-link">
              Ver mis cambios en el regalo ↓
            </a>
            <div className="bloom-demo-tip">
              <Flower2 size={21} />
              <p>
                El toque especial lo pones tú. Al crear tu regalo podrás subir
                tus propias fotos.
              </p>
            </div>
            <Link to="/template" className="bloom-button bloom-button-green">
              Ahora quiero crear el mío <ArrowRight size={17} />
            </Link>
            <small className="bloom-demo-disclaimer">
              Esta prueba no se guarda ni se publica.
            </small>
          </div>
          <div id="gift-preview" className="bloom-preview-stage">
            <div className="bloom-preview-label">
              <span className="bloom-live-dot" /> DEDICATORIA INTERACTIVA{' '}
              <span>Ejemplo</span>
            </div>
            <div className="bloom-preview-window">
              <div className="bloom-preview-toolbar">
                <span>
                  <Flower2 size={14} /> Un regalo para {preview.recipient}
                </span>
                <button
                  type="button"
                  aria-label="Volver a abrir el ejemplo desde el inicio"
                  onClick={() => {
                    setLoaded(false);
                    setVersion((current) => current + 1);
                  }}
                >
                  <RotateCcw size={16} />
                </button>
              </div>
              {!loaded && (
                <output className="bloom-preview-loading">
                  Preparando tu sorpresa…
                </output>
              )}
              <iframe
                ref={frameRef}
                key={version}
                src="/preview?embed=true"
                title="Prueba tu dedicatoria: abre el sobre y descubre la carta"
                className="bloom-preview-frame"
                loading="lazy"
                onLoad={() => setLoaded(true)}
              />
            </div>
            <Link
              to="/preview"
              search={{ ...preview, embed: false }}
              target="_blank"
              rel="noopener noreferrer"
              className="bloom-expand"
            >
              <Expand size={15} /> Abrir ejemplo en pantalla completa
            </Link>
            <p className="bloom-preview-caption">
              La misma plantilla que recibe la otra persona.
              <br />
              Nombres y fotos de ejemplo; el contenido final lo eliges tú.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
