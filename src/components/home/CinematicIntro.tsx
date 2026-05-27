"use client";

import { useEffect, useState } from "react";

const SESSION_KEY = "obaol:cinematic-intro:v1";

export default function CinematicIntro() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = sessionStorage.getItem(SESSION_KEY) === "1";

    if (prefersReduced || seen) return;

    setVisible(true);
    const t = window.setTimeout(() => {
      sessionStorage.setItem(SESSION_KEY, "1");
      setVisible(false);
    }, 1600);

    return () => window.clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div className="cinematic-intro" aria-hidden="true">
      <div className="cinematic-intro__grain" />
      <div className="cinematic-intro__beam" />
      <div className="cinematic-intro__content">
        <p className="cinematic-intro__label">Execution Workspace</p>
        <h1 className="cinematic-intro__title">OBAOL Supreme</h1>
      </div>
    </div>
  );
}
