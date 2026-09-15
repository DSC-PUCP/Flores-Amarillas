/**
 * Todo el sonido del jardin se sintetiza en el navegador con WebAudio: no hay
 * archivos que cargar ni YouTube que pueda bloquear el video. Eso importa aca
 * porque la pagina se abre desde el celular de quien recibe el regalo, muchas
 * veces con datos y sin wifi.
 */

type Note = string | 0;

/** La melodia del jardin: dulce, en bucle, de fondo. */
const MEL_JARDIN: Note[] = [
  'E5',
  0,
  'G5',
  'A5',
  'G5',
  0,
  'E5',
  'D5',
  'C5',
  0,
  'D5',
  'E5',
  'G5',
  0,
  0,
  0,
  'A5',
  0,
  'C6',
  'A5',
  'G5',
  0,
  'E5',
  'G5',
  'D5',
  0,
  'E5',
  'D5',
  'C5',
  0,
  0,
  0,
];
const BASS_JARDIN = [
  ['C3', 'G3'],
  ['A2', 'E3'],
  ['F2', 'C3'],
  ['G2', 'D3'],
];

/**
 * La segunda cancion, la del cofre: mas lenta y mas alta, para que se note que
 * algo cambio cuando se abre.
 */
const MEL_COFRE: Note[] = [
  'C6',
  0,
  'B5',
  'G5',
  'A5',
  0,
  'E5',
  0,
  'F5',
  0,
  'G5',
  'A5',
  'C6',
  0,
  0,
  0,
  'D6',
  0,
  'C6',
  'A5',
  'G5',
  0,
  'F5',
  'G5',
  'E5',
  0,
  'D5',
  'E5',
  'C5',
  0,
  0,
  0,
];
const BASS_COFRE = [
  ['F2', 'C3'],
  ['G2', 'D3'],
  ['A2', 'E3'],
  ['C3', 'G3'],
];

export type SongId = 'jardin' | 'cofre';

const SONGS: Record<SongId, { mel: Note[]; bass: string[][]; step: number }> = {
  jardin: { mel: MEL_JARDIN, bass: BASS_JARDIN, step: 0.3 },
  cofre: { mel: MEL_COFRE, bass: BASS_COFRE, step: 0.36 },
};

/** Nombre de nota ("A4", "C#3" no hace falta) a frecuencia. */
function noteFreq(n: string) {
  const m = n.match(/([A-G])(\d)/);
  if (!m) return 440;
  const i = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1] as 'C'] ?? 0;
  return 440 * 2 ** ((12 * (Number(m[2]) + 1) + i - 69) / 12);
}

export type GardenAudio = ReturnType<typeof createGardenAudio>;

export function createGardenAudio() {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let musicBus: GainNode | null = null;
  let timer: number | null = null;
  let nextT = 0;
  let step = 0;
  let song: SongId = 'jardin';
  let playing = false;

  const init = () => {
    if (ctx) return ctx;
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.7;
    master.connect(ctx.destination);
    musicBus = ctx.createGain();
    musicBus.gain.value = 1;
    musicBus.connect(master);
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.33;
    const fb = ctx.createGain();
    fb.gain.value = 0.28;
    const wet = ctx.createGain();
    wet.gain.value = 0.35;
    musicBus.connect(delay);
    delay.connect(fb);
    fb.connect(delay);
    delay.connect(wet);
    wet.connect(master);
    return ctx;
  };

  const tone = (
    freq: number,
    t: number,
    dur: number,
    type: OscillatorType,
    vol: number,
    dest?: AudioNode
  ) => {
    if (!ctx || !master) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(dest || master);
    o.start(t);
    o.stop(t + dur + 0.05);
  };

  const schedule = () => {
    if (!ctx || !musicBus) return;
    const s = SONGS[song];
    while (nextT < ctx.currentTime + 0.25) {
      const n = s.mel[step];
      if (n) {
        const f = noteFreq(n);
        tone(f, nextT, 1.6, 'sine', 0.11, musicBus);
        tone(f * 2, nextT, 0.5, 'sine', 0.025, musicBus);
        tone(f * 3.01, nextT, 0.22, 'triangle', 0.012, musicBus);
      }
      if (step % 4 === 0) {
        const ch = s.bass[Math.floor(step / 8) % 4];
        tone(noteFreq(ch[(step / 4) % 2]), nextT, 1.3, 'sine', 0.07, musicBus);
      }
      nextT += s.step;
      step = (step + 1) % s.mel.length;
    }
  };

  return {
    /** Hay que llamarlo desde un toque del usuario: iOS no deja sonar antes. */
    unlock() {
      const c = init();
      if (c && c.state === 'suspended') void c.resume();
    },
    get playing() {
      return playing;
    },
    play(which: SongId = song) {
      if (!init()) return;
      song = which;
      step = 0;
      playing = true;
      nextT = (ctx?.currentTime ?? 0) + 0.1;
      if (timer) clearInterval(timer);
      timer = window.setInterval(schedule, 60);
    },
    stop() {
      playing = false;
      if (timer) clearInterval(timer);
      timer = null;
    },
    toggle() {
      if (playing) this.stop();
      else this.play();
    },
    /** Cambia de cancion sin cortar: lo usa el cofre al abrirse. */
    switchTo(which: SongId) {
      if (song === which && playing) return;
      this.play(which);
    },
    get song() {
      return song;
    },
    chime() {
      if (!ctx) return;
      const t = ctx.currentTime;
      for (const [i, f] of [1318.5, 1760, 2093].entries()) {
        tone(f, t + i * 0.07, 0.7, 'sine', 0.08);
      }
    },
    plant() {
      if (!ctx || !master) return;
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(330, t);
      o.frequency.exponentialRampToValueAtTime(990, t + 0.25);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.12, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
      o.connect(g);
      g.connect(master);
      o.start(t);
      o.stop(t + 0.45);
    },
    meow(p = 1) {
      if (!ctx || !master) return;
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      const f = ctx.createBiquadFilter();
      const g = ctx.createGain();
      o.type = 'sawtooth';
      f.type = 'bandpass';
      f.Q.value = 3;
      o.frequency.setValueAtTime(420 * p, t);
      o.frequency.linearRampToValueAtTime(760 * p, t + 0.15);
      o.frequency.linearRampToValueAtTime(520 * p, t + 0.55);
      f.frequency.setValueAtTime(900, t);
      f.frequency.linearRampToValueAtTime(2200, t + 0.18);
      f.frequency.linearRampToValueAtTime(1100, t + 0.55);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.3, t + 0.05);
      g.gain.setValueAtTime(0.3, t + 0.35);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      o.connect(f);
      f.connect(g);
      g.connect(master);
      o.start(t);
      o.stop(t + 0.65);
    },
    purr() {
      if (!ctx || !master) return;
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      const lp = ctx.createBiquadFilter();
      const g = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lg = ctx.createGain();
      const env = ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.value = 52;
      lp.type = 'lowpass';
      lp.frequency.value = 420;
      g.gain.value = 0.2;
      lfo.frequency.value = 24;
      lg.gain.value = 0.2;
      lfo.connect(lg);
      lg.connect(g.gain);
      env.gain.setValueAtTime(0.0001, t);
      env.gain.exponentialRampToValueAtTime(1, t + 0.15);
      env.gain.setValueAtTime(1, t + 1.1);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
      o.connect(lp);
      lp.connect(g);
      g.connect(env);
      env.connect(master);
      o.start(t);
      lfo.start(t);
      o.stop(t + 1.6);
      lfo.stop(t + 1.6);
      tone(700, t + 0.2, 0.3, 'triangle', 0.05);
    },
    /** Zumbido corto, para cuando se toca una abeja. */
    buzz() {
      if (!ctx || !master) return;
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(180, t);
      o.frequency.linearRampToValueAtTime(240, t + 0.18);
      o.frequency.linearRampToValueAtTime(150, t + 0.35);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.09, t + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
      o.connect(g);
      g.connect(master);
      o.start(t);
      o.stop(t + 0.45);
    },
    /** Golpecito del cofre: sube de tono con cada pulsacion. */
    knock(progress: number) {
      if (!ctx || !master) return;
      const t = ctx.currentTime;
      tone(140 + progress * 260, t, 0.16, 'square', 0.07);
      tone(70 + progress * 120, t, 0.24, 'sine', 0.09);
    },
    /** Fanfarria del cofre al abrirse. */
    fanfare() {
      if (!ctx) return;
      const t = ctx.currentTime;
      const notes = ['C5', 'E5', 'G5', 'C6', 'E6'];
      for (const [i, n] of notes.entries()) {
        tone(noteFreq(n), t + i * 0.11, 1.1, 'sine', 0.12);
        tone(noteFreq(n) * 2, t + i * 0.11, 0.5, 'triangle', 0.03);
      }
    },
    suspend() {
      void ctx?.suspend();
    },
    resume() {
      void ctx?.resume();
    },
    dispose() {
      this.stop();
      void ctx?.close();
      ctx = null;
      master = null;
      musicBus = null;
    },
  };
}
