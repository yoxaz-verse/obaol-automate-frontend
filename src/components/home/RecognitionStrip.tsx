import React from "react";

const logos = [
  {
    id: "ksum",
    label: "Kerala Startup Mission",
    render: () => (
      <svg viewBox="0 0 240 60" className="h-9 md:h-11 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(4, 8)">
          <path d="M22 6 L34 13 L34 27 L22 20 Z" fill="#00AEEF"/>
          <path d="M22 20 L34 27 L22 34 L10 27 Z" fill="#0072BC"/>
          <path d="M10 13 L22 20 L10 27 L-2 20 Z" fill="#2B3990" transform="translate(6, 0)"/>
          <path d="M22 34 L34 27 L34 41 L22 48 Z" fill="#00AEEF"/>
          <path d="M10 27 L22 34 L22 48 L10 41 Z" fill="#005B94"/>
          <path d="M22 6 L10 13 L22 20 L34 13 Z" fill="#39B54A"/>
        </g>
        <g transform="translate(54, 0)">
          <text x="0" y="29" fontFamily="Inter, system-ui, sans-serif" fontWeight="900" fontSize="22" letterSpacing="-0.5">
            <tspan fill="#00AEEF">kerala</tspan>
            <tspan fill="#0072BC"> startup</tspan>
          </text>
          <text x="0" y="45" fontFamily="Inter, system-ui, sans-serif" fontWeight="800" fontSize="10" letterSpacing="2" fill="currentColor" className="opacity-75">MISSION</text>
        </g>
      </svg>
    ),
  },
  {
    id: "startup-india",
    label: "Startup India",
    render: () => (
      <svg viewBox="0 0 260 60" className="h-9 md:h-11 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(4, 6)">
          <path d="M6 16 C14 4, 30 0, 42 4 C32 10, 22 13, 13 23 Z" fill="#FF9933"/>
          <path d="M3 25 C12 14, 32 9, 46 14 C35 19, 22 23, 11 32 Z" stroke="none" fill="#002B49" className="dark:fill-slate-200"/>
          <path d="M0 34 C9 23, 31 18, 48 24 C36 28, 20 32, 7 43 Z" fill="#138808"/>
        </g>
        <g transform="translate(56, 0)">
          <text x="0" y="30" fontFamily="Inter, system-ui, sans-serif" fontWeight="900" fontSize="22" letterSpacing="-0.5" fill="currentColor">
            Startup<tspan fill="#FF9933"> </tspan><tspan fill="#138808">India</tspan>
          </text>
          <text x="0" y="46" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="8.5" letterSpacing="1.2" fill="currentColor" className="opacity-60">#STARTUPINDIA | DPIIT RECOGNIZED</text>
        </g>
      </svg>
    ),
  },
  {
    id: "msme",
    label: "Ministry of MSME",
    render: () => (
      <svg viewBox="0 0 260 60" className="h-9 md:h-11 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(6, 6)">
          <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="6 3" className="opacity-80"/>
          <circle cx="24" cy="24" r="15" fill="#FF9933"/>
          <circle cx="24" cy="24" r="11" fill="#FFFFFF"/>
          <circle cx="24" cy="24" r="7" fill="#138808"/>
          <circle cx="24" cy="24" r="4" fill="#002B49"/>
          <path d="M24 18 L24 30 M18 24 L30 24 M20 20 L28 28 M20 28 L28 20" stroke="#FFFFFF" strokeWidth="1.2"/>
        </g>
        <g transform="translate(62, 0)">
          <text x="0" y="30" fontFamily="Inter, system-ui, sans-serif" fontWeight="900" fontSize="23" letterSpacing="0.5" fill="currentColor">MSME</text>
          <text x="0" y="46" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="8.5" letterSpacing="0.4" fill="#D97706">MINISTRY OF MICRO, SMALL &amp; MEDIUM ENTERPRISES</text>
        </g>
      </svg>
    ),
  },
  {
    id: "gem",
    label: "Government e-Marketplace",
    render: () => (
      <svg viewBox="0 0 250 60" className="h-9 md:h-11 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(6, 8)">
          <rect x="0" y="8" width="36" height="28" rx="6" fill="#0B2545" className="dark:fill-slate-700"/>
          <path d="M10 22 L16 28 L27 15" fill="none" stroke="#F26522" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="27" cy="15" r="2.5" fill="#138808"/>
        </g>
        <g transform="translate(52, 0)">
          <text x="0" y="32" fontFamily="Inter, system-ui, sans-serif" fontWeight="900" fontSize="26" letterSpacing="-0.5">
            <tspan fill="currentColor">G</tspan>
            <tspan fill="#F26522">e</tspan>
            <tspan fill="currentColor">M</tspan>
          </text>
          <text x="0" y="46" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="8.5" letterSpacing="0.5" fill="currentColor" className="opacity-60">GOVERNMENT e MARKETPLACE</text>
        </g>
      </svg>
    ),
  },
  {
    id: "iec",
    label: "Import Export Code - DGFT India",
    render: () => (
      <svg viewBox="0 0 250 60" className="h-9 md:h-11 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(6, 6)">
          <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-80"/>
          <ellipse cx="24" cy="24" rx="20" ry="9" fill="none" stroke="#00AEEF" strokeWidth="1.5"/>
          <ellipse cx="24" cy="24" rx="9" ry="20" fill="none" stroke="#00AEEF" strokeWidth="1.5"/>
          <line x1="4" y1="24" x2="44" y2="24" stroke="currentColor" strokeWidth="2" className="opacity-60"/>
          <line x1="24" y1="4" x2="24" y2="44" stroke="currentColor" strokeWidth="2" className="opacity-60"/>
          <path d="M38 12 L44 12 L44 18 M44 12 L30 26" stroke="#FF9933" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 36 L4 36 L4 30 M4 36 L18 22" stroke="#138808" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
        <g transform="translate(58, 0)">
          <text x="0" y="30" fontFamily="Inter, system-ui, sans-serif" fontWeight="900" fontSize="23" letterSpacing="0.5" fill="currentColor">IEC</text>
          <text x="0" y="46" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="8.5" letterSpacing="0.4" fill="currentColor" className="opacity-60">IMPORT EXPORT CODE | DGFT INDIA</text>
        </g>
      </svg>
    ),
  },
] as const;

export default function RecognitionStrip() {
  return (
    <section
      aria-label="OBAOL recognitions and registrations"
      className="border-y border-default-200/50 bg-default-50/40 py-6 md:py-8"
    >
      <div className="container mx-auto max-w-6xl xl:max-w-7xl px-6 sm:px-12 public-layout-container">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6 sm:justify-between md:gap-x-12 lg:gap-x-16">
          {logos.map((logo) => (
            <div
              key={logo.id}
              aria-label={logo.label}
              title={logo.label}
              className="select-none flex items-center justify-center grayscale opacity-60 transition duration-300 hover:grayscale-0 hover:opacity-100 hover:scale-105 transform cursor-pointer py-1"
            >
              {logo.render()}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


