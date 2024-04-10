"use client"
import LoginComponent from "@/components/Login/login-component";
import { accountRoutes } from "@/core/api/apiRoutes";
import { useRouter } from "next/router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ManagerLoginPage() {
  const router = useRouter();
  function redirect(){
    router.push('/dashboard?role=manager')
}
    return (
        <>
        <ToastContainer/>
        <div className="flex h-screen relative w-full m-0 p-0 justify-center items-center flex-col bg-[#F6F8FB]">
        <LoginComponent url={accountRoutes.managerlogin} redirect={redirect}/>
      </div>
      </>
    );
}
