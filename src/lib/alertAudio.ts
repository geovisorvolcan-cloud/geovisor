type ToneStep = {
  frequency: number;
  durationMs: number;
  gain?: number;
  type?: OscillatorType;
};

let audioContext: AudioContext | null | undefined;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (audioContext !== undefined) return audioContext;

  const AudioCtor =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  audioContext = AudioCtor ? new AudioCtor() : null;
  return audioContext;
}

async function playToneSequence(steps: ToneStep[], gapMs = 50) {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {
      return;
    }
  }

  let startAt = ctx.currentTime + 0.02;

  steps.forEach((step) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const duration = step.durationMs / 1000;

    oscillator.type = step.type ?? "sine";
    oscillator.frequency.setValueAtTime(step.frequency, startAt);

    gainNode.gain.setValueAtTime(0.0001, startAt);
    gainNode.gain.exponentialRampToValueAtTime(step.gain ?? 0.16, startAt + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.02);

    startAt += duration + gapMs / 1000;
  });
}

export function playSosConfirmationSound() {
  return playToneSequence(
    [
      { frequency: 784, durationMs: 120, gain: 0.12, type: "triangle" },
      { frequency: 988, durationMs: 150, gain: 0.14, type: "triangle" },
    ],
    40
  );
}

export function playSosAlarmSound() {
  return playToneSequence(
    [
      { frequency: 880, durationMs: 220, gain: 0.22, type: "sawtooth" },
      { frequency: 660, durationMs: 220, gain: 0.22, type: "sawtooth" },
      { frequency: 880, durationMs: 220, gain: 0.22, type: "sawtooth" },
      { frequency: 660, durationMs: 220, gain: 0.22, type: "sawtooth" },
      { frequency: 990, durationMs: 300, gain: 0.24, type: "square" },
    ],
    55
  );
}
