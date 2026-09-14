import { motion, HTMLMotionProps } from 'framer-motion';

export interface NavButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  direction: 'back' | 'next';
  label: string;
}

export default function NavButton({ direction, label, className = '', ...props }: NavButtonProps) {
  const isBack = direction === 'back';
  
  return (
    <motion.button
      className={`pointer-events-auto cursor-pointer bg-[#082b60] hover:bg-[#113a7a] text-white font-dm font-bold text-sm md:text-base px-5 py-2.5 md:px-6 md:py-3 rounded-full flex items-center justify-center gap-2 shadow-lg transition-colors ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {isBack && (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-[#facc15]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      )}
      {label}
      {!isBack && (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-[#facc15]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      )}
    </motion.button>
  );
}
