import LoginComponent from "@/components/Login/login-component";
import React, { Suspense } from "react";
import BrandedLoader from "@/components/ui/BrandedLoader";

export default function SuperadminLoginPage() {
  return (
    <>
      <Suspense fallback={<BrandedLoader fullScreen message="Loading sign in" />}>
        <LoginComponent role="Associate" mode="login" />
      </Suspense>
    </>
  );
}
