import { Heart, Pause, Play } from 'lucide-react';
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { assets } from '../assets';
import styles from './spring-music.module.css';

interface SpringMusicProps {
  songs: { url: string; name: string }[];
}

const FLOWER_DATA = [
  { x: -8, y: -8, size: 56, angle: -18 },
  { x: 28, y: -9, size: 48, angle: 16 },
  { x: 57, y: 3, size: 39, angle: -12 },
  { x: -12, y: 29, size: 52, angle: 25 },
  { x: 23, y: 25, size: 49, angle: -30 },
  { x: 3, y: 63, size: 41, angle: 10 },
  { x: 48, y: 49, size: 35, angle: 22 },
] as const;

function FlowerCluster({ corner }: { corner: 'top' | 'bottom' }) {
  return (
    <div
      className={styles.flowerCluster}
      data-corner={corner}
      aria-hidden="true"
    >
      {FLOWER_DATA.map((flower, index) => (
        <img
          key={`${flower.x}-${flower.y}`}
          src={assets.cardFlower}
          alt=""
          className={styles.flower}
          style={
            {
              left: `${flower.x}%`,
              top: `${flower.y}%`,
              '--flower-size': `${flower.size}%`,
              '--angle': `${flower.angle}deg`,
              '--delay': `${index * 0.19 + (corner === 'bottom' ? 0.12 : 0)}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

export function SpringMusic({ songs }: SpringMusicProps) {
  const [activeSongIndex, setActiveSongIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSounding, setIsSounding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [durations, setDurations] = useState<Record<number, number>>({});
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);

  useEffect(() => {
    let cancelled = false;
    audioRefs.current.forEach((audio, idx) => {
      if (!audio) return;
      if (idx === activeSongIndex) {
        if (isPlaying) {
          audio.play().catch(() => {
            if (!cancelled) {
              setIsPlaying(false);
              setIsSounding(false);
            }
          });
        } else {
          audio.pause();
        }
      } else {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    return () => {
      cancelled = true;
    };
  }, [activeSongIndex, isPlaying]);

  const toggleSong = (index: number) => {
    setIsSounding(false);
    if (activeSongIndex === index) {
      setIsPlaying((p) => !p);
    } else {
      setActiveSongIndex(index);
      setIsPlaying(true);
      setProgress(0);
    }
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const audio = e.currentTarget;
    if (audio.duration) {
      setProgress(audio.currentTime / audio.duration);
    }
  };

  const handleLoadedMetadata = (
    index: number,
    e: React.SyntheticEvent<HTMLAudioElement>
  ) => {
    setDurations((prev) => ({ ...prev, [index]: e.currentTarget.duration }));
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setIsSounding(false);
    setProgress(0);
  };

  const formatDuration = (seconds: number) => {
    if (!seconds || Number.isNaN(seconds)) return '—';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Pad to exactly 3 slots
  const slots = Array.from(
    { length: 3 },
    (_, i) => songs[i] ?? { url: '', name: '' }
  );

  return (
    <section className={styles.slide} aria-label="Nuestra música">
      {/* Corner flowers */}
      <FlowerCluster corner="top" />
      <FlowerCluster corner="bottom" />

      {/* Heading */}
      <header className={styles.heading}>
        <p className={styles.eyebrow}>TRES CANCIONES, UNA HISTORIA</p>
        <h2>Nuestra música</h2>
        <span className={styles.dots}>· · · · · · · · · ·</span>
      </header>

      {/* Main stage */}
      <div className={styles.stage}>
        {/* Turntable */}
        <div className={styles.turntableBox} data-playing={isSounding}>
          {/* Floating music notes */}
          <div
            className={styles.notes}
            aria-hidden="true"
            data-playing={isSounding}
          >
            <span
              className={styles.note}
              style={
                { '--note-delay': '0s', '--note-left': '28%' } as CSSProperties
              }
            >
              ♪
            </span>
            <span
              className={styles.note}
              style={
                {
                  '--note-delay': '0.8s',
                  '--note-left': '58%',
                } as CSSProperties
              }
            >
              ♫
            </span>
            <span
              className={styles.note}
              style={
                {
                  '--note-delay': '1.6s',
                  '--note-left': '42%',
                } as CSSProperties
              }
            >
              ♩
            </span>
          </div>

          {/* Decorative sticker */}
          <div className={styles.sticker} aria-hidden="true">
            pequeñas canciones
            <br />
            grandes historias ♡
          </div>

          {/* Vinyl + arm */}
          <div className={styles.turntable}>
            <div
              className={styles.record}
              style={
                {
                  '--spinning': isSounding ? 'running' : 'paused',
                } as CSSProperties
              }
            >
              <svg
                viewBox="0 0 100 100"
                className={styles.vinylSvg}
                aria-hidden="true"
                role="img"
              >
                <title>Tocadiscos de vinilo</title>
                <circle cx="50" cy="50" r="48" fill="#111" />
                <path
                  d="M50 50 L15 18 A48 48 0 0 1 39 3 Z M50 50 L85 82 A48 48 0 0 1 61 97 Z"
                  fill="#fff3d3"
                  opacity="0.12"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="43"
                  fill="none"
                  stroke="#222"
                  strokeWidth="0.5"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="37"
                  fill="none"
                  stroke="#2a2a2a"
                  strokeWidth="0.5"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="31"
                  fill="none"
                  stroke="#222"
                  strokeWidth="0.5"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="25"
                  fill="none"
                  stroke="#2a2a2a"
                  strokeWidth="0.5"
                />
                <circle cx="50" cy="50" r="17" fill="#fdd018" />
                <circle cx="50" cy="50" r="3" fill="#fff3d3" />
                <text
                  x="50"
                  y="60"
                  textAnchor="middle"
                  fill="#8c621f"
                  fontSize="9"
                >
                  ✿
                </text>
                <text
                  x="50"
                  y="47"
                  textAnchor="middle"
                  fill="#69561e"
                  fontSize="4"
                  fontFamily="Dancing Script, cursive"
                >
                  Flores Amarillas ♡
                </text>
              </svg>
            </div>
            <div className={styles.arm} data-playing={isSounding}>
              <svg
                viewBox="0 0 30 100"
                className={styles.armSvg}
                aria-hidden="true"
                role="img"
              >
                <title>Brazo del tocadiscos</title>
                <circle cx="15" cy="15" r="8" fill="#d9c9a0" />
                <circle cx="15" cy="15" r="4" fill="#69561e" />
                <path d="M15 15 L22 75 L18 85 L12 85 Z" fill="#e8d9ae" />
                <rect
                  x="8"
                  y="80"
                  width="12"
                  height="15"
                  rx="2"
                  fill="#5b4315"
                />
              </svg>
            </div>
          </div>
          <div className={styles.caseLabel}>
            Flores Amarillas <span>♡</span>
          </div>
          <output className={styles.playerStatus}>
            <span className={styles.statusLight} />
            {isSounding ? 'SONANDO PARA TI' : 'UN LADO A, SOLO PARA TI'}
          </output>
        </div>

        {/* Playlist */}
        <div className={styles.playlist}>
          <p className={styles.playlistTitle}>♪ Nuestras canciones</p>
          {slots.map((song, idx) => {
            const hasUrl = Boolean(song.url);
            const isActive = activeSongIndex === idx;
            const songKey = `song-${idx}`;

            return (
              <div
                key={songKey}
                className={styles.song}
                data-active={isActive}
                data-empty={!hasUrl}
              >
                <button
                  type="button"
                  className={styles.playButton}
                  onClick={() => hasUrl && toggleSong(idx)}
                  disabled={!hasUrl}
                  aria-label={
                    isActive && isPlaying
                      ? `Pausar ${song.name || `Canción ${idx + 1}`}`
                      : `Reproducir ${song.name || `Canción ${idx + 1}`}`
                  }
                >
                  {isActive && isPlaying ? (
                    <Pause size={16} fill="currentColor" />
                  ) : (
                    <Play size={16} fill="currentColor" />
                  )}
                </button>
                <div className={styles.songInfo}>
                  <p className={styles.songName}>
                    {hasUrl
                      ? song.name || `Canción ${idx + 1}`
                      : `Canción ${idx + 1}`}
                  </p>
                  {hasUrl && (
                    <p className={styles.songDuration}>
                      {formatDuration(durations[idx])}
                    </p>
                  )}
                </div>
                <Heart
                  size={14}
                  className={styles.heartIcon}
                  fill={isActive ? 'currentColor' : 'none'}
                />
                {isActive && (
                  <div className={styles.progressContainer}>
                    <div
                      className={styles.progressBar}
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                )}
                {hasUrl && (
                  <audio
                    ref={(el) => {
                      audioRefs.current[idx] = el;
                    }}
                    src={song.url}
                    onTimeUpdate={(e) => {
                      if (isActive) handleTimeUpdate(e);
                    }}
                    onPlaying={() => {
                      if (isActive) setIsSounding(true);
                    }}
                    onPause={() => {
                      if (isActive) setIsSounding(false);
                    }}
                    onWaiting={() => {
                      if (isActive) setIsSounding(false);
                    }}
                    onError={() => {
                      if (isActive) handleEnded();
                    }}
                    onLoadedMetadata={(e) => handleLoadedMetadata(idx, e)}
                    onEnded={() => {
                      if (isActive) handleEnded();
                    }}
                    preload="metadata"
                  >
                    <track kind="captions" />
                  </audio>
                )}
              </div>
            );
          })}
          <div className={styles.paperNote}>
            <img src={assets.cardFlower} alt="" />
            <p>
              La música también es una
              <br />
              forma de decirte <em>te quiero.</em>
            </p>
            <span aria-hidden="true">♡</span>
          </div>
        </div>
      </div>

      <p className={styles.instructionsText}>
        Toca una canción y déjate llevar ♡
      </p>
    </section>
  );
}
