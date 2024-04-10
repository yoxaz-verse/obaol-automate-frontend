"use client"
import LoginComponent from "@/components/Login/login-component";
import { accountRoutes } from "@/core/api/apiRoutes";
import { useRouter } from "next/navigation";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function WorkerLoginPage() {
  const router = useRouter();
  function redirect(){
    router.push('/dashboard?role=worker')
}
    return (
        <>
        <ToastContainer/>
        <div className="flex h-screen relative w-full m-0 p-0 justify-center items-center flex-col bg-[#F6F8FB]">
        <LoginComponent url={accountRoutes.workerlogin} redirect={redirect}/>
      </div>
      </>
    );
}
