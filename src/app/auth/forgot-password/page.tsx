import ForgotPasswordComponent from "@/components/Login/forgot-password";
import Image from "next/image";

type PageProps = { searchParams?: { role?: string | string[] } };

export default function ForgotPasswordPage({ searchParams }: PageProps) {
    const roleValue = searchParams?.role;
    const role = (Array.isArray(roleValue) ? roleValue[0] : roleValue) || "Customer";

    return (
        <div className="relative flex min-h-screen min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-background p-0 m-0">
            {/* Background elements for "amazing" UI */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="z-10 w-full flex flex-col items-center">
                <Image
                    src={"/logo.png"}
                    width={150}
                    height={150}
                    alt="Obaol"
                    className="mb-8 opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                />
                <ForgotPasswordComponent role={role} />
            </div>
        </div>
    );
}
