import LoginComponent from "@/components/Login/login-component";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex h-screen relative w-full m-0 p-0 justify-center items-center flex-col bg-[#F6F8FB]">
        <Image src='/logo.png' alt='logo' height={100} width={100} className="mb-3"/>
      <LoginComponent/>
      <div className="pt-2 font-sm">Don't have an account yet?<span className='text-[#117DF9] pl-1'>Sign up</span></div>
    </div>
  );
}