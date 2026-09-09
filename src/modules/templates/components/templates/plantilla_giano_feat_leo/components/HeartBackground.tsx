import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const HeartBackground: React.FC = () => {
  const [hearts, setHearts] = useState<{ id: number; left: number; duration: number; delay: number }[]>([]);

  useEffect(() => {
    // Generate random hearts only on client side to avoid hydration mismatch
    const generatedHearts = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: Math.random() * 10 + 10, // 10-20s duration
      delay: Math.random() * 10,
    }));
    setHearts(generatedHearts);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute text-rose-200 opacity-30 text-4xl"
          initial={{ bottom: -50, left: `${heart.left}%`, rotate: 0 }}
          animate={{
            bottom: '110%',
            rotate: 360,
          }}
          transition={{
            duration: heart.duration,
            repeat: Infinity,
            delay: heart.delay,
            ease: "linear",
          }}
        >
          ❤
        </motion.div>
      ))}
    </div>
  );
};

export default HeartBackground;