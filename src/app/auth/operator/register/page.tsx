"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Input,
  Textarea,
  Checkbox,
} from "@nextui-org/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import AuthLayout from "@/components/Auth/AuthLayout";
import PhoneField from "@/components/form/PhoneField";
import { parsePhoneValue } from "@/utils/phone";
import { showToastMessage } from "@/utils/utils";
import { accountRoutes } from "@/core/api/apiRoutes";
import { getData, postData } from "@/core/api/apiHandler";

const EMPTY_LIST: any[] = [];

function OperatorRegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    phoneCountryCode: "+91",
    phoneNational: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
    address: "",
    state: "",
    district: "",
    languageKnown: [] as string[],
  });
  const searchParams = useSearchParams();
  const referralParam = String(searchParams?.get("ref") || "").trim();

  useEffect(() => {
    if (!referralParam) return;
    setForm((prev) => (prev.referralCode ? prev : { ...prev, referralCode: referralParam.toUpperCase() }));
  }, [referralParam]);

  const { data: optionsResponse, isLoading: optionsLoading } = useQuery({
    queryKey: ["operator-register-options"],
    queryFn: async () => {
      try {
        const response = await getData(accountRoutes.operatorRegisterOptions);
        return response.data?.data || {};
      } catch (error) {
        console.error("Failed to fetch operator registration options:", error);
        throw error;
      }
    },
    retry: 1,
  });

  const languages = Array.isArray(optionsResponse?.languages) ? optionsResponse.languages : EMPTY_LIST;
  const states = Array.isArray(optionsResponse?.states) ? optionsResponse.states : EMPTY_LIST;
  const districts = Array.isArray(optionsResponse?.districts) ? optionsResponse.districts : EMPTY_LIST;
  const filteredDistricts = useMemo(
    () => districts.filter((d: any) => String(d?.state) === String(form.state)),
    [districts, form.state]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setFormError("");
    if (!form.name || !form.email || !form.phone || !form.password) {
      const msg = "Please fill all required fields.";
      setFormError(msg);
      showToastMessage({ type: "error", message: msg, position: "top-right" });
      return;
    }
    if (form.password !== form.confirmPassword) {
      const msg = "Passwords do not match.";
      setFormError(msg);
      showToastMessage({ type: "error", message: msg, position: "top-right" });
      return;
    }
    if (!form.state || !form.district) {
      const msg = "Please complete all required selections.";
      setFormError(msg);
      showToastMessage({ type: "error", message: msg, position: "top-right" });
      return;
    }

    setIsLoading(true);
    try {
      const phoneParsed = parsePhoneValue({
        raw: form.phone,
        countryCode: form.phoneCountryCode,
        national: form.phoneNational,
      });

      const payload = {
        name: form.name,
        email: form.email,
        phone: phoneParsed.e164 || form.phone,
        phoneCountryCode: phoneParsed.countryCode || form.phoneCountryCode,
        phoneNational: phoneParsed.national || form.phoneNational,
        password: form.password,
        referralCode: form.referralCode ? form.referralCode.trim() : undefined,
        address: form.address,
        state: form.state,
        district: form.district,
        languageKnown: form.languageKnown,
        workingHours: [],
      };

      await postData(accountRoutes.operatorRegister, payload);
      showToastMessage({
        type: "success",
        message: "Registration submitted for approval.",
        position: "top-right",
      });
      router.push("/auth/operator/register/success");
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Registration failed. Please try again.";
      setFormError(errorMessage);
      showToastMessage({ type: "error", message: errorMessage, position: "top-right" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Operator Registration"
      subtitle="Operational onboarding"
      cardMaxWidthClass="max-w-[760px]"
      leftPanel={{
        headline: "OBAOL",
        highlight: "OPERATOR ONBOARDING",
        description: "Register your operator profile for verification and access.",
        points: [
          "Submit full profile details for internal review.",
          "Approval required before dashboard access.",
          "You will receive updates on your email/phone.",
        ],
        footer: "Operator_Onboarding",
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="rounded-lg border border-danger-400/40 bg-danger-500/10 px-4 py-2 text-sm text-danger-500">
            {formError}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input label="Full Name" value={form.name} onValueChange={(v) => setForm({ ...form, name: v })} isRequired />
          <Input label="Email" type="email" value={form.email} onValueChange={(v) => setForm({ ...form, email: v })} isRequired />
          <PhoneField
            name="phone"
            label="Phone"
            value={form.phone}
            countryCodeValue={form.phoneCountryCode}
            nationalValue={form.phoneNational}
            onChange={(next) =>
              setForm({
                ...form,
                phone: next.e164,
                phoneCountryCode: next.countryCode,
                phoneNational: next.national,
              })
            }
          />
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onValueChange={(v) => setForm({ ...form, password: v })}
            isRequired
            endContent={
              <Button size="sm" variant="light" onPress={() => setShowPassword((prev) => !prev)}>
                {showPassword ? "Hide" : "Show"}
              </Button>
            }
          />
          <Input
            label="Confirm Password"
            type={showPassword ? "text" : "password"}
            value={form.confirmPassword}
            onValueChange={(v) => setForm({ ...form, confirmPassword: v })}
            isRequired
          />
          <Input
            label="Referral Code (optional)"
            value={form.referralCode}
            onValueChange={(v) => setForm({ ...form, referralCode: v.toUpperCase() })}
          />
        </div>

        <Textarea
          label="Address"
          value={form.address}
          onValueChange={(v) => setForm({ ...form, address: v })}
          isRequired
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Autocomplete
            label="State"
            selectedKey={form.state || null}
            onSelectionChange={(key) =>
              setForm({ ...form, state: String(key || ""), district: "" })
            }
            isRequired
            isLoading={optionsLoading}
            defaultItems={states}
          >
            {(item: any) => (
              <AutocompleteItem key={item._id} textValue={item.name}>
                {item.name}
              </AutocompleteItem>
            )}
          </Autocomplete>
          <Autocomplete
            label="District"
            selectedKey={form.district || null}
            onSelectionChange={(key) =>
              setForm({ ...form, district: String(key || "") })
            }
            isRequired
            isLoading={optionsLoading}
            isDisabled={!form.state}
            defaultItems={filteredDistricts}
          >
            {(item: any) => (
              <AutocompleteItem key={item._id} textValue={item.name}>
                {item.name}
              </AutocompleteItem>
            )}
          </Autocomplete>
        </div>

        <div className="rounded-xl border border-default-200/70 p-3">
          <div className="text-xs font-semibold text-default-500 mb-2">Languages Known</div>
          <div className="flex flex-wrap gap-2">
            {languages.map((lang: any) => {
              const selected = form.languageKnown.includes(lang._id);
              return (
                <Checkbox
                  key={lang._id}
                  isSelected={selected}
                  onValueChange={(checked) => {
                    setForm((prev) => ({
                      ...prev,
                      languageKnown: checked
                        ? [...prev.languageKnown, lang._id]
                        : prev.languageKnown.filter((id) => id !== lang._id),
                    }));
                  }}
                >
                  {lang.name}
                </Checkbox>
              );
            })}
          </div>
        </div>

        <Button type="submit" color="warning" className="w-full font-semibold" isLoading={isLoading} isDisabled={isLoading}>
          Submit for Approval
        </Button>
        {isLoading && (
          <div className="text-xs text-default-500 text-center">
            Submitting your registration. Please wait...
          </div>
        )}
      </form>
    </AuthLayout>
  );
}

export default function OperatorRegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <OperatorRegisterForm />
    </Suspense>
  );
}
