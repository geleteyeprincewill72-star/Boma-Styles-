/**
 * Web Audio API Music Synthesizer & Audio Utilities for Aura Network
 * Generates custom synthesized audio buffers, music beats, and waveforms directly in browser.
 */

export interface MusicTrackConfig {
  title: string;
  genre: 'synthwave' | 'lofi' | 'afrobeat' | 'ambient' | 'darktrap' | 'house';
  bpm: number;
  key: string;
  mood: 'euphoric' | 'relaxed' | 'dark' | 'energetic' | 'atmospheric';
  durationSeconds: number;
}

export interface GeneratedTrack {
  id: string;
  title: string;
  genre: string;
  bpm: number;
  key: string;
  mood: string;
  audioUrl: string;
  duration: number;
  createdAt: number;
  waveformData: number[];
}

/**
 * Generates a WAV Blob of synthesized music based on configuration parameters
 */
export async function generateSynthesizedMusic(config: MusicTrackConfig): Promise<{ audioBlob: Blob; audioUrl: string; waveformData: number[] }> {
  const sampleRate = 44100;
  const numChannels = 2;
  const duration = Math.min(Math.max(config.durationSeconds, 5), 30); // 5 to 30 seconds
  const totalSamples = sampleRate * duration;

  // Use OfflineAudioContext for fast rendering
  const offlineCtx = new OfflineAudioContext(numChannels, totalSamples, sampleRate);

  const bpm = config.bpm || 120;
  const secondsPerBeat = 60 / bpm;
  const totalBeats = Math.floor(duration / secondsPerBeat);

  // Master Gain & Filter
  const masterGain = offlineCtx.createGain();
  masterGain.gain.setValueAtTime(0.7, 0);

  const masterFilter = offlineCtx.createBiquadFilter();
  if (config.genre === 'lofi') {
    masterFilter.type = 'lowpass';
    masterFilter.frequency.setValueAtTime(1800, 0);
  } else if (config.genre === 'ambient') {
    masterFilter.type = 'lowpass';
    masterFilter.frequency.setValueAtTime(1200, 0);
  } else {
    masterFilter.type = 'lowpass';
    masterFilter.frequency.setValueAtTime(8000, 0);
  }

  masterFilter.connect(masterGain);
  masterGain.connect(offlineCtx.destination);

  // Frequencies based on selected key
  const KEY_FREQUENCIES: Record<string, number[]> = {
    'C': [261.63, 293.66, 329.63, 392.00, 440.00, 523.25], // C Major / Am
    'D': [293.66, 329.63, 369.99, 440.00, 493.88, 587.33],
    'E': [329.63, 369.99, 415.30, 493.88, 554.37, 659.25],
    'F': [349.23, 392.00, 440.00, 523.25, 587.33, 698.46],
    'G': [392.00, 440.00, 493.88, 587.33, 659.25, 783.99],
    'A': [220.00, 246.94, 277.18, 329.63, 369.99, 440.00],
    'B': [246.94, 277.18, 311.13, 369.99, 415.30, 493.88],
  };

  const scale = KEY_FREQUENCIES[config.key] || KEY_FREQUENCIES['C'];

  // 1. Synthesize Drums (Kick & Snare)
  for (let b = 0; b < totalBeats; b++) {
    const time = b * secondsPerBeat;

    // Kick on beat 0 and beat 2 (or Afrobeat syncopation)
    const isKickBeat = config.genre === 'afrobeat' 
      ? (b % 4 === 0 || b % 4 === 2.5 || b % 4 === 3)
      : (b % 2 === 0);

    if (isKickBeat) {
      const kickOsc = offlineCtx.createOscillator();
      const kickGain = offlineCtx.createGain();

      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(150, time);
      kickOsc.frequency.exponentialRampToValueAtTime(0.01, time + 0.2);

      kickGain.gain.setValueAtTime(0.8, time);
      kickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

      kickOsc.connect(kickGain);
      kickGain.connect(masterFilter);

      kickOsc.start(time);
      kickOsc.stop(time + 0.25);
    }

    // Snare / Clap on beat 1 and 3
    if (b % 2 === 1 && config.genre !== 'ambient') {
      const snareNoise = offlineCtx.createBufferSource();
      const noiseBuffer = offlineCtx.createBuffer(1, sampleRate * 0.15, sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseBuffer.length; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      snareNoise.buffer = noiseBuffer;

      const snareFilter = offlineCtx.createBiquadFilter();
      snareFilter.type = 'highpass';
      snareFilter.frequency.setValueAtTime(1000, time);

      const snareGain = offlineCtx.createGain();
      snareGain.gain.setValueAtTime(0.4, time);
      snareGain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

      snareNoise.connect(snareFilter);
      snareFilter.connect(snareGain);
      snareGain.connect(masterFilter);

      snareNoise.start(time);
      snareNoise.stop(time + 0.15);
    }

    // Hi-hats every sub-beat
    if (config.genre !== 'ambient') {
      const hihatCount = (config.genre === 'darktrap' || config.genre === 'house') ? 4 : 2;
      for (let h = 0; h < hihatCount; h++) {
        const hhTime = time + (h * (secondsPerBeat / hihatCount));
        if (hhTime >= duration) break;

        const hhNoise = offlineCtx.createBufferSource();
        const hhBuffer = offlineCtx.createBuffer(1, sampleRate * 0.04, sampleRate);
        const hhData = hhBuffer.getChannelData(0);
        for (let i = 0; i < hhBuffer.length; i++) {
          hhData[i] = Math.random() * 2 - 1;
        }
        hhNoise.buffer = hhBuffer;

        const hhFilter = offlineCtx.createBiquadFilter();
        hhFilter.type = 'highpass';
        hhFilter.frequency.setValueAtTime(5000, hhTime);

        const hhGain = offlineCtx.createGain();
        hhGain.gain.setValueAtTime(0.2, hhTime);
        hhGain.gain.exponentialRampToValueAtTime(0.001, hhTime + 0.03);

        hhNoise.connect(hhFilter);
        hhFilter.connect(hhGain);
        hhGain.connect(masterFilter);

        hhNoise.start(hhTime);
        hhNoise.stop(hhTime + 0.04);
      }
    }
  }

  // 2. Synthesize Bassline
  const bassNotes = [scale[0] / 2, scale[2] / 2, scale[3] / 2, scale[1] / 2];
  for (let b = 0; b < totalBeats; b += 2) {
    const time = b * secondsPerBeat;
    const noteFreq = bassNotes[(b / 2) % bassNotes.length];

    const bassOsc = offlineCtx.createOscillator();
    const bassGain = offlineCtx.createGain();

    bassOsc.type = config.genre === 'synthwave' ? 'sawtooth' : 'sine';
    bassOsc.frequency.setValueAtTime(noteFreq, time);

    bassGain.gain.setValueAtTime(0.5, time);
    bassGain.gain.exponentialRampToValueAtTime(0.01, time + (secondsPerBeat * 1.8));

    bassOsc.connect(bassGain);
    bassGain.connect(masterFilter);

    bassOsc.start(time);
    bassOsc.stop(time + (secondsPerBeat * 1.8));
  }

  // 3. Arpeggio / Melody Synthesis
  const subBeats = Math.floor(duration / (secondsPerBeat / 2));
  for (let sb = 0; sb < subBeats; sb++) {
    const time = sb * (secondsPerBeat / 2);
    const noteIndex = (sb * 3) % scale.length;
    const freq = scale[noteIndex];

    const melOsc = offlineCtx.createOscillator();
    const melGain = offlineCtx.createGain();

    melOsc.type = config.genre === 'synthwave' ? 'sawtooth' : (config.genre === 'lofi' ? 'triangle' : 'sine');
    melOsc.frequency.setValueAtTime(freq, time);

    const melDuration = secondsPerBeat / 2.5;
    melGain.gain.setValueAtTime(0.25, time);
    melGain.gain.exponentialRampToValueAtTime(0.001, time + melDuration);

    melOsc.connect(melGain);
    melGain.connect(masterFilter);

    melOsc.start(time);
    melOsc.stop(time + melDuration);
  }

  // 4. Ambient Pad Layer
  const padOsc = offlineCtx.createOscillator();
  const padGain = offlineCtx.createGain();

  padOsc.type = 'triangle';
  padOsc.frequency.setValueAtTime(scale[0], 0);

  padGain.gain.setValueAtTime(0.1, 0);
  padGain.gain.linearRampToValueAtTime(0.2, duration / 2);
  padGain.gain.linearRampToValueAtTime(0.01, duration);

  padOsc.connect(padGain);
  padGain.connect(masterFilter);

  padOsc.start(0);
  padOsc.stop(duration);

  // Render Context to AudioBuffer
  const renderedBuffer = await offlineCtx.startRendering();

  // Generate Waveform Visualization Data Points
  const channelData = renderedBuffer.getChannelData(0);
  const step = Math.floor(channelData.length / 50);
  const waveformData: number[] = [];
  for (let i = 0; i < 50; i++) {
    let sum = 0;
    for (let j = 0; j < step; j++) {
      sum += Math.abs(channelData[i * step + j] || 0);
    }
    waveformData.push(Math.min(1, (sum / step) * 2.5));
  }

  // Convert AudioBuffer to WAV Blob
  const wavBlob = audioBufferToWavBlob(renderedBuffer);
  const audioUrl = URL.createObjectURL(wavBlob);

  return {
    audioBlob: wavBlob,
    audioUrl,
    waveformData,
  };
}

/**
 * Converts AudioBuffer to PCM WAV Blob
 */
function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  let result: Float32Array;
  if (numChannels === 2) {
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    result = new Float32Array(left.length + right.length);
    for (let i = 0; i < left.length; i++) {
      result[i * 2] = left[i];
      result[i * 2 + 1] = right[i];
    }
  } else {
    result = buffer.getChannelData(0);
  }

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const bufferLength = 44 + result.length * bytesPerSample;
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  /* RIFF identifier */
  writeString(0, 'RIFF');
  /* RIFF chunk length */
  view.setUint32(4, 36 + result.length * bytesPerSample, true);
  /* RIFF type */
  writeString(8, 'WAVE');
  /* format chunk identifier */
  writeString(12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, format, true);
  /* channel count */
  view.setUint16(22, numChannels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * blockAlign, true);
  /* block align */
  view.setUint16(32, blockAlign, true);
  /* bits per sample */
  view.setUint16(34, bitDepth, true);
  /* data chunk identifier */
  writeString(36, 'data');
  /* data chunk length */
  view.setUint32(40, result.length * bytesPerSample, true);

  // Write PCM audio samples
  let offset = 44;
  for (let i = 0; i < result.length; i++) {
    const s = Math.max(-1, Math.min(1, result[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}
