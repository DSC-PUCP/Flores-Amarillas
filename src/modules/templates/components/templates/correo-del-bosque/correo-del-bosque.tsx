import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, Moon, Music2, RotateCcw, Sparkles, Sun, Volume2, VolumeX } from 'lucide-react';
import { useMemo, useState, type CSSProperties } from 'react';
import type { TemplateData } from '@/core/models/template';
import { ForestAlbum } from './forest-album';
import { resolveForestData } from './forest-data';
import { ForestDialog } from './forest-dialog';
import { ForestFlower } from './forest-flower';
import { ForestLetter } from './forest-letter';
import { useForestAudio } from './use-forest-audio';
import styles from './forest-gift.module.css';

type GiftObject = 'bouquet' | 'letter' | 'album' | null;
const FIREFLIES = Array.from({ length: 22 }, (_, i) => ({ x: (i * 37 + 13) % 100, y: (i * 23 + 17) % 88, delay: -(i % 7), duration: 5 + i % 5 }));

export function CorreoDelBosque({ templateData }: { templateData: TemplateData; isPreview?: boolean }) {
  const data = useMemo(() => resolveForestData(templateData), [templateData]);
  const reduced = useReducedMotion();
  const [delivered, setDelivered] = useState(false);
  const [active, setActive] = useState<GiftObject>(null);
  const [nightOverride, setNight] = useState<boolean | null>(null);
  const [selectedFlower, setSelectedFlower] = useState(0);
  const [collected, setCollected] = useState<number[]>([]);
  const [read, setRead] = useState(false);
  const [albumSeen, setAlbumSeen] = useState(false);
  const [pet, setPet] = useState(0);
  const audio = useForestAudio(data.musicUrl);
  const night = nightOverride ?? data.night;
  const complete = read && albumSeen && collected.length >= data.reasons.length;
  const chooseFlower = (i: number) => {
    setSelectedFlower(i);
    setCollected((current) => current.includes(i) ? current : [...current, i]);
  };
  const openObject = (object: GiftObject) => {
    setActive(object);
    if (object === 'bouquet') chooseFlower(0);
    if (object === 'album') setAlbumSeen(true);
  };

  return (
    <main className={styles.world} data-night={night} data-delivered={delivered}>
      <div className={styles.landscape} aria-hidden="true" />
      <div className={styles.vignette} aria-hidden="true" />
      <div className={styles.fireflies} aria-hidden="true">
        {FIREFLIES.map((fly, i) => <i key={`fly-${i.toString()}`} style={{ '--x': `${fly.x}%`, '--y': `${fly.y}%`, '--delay': `${fly.delay}s`, '--duration': `${fly.duration}s` } as CSSProperties} />)}
      </div>
      <header className={styles.topbar}>
        <div className={styles.wordmark}><span className={styles.postmark}>✺</span><div>Correo del bosque<small>LAS COSAS BONITAS SIEMPRE LLEGAN</small></div></div>
        <div className={styles.ambientControls}>
          <button type="button" aria-label={night ? 'Cambiar a atardecer' : 'Encender la noche'} aria-pressed={night} onClick={() => setNight(!night)}>{night ? <Moon size={17} /> : <Sun size={17} />}</button>
          <button type="button" className={styles.soundButton} aria-label={audio.playing ? 'Apagar música ambiente' : 'Escuchar música ambiente'} aria-pressed={audio.playing} onClick={() => void audio.toggle()}>{audio.playing ? <Volume2 size={16} /> : <VolumeX size={16} />}<span>{audio.playing ? 'El bosque suena' : 'Activar sonido'}</span></button>
        </div>
      </header>

      <section className={styles.scene} aria-label="Tu regalo en el bosque">
        <div className={styles.introduction}>
          <p className={styles.eyebrow}><span /> UN ENVÍO EXTRAORDINARIO <span /></p>
          <h1>Alguien le pidió al bosque<br />un regalo <em>para {data.recipient}.</em></h1>
          <p className={styles.subtitle}>{delivered ? 'Flores, palabras y recuerdos. Quédate el tiempo que quieras.' : 'Y el bosque eligió a su mensajero más pequeño.'}</p>
        </div>

        <div className={styles.stage}>
          <div className={styles.giftHalo} aria-hidden="true" />
          <motion.button type="button" className={styles.messenger} data-arrived={delivered} onClick={() => { if (!delivered) setDelivered(true); else setPet((n) => n + 1); }} aria-label={delivered ? 'Saludar a Miel, el canario' : 'Recibir el regalo de Miel, el canario'} initial={reduced ? false : { opacity: 0, x: 220, y: -80, rotate: -9 }} animate={{ opacity: 1, x: 0, y: 0, rotate: 0 }} transition={{ duration: 1.8, ease: [.2, .7, .2, 1] }}>
            <motion.img key={pet} src="/correo-del-bosque/mensajero.webp" alt="Miel, un canario dorado con bufanda y bolsa de correo" draggable={false} animate={pet && !reduced ? { y: [0, -17, 0], rotate: [0, -6, 3, 0] } : { y: 0 }} transition={{ duration: .7 }} />
            <span className={styles.messengerShadow} />
            <span className={styles.messengerName}>{delivered ? 'Miel · tu cómplice' : 'Tócame, esto es para ti'} <span>↗</span></span>
          </motion.button>

          <AnimatePresence>
            {delivered && <motion.div className={styles.objects} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduced ? 0 : .35, duration: .6 }}>
              <motion.button type="button" className={`${styles.giftObject} ${styles.bouquetObject}`} onClick={() => openObject('bouquet')} initial={reduced ? false : { x: 220, y: -100, scale: .1, rotate: 30 }} animate={{ x: 0, y: 0, scale: 1, rotate: -8 }} transition={{ type: 'spring', stiffness: 65, damping: 14, delay: .3 }} aria-label="Descubrir las flores del ramo">
                <span className={styles.bouquetImage}><img src="/images/sunflower-bouquet.webp" alt="Ramo de flores amarillas atado con una cinta" draggable={false} /></span>
                <span className={styles.giftTag}><small>01 / UN RAMO</small>Una razón en cada flor <span>↗</span></span>
              </motion.button>
              <motion.button type="button" className={`${styles.giftObject} ${styles.letterObject}`} onClick={() => openObject('letter')} initial={reduced ? false : { x: 60, y: -120, scale: .1, rotate: -35 }} animate={{ x: 0, y: 0, scale: 1, rotate: 8 }} transition={{ type: 'spring', stiffness: 68, damping: 15, delay: .5 }} aria-label="Recoger la carta">
                <span className={styles.smallEnvelope}><span className={styles.smallStamp}>PARA<br /><strong>{data.recipient}</strong></span><span className={styles.smallSeal}>✿</span><span className={styles.envelopeEdge} /></span>
                <span className={styles.giftTag}><small>02 / UNA CARTA</small>Lo que quería decirte <span>↗</span></span>
              </motion.button>
              <motion.button type="button" className={`${styles.giftObject} ${styles.albumObject}`} onClick={() => openObject('album')} initial={reduced ? false : { x: -180, y: -100, scale: .1, rotate: -40 }} animate={{ x: 0, y: 0, scale: 1, rotate: -10 }} transition={{ type: 'spring', stiffness: 70, damping: 15, delay: .75 }} aria-label="Hojear el álbum botánico">
                <span className={styles.smallBook}><span className={styles.bookBorder} /><small>HERBARIO DE LO NUESTRO</small><span className={styles.bookFlower}>✺</span><strong>Los días<br /><em>que florecen.</em></strong><span className={styles.bookSpine} /></span>
                <span className={styles.giftTag}><small>03 / UN ÁLBUM</small>Recuerdos que se quedan <span>↗</span></span>
              </motion.button>
            </motion.div>}
          </AnimatePresence>
          {!delivered && <p className={styles.deliveryNote}>Traigo flores.<br />Y algo que no cabe en un ramo.<span>Miel, servicio postal del bosque</span></p>}
        </div>

        <footer className={styles.sceneFooter}>
          <div className={styles.senderNote}><span>Preparado con cariño por</span><strong>{data.sender}</strong></div>
          <p className={styles.sceneHint} aria-live="polite">{complete ? 'Todas las sorpresas encontraron su lugar. Este rincón siempre será tuyo.' : delivered ? 'Toca cualquier objeto. Aquí no hay prisa.' : 'Una entrega especial está a punto de comenzar.'}</p>
          <button className={styles.musicBox} type="button" aria-pressed={audio.playing} onClick={() => void audio.toggle()} aria-label="Tocar la caja de música"><Music2 size={19} /><span>{audio.playing ? 'Sonando bajito' : 'Una melodía para acompañar'}<small>CAJITA MUSICAL</small></span></button>
        </footer>
        {audio.error && <p className={styles.audioError} role="status">{audio.error}</p>}
      </section>

      {active === 'bouquet' && <ForestDialog label="Un ramo de razones" onClose={() => setActive(null)}>
        <div className={styles.bouquetScene}>
          <p className={styles.eyebrow}>NO SON SOLO FLORES</p>
          <h2>Cada una guarda<br /><em>algo bonito de ti.</em></h2>
          <div className={styles.livingBouquet}>
            {data.reasons.map((reason, i) => <button type="button" key={`${i}-${reason}`} className={styles.stemButton} data-selected={selectedFlower === i} style={{ '--angle': `${(i - (data.reasons.length - 1) / 2) * 17}deg`, '--lift': `${i % 2 * 28}px`, '--stem-index': i } as CSSProperties} onClick={() => chooseFlower(i)} aria-label={`Flor ${i + 1}: descubrir su mensaje`} aria-pressed={selectedFlower === i}>
              <ForestFlower kind={data.flowerStyle === 'margaritas' || (data.flowerStyle === 'mixto' && i % 2 === 1) ? 'margarita' : 'girasol'} />
              <span className={styles.flowerNumber}>{i + 1}</span>
            </button>)}
            <span className={styles.bouquetTie} aria-hidden="true" />
          </div>
          <AnimatePresence mode="wait"><motion.blockquote key={selectedFlower} className={styles.flowerReason} initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
            <span>FLOR {String(selectedFlower + 1).padStart(2, '0')}</span>«{data.reasons[selectedFlower % data.reasons.length]}»
          </motion.blockquote></AnimatePresence>
          <p className={styles.objectHint}>{collected.length >= data.reasons.length ? <><Check size={14} /> Ya descubriste todo lo que este ramo quería decirte.</> : 'Toca las distintas flores para descubrir sus mensajes.'}</p>
        </div>
      </ForestDialog>}
      {active === 'letter' && <ForestLetter data={data} onClose={() => setActive(null)} onRead={() => setRead(true)} />}
      {active === 'album' && <ForestAlbum photos={data.photos} captions={data.captions} recipient={data.recipient} onClose={() => setActive(null)} />}
      {delivered && <button type="button" className={styles.replay} onClick={() => { setDelivered(false); setPet(0); }} aria-label="Volver a ver la llegada de Miel"><RotateCcw size={13} /> Repetir llegada</button>}
      <span className={styles.cornerMark} aria-hidden="true"><Sparkles size={12} /> HECHO DE PEQUEÑAS COSAS</span>
    </main>
  );
}
