/**
 * Realistic Paper Page Turn Sound Generator using Web Audio API
 * Generates an authentic tactile paper rustle / swoosh sound with zero network dependencies.
 */
let audioCtx: AudioContext | null = null;

export function playRealisticPaperSound(volume: number = 0.35): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const sampleRate = audioCtx.sampleRate;
    const duration = 0.28; // 280ms duration
    const bufferSize = Math.floor(sampleRate * duration);
    const buffer = audioCtx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    // Generate brown/pink filtered noise simulating physical paper friction
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      b6 = white * 0.115926;
      data[i] = pink * 0.11;
    }

    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = buffer;

    // Bandpass filter centered at paper leaf friction resonance (1800Hz - 2800Hz)
    const bandpass = audioCtx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(2400, audioCtx.currentTime);
    bandpass.frequency.exponentialRampToValueAtTime(1400, audioCtx.currentTime + duration);
    bandpass.Q.setValueAtTime(2.2, audioCtx.currentTime);

    // Gain envelope (rise fast, gentle glide down)
    const gainNode = audioCtx.createGain();
    const now = audioCtx.currentTime;
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(volume * 0.6, now + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noiseSource.connect(bandpass);
    bandpass.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    noiseSource.start(now);
  } catch (err) {
    // Audio context silenced or not allowed yet by user interaction policy
    console.debug('Paper sound playback omitted:', err);
  }
}
