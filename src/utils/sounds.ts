/**
 * OBAOL Supreme — UI Sound Engine
 * Generates sounds via the Web Audio API (no external files needed).
 * All sounds are subtle, professional, and non-intrusive.
 */

let _ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!_ctx || _ctx.state === "closed") {
        _ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // Resume if suspended (browser autoplay policy)
    if (_ctx.state === "suspended") {
        _ctx.resume();
    }
    return _ctx;
}

interface ToneOptions {
    frequency: number;
    type: OscillatorType;
    duration: number;
    gain: number;
    fadeIn?: number;
    endFrequency?: number;
}

function playTone(opts: ToneOptions, startDelay = 0): void {
    const ctx = getCtx();
    if (!ctx) return;

    const { frequency, type, duration, gain, fadeIn = 0.005, endFrequency } = opts;
    const startAt = ctx.currentTime + startDelay;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startAt);

    if (endFrequency !== undefined) {
        oscillator.frequency.linearRampToValueAtTime(endFrequency, startAt + duration);
    }

    gainNode.gain.setValueAtTime(0, startAt);
    gainNode.gain.linearRampToValueAtTime(gain, startAt + fadeIn);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

    oscillator.start(startAt);
    oscillator.stop(startAt + duration);
}

export type SoundType = "nav" | "tab" | "click" | "success" | "danger" | "toggle" | "modal" | "cash" | "language";

/**
 * Plays a specific UI sound effect.
 * @param type - The sound type to play
 */
export function playSound(type: SoundType): void {
    try {
        switch (type) {
            // Route movement — grounded, low, and operational.
            case "nav":
                playTone({ frequency: 196, type: "sine", duration: 0.14, gain: 0.055, endFrequency: 224 });
                playTone({ frequency: 392, type: "triangle", duration: 0.1, gain: 0.024 }, 0.025);
                break;

            // Tab switch — light upward transition.
            case "tab":
                playTone({ frequency: 330, type: "sine", duration: 0.11, gain: 0.04, endFrequency: 495 });
                playTone({ frequency: 660, type: "triangle", duration: 0.08, gain: 0.018 }, 0.035);
                break;

            // OBAOL pulse — warm base with a restrained gold harmonic.
            case "click":
                playTone({ frequency: 247, type: "sine", duration: 0.09, gain: 0.038, endFrequency: 220 });
                playTone({ frequency: 740, type: "triangle", duration: 0.055, gain: 0.018 }, 0.012);
                break;

            // Success action — confident, ascending confirmation.
            case "success":
                playTone({ frequency: 330, type: "sine", duration: 0.09, gain: 0.052 });
                playTone({ frequency: 494, type: "triangle", duration: 0.12, gain: 0.042 }, 0.07);
                playTone({ frequency: 659, type: "sine", duration: 0.1, gain: 0.024 }, 0.14);
                break;

            // Danger / delete — muted descending warning.
            case "danger":
                playTone({ frequency: 196, type: "sine", duration: 0.18, gain: 0.07, endFrequency: 123 });
                playTone({ frequency: 98, type: "triangle", duration: 0.16, gain: 0.026 }, 0.035);
                break;

            // Toggle on/off — compact state flip.
            case "toggle":
                playTone({ frequency: 440, type: "triangle", duration: 0.055, gain: 0.035 });
                playTone({ frequency: 587, type: "sine", duration: 0.045, gain: 0.022 }, 0.04);
                break;

            // Modal open — soft deep open pulse.
            case "modal":
                playTone({ frequency: 174, type: "sine", duration: 0.16, gain: 0.045, endFrequency: 220, fadeIn: 0.012 });
                playTone({ frequency: 349, type: "triangle", duration: 0.11, gain: 0.018 }, 0.04);
                break;

            // Currency change — refined metallic accent.
            case "cash":
                playTone({ frequency: 784, type: "triangle", duration: 0.065, gain: 0.032 });
                playTone({ frequency: 1175, type: "sine", duration: 0.09, gain: 0.022, endFrequency: 1397 }, 0.055);
                break;

            // Language switch — clean dual-tone switch.
            case "language":
                playTone({ frequency: 523, type: "sine", duration: 0.07, gain: 0.032 });
                playTone({ frequency: 698, type: "triangle", duration: 0.075, gain: 0.026 }, 0.065);
                break;
        }
    } catch {
        // Fail silently — audio is enhancement only
    }
}
