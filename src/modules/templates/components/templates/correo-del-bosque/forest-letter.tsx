import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { ForestDialog } from './forest-dialog';
import { ForestFlower } from './forest-flower';
import type { ForestData } from './forest-data';
import styles from './forest-gift.module.css';

export function ForestLetter({ data, onClose, onRead }: { data: ForestData; onClose: () => void; onRead: () => void }) {
  const [stage, setStage] = useState<'sealed' | 'open' | 'read'>('sealed');
  const reduced = useReducedMotion();
  const read = () => { setStage('read'); onRead(); };
  return (
    <ForestDialog label="Una carta para ti" onClose={onClose}>
      <div className={styles.letterScene} data-letter-stage={stage}>
        <p className={styles.eyebrow}>CORRESPONDENCIA QUE FLORECE</p>
        {stage !== 'read' ? <>
          <h2>Hay cosas que merecen<br /><em>escribirse a mano.</em></h2>
          <div className={styles.envelopeLarge}>
            <div className={styles.envelopeBack} />
            <motion.button type="button" className={styles.pullPaper} disabled={stage !== 'open'} drag={stage === 'open' ? 'y' : false} dragConstraints={{ top: -180, bottom: 0 }} dragElastic={.08} onDragEnd={(_, info) => { if (info.offset.y < -65) read(); }} onClick={read} animate={{ y: stage === 'open' ? -64 : 0 }} transition={{ duration: reduced ? 0 : .75, delay: .3 }} aria-label="Extraer el papel del sobre">
              <small>Unas palabras, solo para ti</small><strong>Para {data.recipient}</strong><span>↑ desliza el papel</span>
            </motion.button>
            <div className={styles.envelopeFront} />
            <div className={styles.envelopeFlap} />
            <button type="button" className={styles.wax} disabled={stage !== 'sealed'} onClick={() => setStage('open')} aria-label="Romper el sello y abrir la solapa"><span>✿</span></button>
          </div>
          <p className={styles.objectHint}>{stage === 'sealed' ? 'Toca el sello. El resto puede esperar.' : 'Saca la carta hacia arriba, o tócala.'}</p>
        </> : <motion.article className={styles.writingPaper} initial={reduced ? false : { opacity: 0, y: 80, rotateX: -35, scale: .8 }} animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }} transition={{ duration: .85, ease: [.18, .8, .25, 1] }}>
          <span className={styles.paperStamp}>CORREO<br />DEL BOSQUE<small>entrega especial</small></span>
          <p className={styles.letterGreeting}>Para {data.recipient},</p>
          <p className={styles.letterBody}>{data.message}</p>
          <footer><small>Con un poquito de primavera y todo mi cariño,</small><p>{data.sender}</p></footer>
          <ForestFlower kind="margarita" className={styles.letterFlower} />
        </motion.article>}
      </div>
    </ForestDialog>
  );
}
