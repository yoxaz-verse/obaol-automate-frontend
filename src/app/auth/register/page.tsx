import LoginComponent from "@/components/Login/login-component";
import React, { Suspense } from "react";
import BrandedLoader from "@/components/ui/BrandedLoader";

export default function RegisterPage() {
  return (
    <Suspense fallback={<BrandedLoader fullScreen message="Loading sign up" />}>
      <LoginComponent role="Associate" mode="signup" />
    </Suspense>
  );
}
