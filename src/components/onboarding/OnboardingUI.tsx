"use client";

import React from "react";
import { Input } from "@nextui-org/react";
import { FiCheck, FiLink, FiLock } from "react-icons/fi";

export const LOGIN_EMAIL_HELP =
  "This email is linked to your account and cannot be changed during onboarding.";

export function LoginEmailIndicator() {
  return (
    <span className="onboarding-login-email-indicator" aria-label="Login email, locked">
      <FiLock aria-hidden />
      <span>Login email</span>
    </span>
  );
}

export function OnboardingProgress({
  currentStep,
  labels,
}: {
  currentStep: number;
  labels: string[];
}) {
  const progress = labels.length > 1 ? ((currentStep - 1) / (labels.length - 1)) * 100 : 100;

  return (
    <nav className="onboarding-progress" aria-label="Onboarding progress">
      <div className="onboarding-progress__summary">
        <span>Step {currentStep} of {labels.length}</span>
        <strong>{labels[currentStep - 1]}</strong>
      </div>
      <div className="onboarding-progress__track" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
      <ol className="onboarding-progress__steps">
        {labels.map((label, index) => {
          const step = index + 1;
          const complete = step < currentStep;
          const active = step === currentStep;
          return (
            <li key={label} className={active ? "is-active" : complete ? "is-complete" : ""} aria-current={active ? "step" : undefined}>
              <span className="onboarding-progress__number">{complete ? <FiCheck aria-hidden /> : step}</span>
              <span className="onboarding-progress__label">{label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function ReferralCodeField({
  value,
  onChange,
  label = "Referral code",
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  return (
    <section className="onboarding-referral" aria-labelledby="onboarding-referral-label">
      <div className="onboarding-referral__copy">
        <div className="onboarding-referral__heading">
          <FiLink aria-hidden />
          <span id="onboarding-referral-label">{label}</span>
          <span className="onboarding-optional-badge">Optional</span>
        </div>
        <p>Have a six-character operator code? Add it to link your profile for faster verification.</p>
      </div>
      <Input
        aria-label={`${label} (optional)`}
        type="text"
        inputMode="text"
        autoCapitalize="characters"
        autoComplete="off"
        placeholder="ABC123"
        variant="bordered"
        value={value}
        onValueChange={(next) => onChange(next.toUpperCase().replace(/\s/g, "").slice(0, 6))}
        maxLength={6}
        startContent={<FiLink aria-hidden className="text-default-400" />}
        className="onboarding-referral__field"
        classNames={{
          input: "text-base font-semibold uppercase tracking-[0.16em]",
          inputWrapper: "h-[50px] rounded-xl border-default-200 bg-white shadow-none dark:bg-content1",
        }}
      />
    </section>
  );
}
