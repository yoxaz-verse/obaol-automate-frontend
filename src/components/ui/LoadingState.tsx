import type { ReactNode } from "react";
import { FiLoader } from "react-icons/fi";
import StateDisplay from "@/components/ui/StateDisplay";

export default function LoadingState({ title = "Loading", description, message = "Please wait while we load this information.", icon = <FiLoader className="motion-safe:animate-spin" size={24} />, className, compact }: { title?: string; description?: string; message?: string; icon?: ReactNode; className?: string; compact?: boolean }) {
  return <StateDisplay variant="loading" title={title} description={description ?? message} icon={icon} className={className} compact={compact} />;
}
