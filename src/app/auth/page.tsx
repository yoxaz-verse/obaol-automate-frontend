import AuthEntry from "@/components/Auth/AuthEntry";
import React, { Suspense } from "react";
import BrandedLoader from "@/components/ui/BrandedLoader";

export default function AuthEntryPage() {
  return (
    <>
      <Suspense fallback={<BrandedLoader fullScreen message="Loading account options" />}>
        <AuthEntry />
      </Suspense>
    </>
  );
}
