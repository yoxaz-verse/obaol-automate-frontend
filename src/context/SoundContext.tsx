"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { playSound, SoundType } from "@/utils/sounds";

interface SoundContextValue {
    soundEnabled: boolean;
    setSoundEnabled: (v: boolean) => void;
    play: (type: SoundType) => void;
}

const SoundContext = createContext<SoundContextValue>({
    soundEnabled: true,
    setSoundEnabled: () => { },
    play: () => { },
});

export const useSoundEffect = () => useContext(SoundContext);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [soundEnabled, setSoundEnabledState] = useState(true);

    // Persist preference in localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem("obaol_sound");
            if (stored !== null) {
                setSoundEnabledState(stored === "true");
            }
        } catch { }
    }, []);

    const setSoundEnabled = useCallback((v: boolean) => {
        setSoundEnabledState(v);
        try { localStorage.setItem("obaol_sound", String(v)); } catch { }
    }, []);

    const play = useCallback((type: SoundType) => {
        if (soundEnabled) playSound(type);
    }, [soundEnabled]);

    return (
        <SoundContext.Provider value={{ soundEnabled, setSoundEnabled, play }}>
            {children}
        </SoundContext.Provider>
    );
};
