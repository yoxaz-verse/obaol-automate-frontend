import { Button } from "@nextui-org/react";
import type { RateRow } from "./domain";

interface Props {
  rate: RateRow;
  gated: boolean;
  compact?: boolean;
  revealedPrice?: number;
  revealing: boolean;
  reveal: (id: string) => void;
  format: (value: number | undefined) => string;
}
export const MarketplacePrice = ({ rate, gated, compact = false, revealedPrice, revealing, reveal, format }: Props) => {
  const id = String(rate._id || "");
  const raw = typeof rate.rawBasePrice === "number" ? rate.rawBasePrice : Number(rate.rawBasePrice);
  const price = gated ? revealedPrice : raw;
  if (gated && price === undefined) return <Button size="sm" color="warning" variant="flat" className="font-bold" isLoading={revealing} onPress={() => reveal(id)}>Reveal Rate</Button>;
  return <div className={compact ? "text-sm font-bold text-obaol-500" : "text-base font-black text-obaol-500 drop-shadow-md sm:text-xl"}>{format(price)}</div>;
};
