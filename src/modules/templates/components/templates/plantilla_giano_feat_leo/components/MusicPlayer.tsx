import React, { useRef, useEffect, useState } from 'react';
import { Music, Pause, Play, Volume2, VolumeX } from 'lucide-react';

interface MusicPlayerProps {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  customUrl?: string; // <-- NUEVO
  title?: string;     // <-- NUEVO (opcional)
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({
  isPlaying,
  setIsPlaying,
  customUrl,
  title = "Nuestra canción especial"
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => {
          console.warn("Autoplay prevented by browser:", e);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, setIsPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const toggleMute = () => setIsMuted(!isMuted);

  // Si no llega URL, no renderiza el reproductor
  if (!customUrl) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-lg border border-rose-200">
      <audio ref={audioRef} src={customUrl} loop />

      <div className="hidden md:block px-2 text-xs font-bold text-rose-800">
        <p>{title}</p>
      </div>

      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="p-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-all shadow-md active:scale-95"
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
      </button>

      {isPlaying && (
        <button
          onClick={toggleMute}
          className="p-2 text-rose-500 hover:bg-rose-100 rounded-full transition-colors"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      )}
    </div>
  );
};

export default MusicPlayer;
