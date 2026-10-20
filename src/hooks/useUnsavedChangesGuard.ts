"use client";

import { useEffect } from "react";

export const useUnsavedChangesGuard = (dirty: boolean, message = "You have unsaved sidebar governance changes. Leave without saving?") => {
  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    const guardInternalLink = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.origin !== window.location.origin || anchor.href === window.location.href) return;
      if (window.confirm(message)) return;
      event.preventDefault();
      event.stopPropagation();
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", guardInternalLink, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", guardInternalLink, true);
    };
  }, [dirty, message]);
};
