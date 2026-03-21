type IndiaFirstNoteProps = {
  className?: string;
};

export default function IndiaFirstNote({ className = "" }: IndiaFirstNoteProps) {
  return (
    <div
      className={`rounded-2xl border border-default-200 bg-content1/70 p-4 md:p-5 text-sm text-default-600 ${className}`}
    >
      <span className="font-semibold text-foreground">India-first execution.</span>{" "}
      Operations are currently India-based. We support exports from India to global markets.
    </div>
  );
}
