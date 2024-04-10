"use client"
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  useEffect(()=>{
     router.push('/superadmin/login')
  })
  return (
    <div className="flex h-screen relative w-full m-0 p-0 justify-center items-center flex-col bg-[#F6F8FB]">
    </div>
  );
}