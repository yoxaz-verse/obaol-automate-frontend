import Image from "next/image";

const logos = [
  {
    id: "ksum",
    label: "Kerala Startup Mission",
    src: "/images/recognitions/ksum.png",
    width: 200,
    height: 60,
  },
  {
    id: "startup-india",
    label: "Startup India",
    src: "/images/recognitions/startup-india.png",
    width: 200,
    height: 60,
  },
  {
    id: "msme",
    label: "Ministry of MSME",
    src: "/images/recognitions/msme.png",
    width: 200,
    height: 60,
  },
  {
    id: "gem",
    label: "Government e-Marketplace",
    src: "/images/recognitions/gem.svg",
    width: 180,
    height: 50,
  },
  {
    id: "iec",
    label: "Import Export Code - DGFT India",
    src: "/images/recognitions/iec.png",
    width: 180,
    height: 60,
  },
] as const;

export default function RecognitionStrip() {
  return (
    <section
      aria-label="OBAOL recognitions and registrations"
      className="border-y border-default-200/50 bg-default-50/40 py-6 md:py-8"
    >
      <div className="container mx-auto max-w-6xl xl:max-w-7xl px-6 sm:px-12 public-layout-container">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6 sm:justify-between md:gap-x-10 lg:gap-x-12">
          {logos.map((logo) => (
            <div
              key={logo.id}
              aria-label={logo.label}
              title={logo.label}
              className="select-none flex items-center justify-center grayscale opacity-70 transition duration-300 hover:grayscale-0 hover:opacity-100 hover:scale-105 transform cursor-pointer py-1 dark:brightness-125 dark:invert-[0.1]"
            >
              <Image
                src={logo.src}
                alt={logo.label}
                width={logo.width}
                height={logo.height}
                className="h-9 md:h-12 w-auto object-contain max-w-[180px]"
                unoptimized
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}



