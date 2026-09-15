import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import styles from '../premium.module.css';
import { BotanicalFrame } from './botanical-frame';
import { PageLights } from './PageLights';

export function Scene({
  children,
  tone,
  active,
  id,
  label,
}: {
  children: ReactNode;
  tone: 'night' | 'paper';
  active: boolean;
  id: string;
  label: string;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.section
      aria-label={label}
      aria-hidden={!active}
      inert={!active}
      data-scene-id={id}
      data-active={active}
      data-tone={tone}
      className={cn(
        styles.scene,
        tone === 'paper' ? styles.scenePaper : styles.sceneNight
      )}
      initial={false}
      animate={{
        opacity: active ? 1 : 0,
        y: active || reduceMotion ? 0 : 18,
      }}
      transition={{
        duration: reduceMotion ? 0 : 0.65,
        ease: [0.22, 0.8, 0.2, 1],
      }}
      style={{
        visibility: active ? 'visible' : 'hidden',
        pointerEvents: active ? 'auto' : 'none',
      }}
    >
      {tone === 'paper' ? <BotanicalFrame variant={id} /> : <PageLights />}
      <div className={styles.sceneScroll} data-scene-scroll>
        <div className={styles.sceneContent}>{children}</div>
      </div>
    </motion.section>
  );
}
