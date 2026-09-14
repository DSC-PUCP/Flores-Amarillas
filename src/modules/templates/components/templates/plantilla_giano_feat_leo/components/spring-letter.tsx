import { Heart, MailOpen, RotateCcw } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import styles from './spring-letter.module.css';

interface SpringLetterProps {
  message: string;
  recipient: string;
  sender?: string;
}

export function SpringLetter({
  message,
  recipient,
  sender,
}: SpringLetterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const letterId = useId();
  const letterRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <section className={styles.slide} aria-label="Una carta para ti">
      <div className={styles.corner} aria-hidden="true" />
      <div className={styles.cornerBottom} aria-hidden="true" />
      <header className={styles.heading}>
        <p>PALABRAS QUE FLORECEN</p>
        <h2>Hay algo que quiero decirte</h2>
        <span>Un pedacito de mí, entre estas líneas.</span>
      </header>

      <div className={styles.arrival}>
        <div className={styles.scene} data-open={isOpen}>
          <div className={styles.envelope} aria-hidden="true">
            <div className={styles.lining} />
            <div className={styles.flap} />
            <div className={styles.pocket} />
            <span className={styles.to}>
              Para {recipient === 'Para ti' ? 'ti' : recipient} ♡
            </span>
            <div className={styles.stamp}>
              <img src="/images/spring/card-flower.png" alt="" />
              <span>Días más bonitos</span>
            </div>
            <img
              className={styles.envelopeFlower}
              src="/images/spring/card-flower.png"
              alt=""
            />
            <div className={styles.seal}>
              <Heart size={28} strokeWidth={1.5} />
            </div>
          </div>

          {isOpen && (
            <article
              id={letterId}
              ref={letterRef}
              tabIndex={-1}
              className={styles.paper}
              aria-label={`Carta para ${recipient}`}
            >
              <img
                className={styles.paperFlower}
                src="/images/spring/card-flower.png"
                alt=""
              />
              <p className={styles.paperEyebrow}>
                PARA GUARDAR CERQUITA DEL CORAZÓN
              </p>
              <h3>Para {recipient === 'Para ti' ? 'ti' : recipient},</h3>
              <div className={styles.message}>
                {message.trim()
                  ? message
                  : 'Aquí florecerán las palabras que escribas para esa persona especial.'}
              </div>
              <footer className={styles.signature}>
                <Heart size={28} aria-hidden="true" />
                {sender && (
                  <p>
                    Con cariño,
                    <br />
                    <span>{sender}</span>
                  </p>
                )}
                <small>Pequeñas cosas, grandes historias.</small>
              </footer>
            </article>
          )}

          <button
            ref={buttonRef}
            type="button"
            className={styles.openButton}
            aria-expanded={isOpen}
            aria-controls={isOpen ? letterId : undefined}
            onClick={() => {
              if (isOpen) {
                setIsOpen(false);
                buttonRef.current?.focus({ preventScroll: true });
              } else {
                setIsOpen(true);
                requestAnimationFrame(() =>
                  letterRef.current?.focus({ preventScroll: true })
                );
              }
            }}
          >
            {isOpen ? <RotateCcw size={18} /> : <MailOpen size={20} />}
            {isOpen ? 'Volver a guardar' : 'Abrir carta'}
            <span aria-hidden="true">♡</span>
          </button>
        </div>
      </div>
      <p className={styles.hint}>
        {isOpen
          ? 'Hay palabras que se quedan para siempre.'
          : 'He guardado unas palabras solo para ti.'}
      </p>
    </section>
  );
}
