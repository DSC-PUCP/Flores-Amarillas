import { Link } from '@tanstack/react-router';
import { ArrowRight, Expand, Flower2, RotateCcw, Sparkles } from 'lucide-react';
import type { CSSProperties, KeyboardEvent } from 'react';
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

const MESSAGE_LIMIT = 250;

export function ShowcaseSection() {
  const [audience, setAudience] = useState(0);
  const [recipient, setRecipient] = useState(MESSAGES[0].name);
  const [message, setMessage] = useState(MESSAGES[0].message);
  const [preview, setPreview] = useState({ recipient, message });
  const [version, setVersion] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const audienceRef = useRef<HTMLFieldSetElement>(null);

  // Mientras el texto todavía no llegó al ejemplo, el indicador muestra que
  // hay algo en camino. Evita la duda de "¿se está actualizando o no?".
  const isSyncing =
    preview.recipient !== (recipient.trim() || MESSAGES[0].name) ||
    preview.message !== (message.trim() || MESSAGES[0].message);

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

  /**
   * Las ideas son un grupo de opciones excluyentes, así que se recorren con
   * las flechas igual que un grupo de radios: tabular entra una sola vez al
   * grupo y las flechas mueven la selección. Home y End saltan a los extremos.
   */
  const onAudienceKeyDown = (event: KeyboardEvent<HTMLFieldSetElement>) => {
    const keys = [
      'ArrowRight',
      'ArrowDown',
      'ArrowLeft',
      'ArrowUp',
      'Home',
      'End',
    ];
    if (!keys.includes(event.key)) return;
    event.preventDefault();

    let next = audience;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      next = (audience + 1) % MESSAGES.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      next = (audience - 1 + MESSAGES.length) % MESSAGES.length;
    } else if (event.key === 'Home') {
      next = 0;
    } else {
      next = MESSAGES.length - 1;
    }

    selectAudience(next);
    audienceRef.current?.querySelectorAll('button')?.[next]?.focus();
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

  const remaining = MESSAGE_LIMIT - message.length;
  const counterLevel =
    remaining === 0 ? 'full' : remaining <= 40 ? 'warn' : 'ok';

  return (
    <section
      id="demo"
      className="bloom-demo bloom-section"
      aria-labelledby="demo-title"
    >
      <div className="bloom-container">
        <div className="bloom-section-heading">
          <span
            className="bloom-eyebrow"
            data-reveal
            style={{ '--reveal-i': 0 } as CSSProperties}
          >
            <span /> ÁBRELO. SONRÍE. IMAGINA SU CARA.
          </span>
          <h2
            id="demo-title"
            data-reveal
            style={{ '--reveal-i': 1 } as CSSProperties}
          >
            Así se siente recibir
            <br />
            <em>algo hecho para ti.</em>
          </h2>
          <p data-reveal style={{ '--reveal-i': 2 } as CSSProperties}>
            Esto sí se puede tocar. Escribe su nombre, abre el sobre y descubre
            la dedicatoria.
          </p>
        </div>
        <div className="bloom-demo-grid">
          <div className="bloom-demo-editor" data-reveal="left">
            <div className="bloom-small-label">
              <Sparkles size={16} /> DALE TU TOQUE
            </div>
            <h3>Empieza por esa persona.</h3>
            <p>
              Una idea para tu pareja, tu amistad de siempre o quien te hace
              sentir en casa.
            </p>
            <fieldset
              ref={audienceRef}
              className="bloom-audience"
              aria-label="Ideas de dedicatoria"
              onKeyDown={onAudienceKeyDown}
            >
              {MESSAGES.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  aria-pressed={audience === index}
                  // Roving tabindex: el grupo entero es una sola parada de
                  // tabulación y las flechas se mueven dentro.
                  tabIndex={audience === index ? 0 : -1}
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
                maxLength={MESSAGE_LIMIT}
                rows={4}
              />
            </label>
            <div className="bloom-field-footer">
              <span
                className="bloom-sync"
                data-state={isSyncing ? 'typing' : 'synced'}
              >
                {isSyncing ? 'Llevando tus cambios…' : 'Ejemplo actualizado'}
              </span>
              <span className="bloom-counter" data-level={counterLevel}>
                {message.length}/{MESSAGE_LIMIT}
              </span>
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
          <div
            id="gift-preview"
            className="bloom-preview-stage"
            data-reveal="right"
          >
            <div className="bloom-preview-label">
              <span className="bloom-live-dot" /> DEDICATORIA INTERACTIVA{' '}
              <span>Ejemplo</span>
            </div>
            <div className="bloom-preview-window" data-loaded={loaded}>
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
