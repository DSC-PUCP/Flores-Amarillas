import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

type DragRevealProps = {
  text?: string;
  image?: string;
};

const DragReveal: React.FC<DragRevealProps> = ({ 
  text = "¡Vale por una cena romántica!",
  image = "https://picsum.photos/id/1005/200/200"
}) => {

  const constraintsRef = useRef(null);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [0, 200], [1, 0]);
  const revealOpacity = useTransform(x, [0, 150], [0, 1]);
  const [unlocked, setUnlocked] = useState(false);

  const handleDragEnd = () => {
    if (x.get() > 200) {
      setUnlocked(true);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-12 px-4">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-script text-rose-800 font-bold">
          Un pequeño secreto...
        </h3>
        <p className="text-rose-600 text-sm">Desliza para descubrir</p>
      </div>

      <div className="relative h-80 w-full bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-rose-100">
        
        {/* Contenido oculto (revelado) */}
        <motion.div 
          className="absolute inset-0 flex flex-col items-center justify-center bg-rose-50 p-6 text-center"
          style={{ opacity: revealOpacity }}
        >
          <div className="mb-4">
            <img 
              src={image}
              alt="Secret" 
              className="w-32 h-32 rounded-full object-cover border-4 border-rose-400 shadow-lg mx-auto"
            />
          </div>

          <h4 className="text-xl font-bold text-rose-700 mb-2 break-words max-w-full">
            {text}
          </h4>

          <p className="text-gray-600 break-words max-w-full">
            Cuando tú quieras, donde tú quieras. Yo invito.
          </p>
        </motion.div>

        {/* Slider */}
        {!unlocked && (
          <motion.div 
            ref={constraintsRef}
            className="absolute inset-0 bg-rose-500 z-10 flex items-center p-4 cursor-grab active:cursor-grabbing"
            style={{ opacity }}
          >
            <div className="w-full relative h-full flex items-center">
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 250 }}
                onDragEnd={handleDragEnd}
                style={{ x }}
                className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center z-20 absolute left-0"
              >
                <ArrowRight className="text-rose-500" />
              </motion.div>

              <div className="ml-20 text-white font-bold text-lg animate-pulse">
                Desliza para ver la sorpresa
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DragReveal;
