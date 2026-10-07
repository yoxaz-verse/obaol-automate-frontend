const logos = [
  {
    mark: "KSUM",
    label: "Kerala Startup Mission",
  },
  {
    mark: "STARTUP INDIA",
    label: "Startup India",
  },
  {
    mark: "MSME",
    label: "Ministry of MSME",
  },
  {
    mark: "GeM",
    label: "Government e-Marketplace",
  },
  {
    mark: "IEC",
    label: "Import Export Code",
  },
] as const;

export default function RecognitionStrip() {
  return (
    <section
      aria-label="OBAOL recognitions and registrations"
      className="border-y border-default-200/50 bg-default-50/40 py-8 md:py-10"
    >
      <div className="container mx-auto max-w-6xl xl:max-w-7xl px-6 sm:px-12 public-layout-container">
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-7 sm:justify-between md:gap-x-14 lg:gap-x-20">
          {logos.map((logo) => (
            <div
              key={logo.mark}
              aria-label={logo.label}
              title={logo.label}
              className="select-none text-center opacity-35 grayscale transition duration-300 hover:opacity-55 dark:opacity-40 dark:hover:opacity-60"
            >
              <span className="block whitespace-nowrap text-lg font-black tracking-tight text-foreground md:text-xl lg:text-2xl">
                {logo.mark}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
