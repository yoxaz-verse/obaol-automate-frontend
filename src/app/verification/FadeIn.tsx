import { ReactNode } from "react";

export default function FadeIn({ children }: { children: ReactNode }) {
  return (
    <div className="animate-in fade-in duration-700 motion-reduce:animate-none">
      {children}
    </div>
  );
}
