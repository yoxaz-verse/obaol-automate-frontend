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

function playTone(opts: ToneOptions): void {
    const ctx = getCtx();
    if (!ctx) return;

    const { frequency, type, duration, gain, fadeIn = 0.005, endFrequency } = opts;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    if (endFrequency !== undefined) {
        oscillator.frequency.linearRampToValueAtTime(endFrequency, ctx.currentTime + duration);
    }

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(gain, ctx.currentTime + fadeIn);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
}

export type SoundType = "nav" | "tab" | "click" | "success" | "danger" | "toggle" | "modal" | "cash" | "language";

/**
 * Plays a specific UI sound effect.
 * @param type - The sound type to play
 */
export function playSound(type: SoundType): void {
    try {
        switch (type) {
            // Sidebar nav click — soft low "thud" with woody quality
            case "nav":
                playTone({ frequency: 220, type: "sine", duration: 0.18, gain: 0.12 });
                setTimeout(() =>
                    playTone({ frequency: 280, type: "sine", duration: 0.1, gain: 0.06 }), 30
                );
                break;

            // Tab switch — clean "swoosh" upward
            case "tab":
                playTone({ frequency: 380, type: "sine", duration: 0.13, gain: 0.15, endFrequency: 520 });
                break;

            // General button click — crisp, short tick
            case "click":
                playTone({ frequency: 600, type: "square", duration: 0.04, gain: 0.04 });
                break;

            // Success action (add, save, publish) — bright ascending two-tone
            case "success":
                playTone({ frequency: 440, type: "sine", duration: 0.1, gain: 0.2 });
                setTimeout(() =>
                    playTone({ frequency: 660, type: "sine", duration: 0.15, gain: 0.15 }), 80
                );
                break;

            // Danger / delete — descending low dull thud
            case "danger":
                playTone({ frequency: 200, type: "sine", duration: 0.2, gain: 0.25, endFrequency: 120 });
                break;

            // Toggle on/off — quick soft click
            case "toggle":
                playTone({ frequency: 480, type: "sine", duration: 0.07, gain: 0.07 });
                break;

            // Modal open — soft deep "pop"
            case "modal":
                playTone({ frequency: 180, type: "sine", duration: 0.25, gain: 0.1, endFrequency: 240, fadeIn: 0.01 });
                break;

            // Currency change — bright metallic "cha-ching" style
            case "cash":
                playTone({ frequency: 800, type: "triangle", duration: 0.1, gain: 0.08 });
                setTimeout(() =>
                    playTone({ frequency: 1200, type: "sine", duration: 0.2, gain: 0.1, endFrequency: 1600 }), 60
                );
                break;

            // Language switch — fast dual-tone blip
            case "language":
                playTone({ frequency: 550, type: "sine", duration: 0.08, gain: 0.1 });
                setTimeout(() =>
                    playTone({ frequency: 750, type: "sine", duration: 0.1, gain: 0.08 }), 80
                );
                break;
        }
    } catch {
        // Fail silently — audio is enhancement only
    }
}
