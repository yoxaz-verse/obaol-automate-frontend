"use client";

import { Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/Auth/AuthLayout";

export default function OperatorRegisterSuccessPage() {
  const router = useRouter();

  return (
    <AuthLayout
      title="Registration Submitted"
      subtitle="Operator verification in progress"
      cardMaxWidthClass="max-w-[620px]"
      leftPanel={{
        headline: "Thank you for joining",
        highlight: "OBAOL OPERATIONS",
        description:
          "Your operator profile is under review to keep the network secure and verified.",
        points: [
          "Our admin team will review your details.",
          "Expected response time is within 1-2 working days.",
          "You will receive updates on your email/phone.",
        ],
        footer: "Operator_Verification",
      }}
    >
      <div className="rounded-2xl border border-success-300/60 dark:border-success-300/30 bg-success-50/90 dark:bg-success-950/40 p-5 text-center">
        <h2 className="text-xl font-semibold text-success-800 dark:text-success-100">
          Your registration was submitted successfully.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-success-700 dark:text-success-100/90">
          Our admin team will contact you within <strong>1-2 working days</strong> after verification.
        </p>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Button
          className="w-full border-default-200/60 dark:border-default-100/20 dark:text-default-100"
          variant="bordered"
          onPress={() => router.push("/")}
        >
          Go to Home
        </Button>
        <Button className="w-full font-semibold" color="warning" onPress={() => router.push("/auth/operator")}>
          Go to Sign In
        </Button>
      </div>
    </AuthLayout>
  );
}
