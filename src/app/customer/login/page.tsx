"use client"
import LoginComponent from "@/components/Login/login-component";
import { accountRoutes } from "@/core/api/apiRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
export default function CustomerLoginPage() {
  const router = useRouter();
  function redirect(){
    router.push('/dashboard?role=customer')
}
    return (
        <>
        <ToastContainer/>
        <div className="flex h-screen relative w-full m-0 p-0 justify-center items-center flex-col bg-[#F6F8FB]">
        <LoginComponent url={accountRoutes.customerlogin} redirect={redirect}/>
      </div>
      </>
    );
}
