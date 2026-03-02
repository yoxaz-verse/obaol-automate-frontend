"use client";

import { Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/Auth/AuthLayout";

export default function RegisterSuccessPage() {
  const router = useRouter();

  return (
    <AuthLayout
      title="Registration Submitted"
      subtitle="Verification in progress"
      cardMaxWidthClass="max-w-[620px]"
      leftPanel={{
        headline: "Thank you for joining",
        highlight: "OBAOL ASSOCIATE",
        description:
          "Your profile is now under manual review so we can keep the network verified and trusted.",
        points: [
          "Our team will review your details and reach out to you.",
          "Expected response time is usually within 1-2 working days.",
          "Once approved, you can sign in and access the main panel.",
        ],
        footer: "Verification_Queue",
      }}
    >
      <div className="rounded-2xl border border-success-300/60 dark:border-success-400/40 bg-success-50/90 dark:bg-success-900/25 p-5 text-center">
        <h2 className="text-xl font-semibold text-success-800 dark:text-success-100">
          Your registration is successfully submitted.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-success-700 dark:text-success-100/90">
          Our team will contact you within <strong>1-2 working days</strong> after verification.
          You will receive updates on your registered email/phone.
        </p>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Button
          className="w-full"
          variant="flat"
          onPress={() => router.push("/")}
        >
          Go to Home
        </Button>
        <Button
          className="w-full font-semibold"
          color="warning"
          onPress={() => router.push("/auth/login?role=Associate")}
        >
          Go to Sign In
        </Button>
      </div>
    </AuthLayout>
  );
}
