// MAELSTROM - Audio Manager
// Procedural Web Audio API sounds (no external audio files needed)

export class AudioManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.musicGain = null;
        this.sfxGain = null;
    }

    init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();

            // Master gains
            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = 0.3;
            this.musicGain.connect(this.ctx.destination);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = 0.5;
            this.sfxGain.connect(this.ctx.destination);
        } catch (e) {
            console.warn('Audio not available:', e);
            this.enabled = false;
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Cannon fire sound
    playCannonFire() {
        if (!this.enabled || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;

        // Noise burst
        const bufferSize = this.ctx.sampleRate * 0.3;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.05));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        // Low frequency component
        const osc = this.ctx.createOscillator();
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);

        // Gain envelope
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        noise.connect(gain);
        osc.connect(gain);
        gain.connect(this.sfxGain);

        noise.start(now);
        osc.start(now);
        noise.stop(now + 0.4);
        osc.stop(now + 0.4);
    }

    // Hit/explosion sound
    playHit() {
        if (!this.enabled || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.2);
    }

    // Ship sink sound
    playSink() {
        if (!this.enabled || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;

        // Creaking
        const bufferSize = this.ctx.sampleRate * 1.5;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            const t = i / this.ctx.sampleRate;
            const creak = Math.sin(t * 50 + Math.sin(t * 10) * 5) * Math.exp(-t * 1.5);
            data[i] = creak * (Math.random() * 0.3 + 0.7);
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const gain = this.ctx.createGain();
        gain.gain.value = 0.4;

        noise.connect(gain);
        gain.connect(this.sfxGain);

        noise.start(now);
    }

    // Coin collect
    playCoin() {
        if (!this.enabled || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;

        const frequencies = [880, 1100, 1320];
        frequencies.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            osc.frequency.value = freq;
            osc.type = 'sine';

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0, now + i * 0.08);
            gain.gain.linearRampToValueAtTime(0.2, now + i * 0.08 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.15);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(now + i * 0.08);
            osc.stop(now + i * 0.08 + 0.15);
        });
    }

    // Level up fanfare
    playLevelUp() {
        if (!this.enabled || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;

        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            osc.frequency.value = freq;
            osc.type = 'square';

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0, now + i * 0.12);
            gain.gain.linearRampToValueAtTime(0.15, now + i * 0.12 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.3);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(now + i * 0.12);
            osc.stop(now + i * 0.12 + 0.3);
        });
    }

    // Boss appear
    playBossAppear() {
        if (!this.enabled || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;

        // Ominous low drone
        const osc = this.ctx.createOscillator();
        osc.frequency.setValueAtTime(50, now);
        osc.frequency.linearRampToValueAtTime(80, now + 2);
        osc.type = 'sawtooth';

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.4, now + 1);
        gain.gain.setValueAtTime(0.4, now + 2);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 4);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 4);
    }

    // Boss death
    playBossDeath() {
        if (!this.enabled || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;

        // Explosion
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.5));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const osc = this.ctx.createOscillator();
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + 1.5);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 2);

        noise.connect(gain);
        osc.connect(gain);
        gain.connect(this.sfxGain);

        noise.start(now);
        osc.start(now);
        noise.stop(now + 2);
        osc.stop(now + 2);
    }

    // Death sound
    playDeath() {
        if (!this.enabled || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 1);
        osc.type = 'sine';

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 1);
    }

    // Button click
    playClick() {
        if (!this.enabled || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        osc.frequency.value = 600;
        osc.type = 'sine';

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.1);
    }

    setMusicVolume(v) {
        if (this.musicGain) {
            this.musicGain.gain.value = v * 0.3;
        }
    }

    setSFXVolume(v) {
        if (this.sfxGain) {
            this.sfxGain.gain.value = v * 0.5;
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}
