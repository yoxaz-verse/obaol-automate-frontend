"use client";
import AuthContext from "@/context/AuthContext";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";

export default function Home() {
  const router = useRouter();

  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    // Since AuthContext checks auth status on mount, we need to wait for it
    const checkAuthentication = () => {
      if (isAuthenticated) {
        router.push("/dashboard");
      } else {
        router.push("/auth");
      }
    };

    checkAuthentication();
  }, [isAuthenticated, router]);
  return (
    <div className="flex h-screen relative w-full m-0 p-0 justify-center items-center flex-col bg-black">
      <Image
        src={"/logo.png"}
        width={300}
        height={300}
        alt="Obaol"
        className="w-max rounded-md"
      />
    </div>
  );
}
