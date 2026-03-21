type IndiaFirstNoteProps = {
  className?: string;
};

export default function IndiaFirstNote({ className = "" }: IndiaFirstNoteProps) {
  return (
    <div
      className={`rounded-2xl border border-default-200 bg-content1/70 p-4 md:p-5 text-sm text-default-600 ${className}`}
    >
      <span className="font-semibold text-foreground">India-first execution.</span>{" "}
      OBAOL’s procurement, warehousing, packaging, and logistics workflows begin in India, with
      global expansion across the GCC, Europe, and the United States.
    </div>
  );
}
