import { useCallback, useEffect, useRef, useState } from 'react';

// Tipos mínimos de la YouTube IFrame Player API.
type ClipOptions = {
  videoId: string;
  startSeconds?: number;
  endSeconds?: number;
};

type YTPlayer = {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  loadVideoById(options: ClipOptions): void;
  cueVideoById(options: ClipOptions): void;
  /** No esta en los dobles de las pruebas, de ahi el opcional. */
  setVolume?(volume: number): void;
  destroy(): void;
};

type YTNamespace = {
  Player: new (
    element: HTMLElement,
    options: {
      width: string;
      height: string;
      playerVars: Record<string, number>;
      events: {
        onReady: () => void;
        onStateChange: (event: { data: number }) => void;
        onError: (event: { data: number }) => void;
      };
    }
  ) => YTPlayer;
};

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const STATE = { ENDED: 0, PLAYING: 1, BUFFERING: 3 } as const;

let apiPromise: Promise<YTNamespace> | null = null;

function loadYouTubeApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  apiPromise ??= new Promise((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT) resolve(window.YT);
    };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = () => {
      apiPromise = null;
      reject(new Error('No se pudo cargar YouTube'));
    };
    document.head.appendChild(script);
  });
  return apiPromise;
}

/** "127.0.0.1", "192.168.0.10", "[::1]": direcciones IP en vez de un nombre. */
export const isIpHostname = (hostname: string) =>
  /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) || hostname.includes(':');

/** Códigos de error de YouTube explicados para quien llena el formulario. */
export function describePlayerError(
  code: number | null,
  hostname = typeof window === 'undefined' ? '' : window.location.hostname
): string | null {
  if (code === null) return null;
  if (code === 101 || code === 150) {
    // YouTube bloquea muchas canciones con derechos cuando la página se abre
    // desde una IP; el mismo video suena en localhost o en el dominio real.
    if (isIpHostname(hostname))
      return `YouTube bloquea esta canción porque abriste la página desde una dirección IP (${hostname}). Ábrela con localhost o con el dominio de la página y vuelve a probar.`;
    return 'Este video no permite reproducirse fuera de YouTube. Prueba con la versión del canal oficial del artista o la de "Topic".';
  }
  if (code === 100) return 'Este video ya no está disponible.';
  if (code === -1)
    return 'No se pudo cargar YouTube. Revisa tu conexión o el bloqueador de anuncios.';
  return 'No se pudo reproducir este video.';
}

type Options = {
  onEnded?: () => void;
  onError?: (code: number) => void;
  /** Volumen del reproductor, 0-100. Si no se pasa, queda el de YouTube. */
  volume?: number;
};

/**
 * Monta un reproductor de YouTube dentro de `hostRef`. El iframe se crea en un
 * div hijo para que React no pelee con el elemento que YouTube reemplaza.
 */
export function useYouTubePlayer(options: Options = {}) {
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const hostRef = useCallback(
    (node: HTMLDivElement | null) => setHost(node),
    []
  );
  const playerRef = useRef<YTPlayer | null>(null);
  const callbacks = useRef(options);
  const stopAt = useRef<number | null>(null);

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [errorCode, setErrorCode] = useState<number | null>(null);

  useEffect(() => {
    callbacks.current = options;
  });

  useEffect(() => {
    if (!host) return;
    let cancelled = false;
    const mount = document.createElement('div');
    host.appendChild(mount);

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled) return;
        playerRef.current = new YT.Player(mount, {
          width: '100%',
          height: '100%',
          playerVars: {
            playsinline: 1,
            rel: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
          },
          events: {
            onReady: () => {
              if (cancelled) return;
              // El volumen se fija aqui y no en cada clip: YouTube lo guarda
              // en el reproductor, asi que vale para todo lo que se cargue
              // despues.
              const nivel = callbacks.current.volume;
              if (nivel !== undefined) playerRef.current?.setVolume?.(nivel);
              setReady(true);
            },
            onStateChange: ({ data }) => {
              if (cancelled) return;
              setPlaying(data === STATE.PLAYING || data === STATE.BUFFERING);
              const length = playerRef.current?.getDuration();
              if (length) setDuration(length);
              if (data === STATE.ENDED) callbacks.current.onEnded?.();
            },
            onError: ({ data }) => {
              if (cancelled) return;
              setErrorCode(data);
              callbacks.current.onError?.(data);
            },
          },
        });
      })
      .catch(() => {
        if (!cancelled) setErrorCode(-1);
      });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
      host.replaceChildren();
      stopAt.current = null;
      setReady(false);
      setPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setErrorCode(null);
    };
  }, [host]);

  // Tiempo actual mientras suena, y pausa automática al escuchar un rango.
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      const time = player.getCurrentTime();
      setCurrentTime(time);
      if (stopAt.current !== null && time >= stopAt.current) {
        stopAt.current = null;
        player.pauseVideo();
      }
    }, 150);
    return () => window.clearInterval(timer);
  }, [playing]);

  // Con cueVideoById la duración a veces llega un poco después.
  useEffect(() => {
    if (!ready || duration > 0) return;
    const timer = window.setInterval(() => {
      const length = playerRef.current?.getDuration();
      if (length) setDuration(length);
    }, 500);
    return () => window.clearInterval(timer);
  }, [ready, duration]);

  const load = useCallback(
    (
      clip: { videoId: string; start?: number; end?: number },
      autoplay: boolean
    ) => {
      const player = playerRef.current;
      if (!player) return;
      stopAt.current = null;
      setErrorCode(null);
      setDuration(0);
      setCurrentTime(clip.start ?? 0);
      const clipOptions = {
        videoId: clip.videoId,
        startSeconds: clip.start,
        endSeconds: clip.end,
      };
      if (autoplay) player.loadVideoById(clipOptions);
      else player.cueVideoById(clipOptions);
    },
    []
  );

  const play = useCallback(() => {
    stopAt.current = null;
    playerRef.current?.playVideo();
  }, []);

  const pause = useCallback(() => playerRef.current?.pauseVideo(), []);

  const seek = useCallback((time: number) => {
    playerRef.current?.seekTo(time, true);
    setCurrentTime(time);
  }, []);

  const playRange = useCallback((start: number, end: number) => {
    const player = playerRef.current;
    if (!player) return;
    player.seekTo(start, true);
    setCurrentTime(start);
    stopAt.current = end;
    player.playVideo();
  }, []);

  return {
    hostRef,
    ready,
    playing,
    currentTime,
    duration,
    errorCode,
    load,
    play,
    pause,
    seek,
    playRange,
  };
}
