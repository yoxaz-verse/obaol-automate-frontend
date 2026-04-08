import LoginComponent from "@/components/Login/login-component";
import React, { Suspense } from "react";
import "react-toastify/dist/ReactToastify.css";
import BrandedLoader from "@/components/ui/BrandedLoader";

export default function OperatorLoginPage() {
  return (
    <>
      <div className="flex h-screen relative w-full m-0 p-0 justify-center items-center flex-col ">
        <Suspense fallback={<BrandedLoader fullScreen message="Loading sign in" />}>
          <LoginComponent role="Operator" mode="login" />
        </Suspense>
      </div>
    </>
  );
}
