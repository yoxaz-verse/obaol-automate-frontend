import type { ReactNode } from "react";
import StateDisplay from "@/components/ui/StateDisplay";

export default function ErrorState({ title = "We could not load this information", description, message = "Check your connection and try again.", icon, action, onRetry, className, compact }: { title?: string; description?: string; message?: string; icon?: ReactNode; action?: ReactNode; onRetry?: () => void; className?: string; compact?: boolean }) {
  return <StateDisplay variant="error" title={title} description={description ?? message} icon={icon} action={action} onRetry={onRetry} className={className} compact={compact} />;
}
