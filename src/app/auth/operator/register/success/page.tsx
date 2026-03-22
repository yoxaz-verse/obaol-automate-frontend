"use client";

import { Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/Auth/AuthLayout";
import { motion } from "framer-motion";
import { FiCheckCircle, FiHome, FiLogIn } from "react-icons/fi";

export default function OperatorRegisterSuccessPage() {
  const router = useRouter();

  return (
    <AuthLayout
      title="Application Received"
      subtitle="Operator Onboarding"
      cardMaxWidthClass="max-w-[560px]"
      leftPanel={{
        headline: "Verification",
        highlight: "IN PROGRESS",
        description: "Your operator profile is being verified by our compliance team for network integrity.",
        points: [
          "Manual review of professional background",
          "Verification of location and contact details",
          "Account activation within 24-48 hours",
        ],
        footer: "OPERATOR_V3_SECURE",
      }}
    >
      <div className="flex flex-col items-center text-center py-4">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-20 h-20 rounded-full bg-success-500/10 flex items-center justify-center mb-6 border border-success-500/20 shadow-lg shadow-success-500/10"
        >
          <FiCheckCircle className="text-4xl text-success-500" />
        </motion.div>

        <h2 className="text-2xl font-black text-foreground mb-4">
          Successfully Submitted
        </h2>

        <div className="p-6 rounded-[2.5rem] bg-content2/40 border border-default-200 relative overflow-hidden group mb-8">
          <p className="text-sm leading-relaxed text-foreground/70 font-medium">
            Our team will review your application and contact you within <span className="text-warning-500 font-bold">1-2 working days</span>. You will receive an update via email and SMS once your access is approved.
          </p>
        </div>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button
            className="h-12 rounded-xl font-bold border-default-200"
            variant="bordered"
            onPress={() => router.push("/")}
            startContent={<FiHome />}
          >
            Home
          </Button>
          <Button
            className="h-12 rounded-xl font-bold border-warning-500/20 bg-warning-500/10 text-warning-500 shadow-lg shadow-warning-500/10"
            variant="flat"
            onPress={() => router.push("/auth/operator")}
            startContent={<FiLogIn />}
          >
            Sign In
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
