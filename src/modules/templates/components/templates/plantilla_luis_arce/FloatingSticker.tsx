import { motion } from 'framer-motion';
import type React from 'react';

export interface FloatingStickerProps {
  src: string;
  className?: string;
  style?: React.CSSProperties;
  index: number;
  delay: number;
  baseRotate?: number;
  hoverScale?: number;
  hoverFilter?: string;
  hoverRotate?: number;
  floatY?: number[];
  floatXBase?: number;
  durationY?: number;
  durationX?: number;
}

export default function FloatingSticker({
  src,
  className = '',
  style = {},
  index,
  delay,
  baseRotate = 0,
  hoverScale = 1.2,
  hoverFilter = 'brightness(1.2) drop-shadow(0px 0px 4px rgba(255,255,255,1))',
  hoverRotate = baseRotate + (index % 2 === 0 ? 15 : -15),
  floatY = [0, -5, 5, 0],
  floatXBase = 4,
  durationY = 3 + index * 0.5,
  durationX = 4 + index * 0.5,
}: FloatingStickerProps) {
  return (
    <motion.div
      className={`absolute pointer-events-auto ${className} z-50`}
      style={style}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.6}
      whileDrag={{ cursor: 'grabbing', scale: 1.05 }}
      initial={{ scale: 0, opacity: 0, rotate: 0 }}
      animate={{ scale: 1, opacity: 1, rotate: baseRotate }}
      exit={{ scale: 0, opacity: 0, transition: { duration: 0.4 } }}
      transition={{ duration: 0.8, delay: delay, type: 'spring', bounce: 0.5 }}
    >
      <motion.img
        draggable={false}
        src={src}
        alt=""
        className="w-full h-full object-contain drop-shadow-sm cursor-grab active:cursor-grabbing"
        animate={{ 
          y: floatY,
          x: [0, index % 2 === 0 ? floatXBase : -floatXBase, index % 2 === 0 ? -floatXBase : floatXBase, 0]
        }}
        whileHover={{ 
          scale: hoverScale, 
          rotate: hoverRotate, 
          filter: hoverFilter,
          transition: { duration: 0.2, delay: 0 }
        }}
        whileDrag={{ 
          scale: hoverScale * 1.1, 
          rotate: hoverRotate, 
          filter: hoverFilter
        }}
        transition={{
          y: { duration: durationY, repeat: Infinity, ease: "easeInOut", delay: delay + 0.8 },
          x: { duration: durationX, repeat: Infinity, ease: "easeInOut", delay: delay + 0.8 }
        }}
      />
    </motion.div>
  );
}
