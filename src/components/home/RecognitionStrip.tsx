import Image from "next/image";

const registrations = [
  {
    id: "ksum",
    label: "Kerala Startup Mission",
    detail: "Registered startup",
    src: "/images/recognitions/ksum.png",
    width: 149,
    height: 115,
    imageClassName: "h-16 w-auto max-w-[150px]",
  },
  {
    id: "startup-india",
    label: "Startup India",
    detail: "DPIIT recognized",
    src: "/images/recognitions/startup-india.png",
    width: 300,
    height: 82,
    imageClassName: "h-12 w-auto max-w-[190px]",
  },
  {
    id: "msme",
    label: "Ministry of MSME",
    detail: "Udyam registered",
    src: "/images/recognitions/msme.png",
    width: 552,
    height: 108,
    imageClassName: "h-12 w-auto max-w-[210px]",
  },
  {
    id: "gem",
    label: "Government e-Marketplace",
    detail: "Registered seller",
    src: "/images/recognitions/gem.svg",
    width: 168,
    height: 63,
    imageClassName: "h-12 w-auto max-w-[170px]",
    darkLogo: true,
  },
] as const;

export default function RecognitionStrip() {
  return (
    <section
      aria-labelledby="registrations-heading"
      className="border-y border-default-200/70 bg-default-50/60 py-10 md:py-12"
    >
      <div className="container mx-auto max-w-7xl px-6 sm:px-12 public-layout-container">
        <div className="mx-auto mb-7 max-w-2xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-warning-600">
            Registrations &amp; recognition
          </p>
          <h2
            id="registrations-heading"
            className="text-2xl font-semibold text-foreground md:text-3xl"
          >
            Registered across India&apos;s business ecosystem
          </h2>
          <p className="mt-2 text-sm text-default-600">
            OBAOL is registered or recognized with the following government
            initiatives and platforms.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {registrations.map((registration) => (
            <article
              key={registration.id}
              aria-label={`${registration.label}: ${registration.detail}`}
              className="flex min-h-36 flex-col items-center justify-between rounded-2xl border border-default-200 bg-background p-5 text-center shadow-sm"
            >
              <div
                className={
                  "darkLogo" in registration && registration.darkLogo
                    ? "flex min-h-16 w-full items-center justify-center rounded-xl bg-[#24376b] px-3"
                    : "flex min-h-16 items-center justify-center"
                }
              >
                <Image
                  src={registration.src}
                  alt={`${registration.label} logo`}
                  width={registration.width}
                  height={registration.height}
                  className={`${registration.imageClassName} object-contain`}
                  unoptimized
                />
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-foreground">
                  {registration.label}
                </h3>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-default-500">
                  {registration.detail}
                </p>
              </div>
            </article>
          ))}

          <article
            aria-label="Directorate General of Foreign Trade: IEC registered"
            className="flex min-h-36 flex-col items-center justify-between rounded-2xl border border-default-200 bg-background p-5 text-center shadow-sm"
          >
            <div
              aria-hidden="true"
              className="flex min-h-16 items-center justify-center"
            >
              <div className="rounded-xl border border-warning-300 bg-warning-50 px-5 py-3 text-warning-800">
                <span className="block text-xl font-bold tracking-[0.18em]">IEC</span>
                <span className="block text-[10px] font-semibold uppercase tracking-wider">
                  Import Export Code
                </span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-foreground">
                Directorate General of Foreign Trade
              </h3>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-default-500">
                IEC registered
              </p>
            </div>
          </article>
        </div>

        <p className="mx-auto mt-5 max-w-3xl text-center text-xs leading-relaxed text-default-500">
          Logos identify the relevant registration or recognition only and do
          not imply sponsorship, partnership, or endorsement.
        </p>
      </div>
    </section>
  );
}

