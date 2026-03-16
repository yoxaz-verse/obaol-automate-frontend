"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Input,
  Select,
  SelectItem,
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
import axios from "axios";

const EMPTY_LIST: any[] = [];

export default function OperatorRegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    joiningDate: "",
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
      const apiRoot = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1/web";
      const base = String(apiRoot).replace(/\/+$/, "");
      const res = await axios.get(`${base}${accountRoutes.operatorRegisterOptions}`, { timeout: 12000 });
      return res.data?.data || {};
    },
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
    if (!form.name || !form.email || !form.phone || !form.password) {
      showToastMessage({ type: "error", message: "Please fill all required fields.", position: "top-right" });
      return;
    }
    if (form.password !== form.confirmPassword) {
      showToastMessage({ type: "error", message: "Passwords do not match.", position: "top-right" });
      return;
    }
    if (!form.state || !form.district || !form.joiningDate) {
      showToastMessage({ type: "error", message: "Please complete all required selections.", position: "top-right" });
      return;
    }

    setIsLoading(true);
    try {
      const phoneParsed = parsePhoneValue({
        value: form.phone,
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
        joiningDate: form.joiningDate,
        workingHours: [],
      };

      const apiRoot = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1/web";
      const base = String(apiRoot).replace(/\/+$/, "");
      await axios.post(`${base}${accountRoutes.operatorRegister}`, payload, { timeout: 15000 });
      router.push("/auth/operator/register/success");
    } catch (error: any) {
      showToastMessage({
        type: "error",
        message: error?.response?.data?.message || "Registration failed. Please try again.",
        position: "top-right",
      });
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input label="Full Name" value={form.name} onValueChange={(v) => setForm({ ...form, name: v })} isRequired />
          <Input label="Email" type="email" value={form.email} onValueChange={(v) => setForm({ ...form, email: v })} isRequired />
          <PhoneField
            label="Phone"
            value={form.phone}
            countryCode={form.phoneCountryCode}
            national={form.phoneNational}
            onChange={(value, meta) =>
              setForm({
                ...form,
                phone: value,
                phoneCountryCode: meta?.countryCode || form.phoneCountryCode,
                phoneNational: meta?.national || form.phoneNational,
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
          <Input label="Joining Date" type="date" value={form.joiningDate} onValueChange={(v) => setForm({ ...form, joiningDate: v })} isRequired />
        </div>

        <Textarea
          label="Address"
          value={form.address}
          onValueChange={(v) => setForm({ ...form, address: v })}
          isRequired
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Select
            label="State"
            selectedKeys={form.state ? [form.state] : []}
            onSelectionChange={(keys) => setForm({ ...form, state: String(Array.from(keys)[0] || ""), district: "" })}
            isRequired
            isLoading={optionsLoading}
          >
            {states.map((item: any) => (
              <SelectItem key={item._id} value={item._id}>{item.name}</SelectItem>
            ))}
          </Select>
          <Select
            label="District"
            selectedKeys={form.district ? [form.district] : []}
            onSelectionChange={(keys) => setForm({ ...form, district: String(Array.from(keys)[0] || "") })}
            isRequired
            isLoading={optionsLoading}
            isDisabled={!form.state}
          >
            {filteredDistricts.map((item: any) => (
              <SelectItem key={item._id} value={item._id}>{item.name}</SelectItem>
            ))}
          </Select>
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

        <Button type="submit" color="warning" className="w-full font-semibold" isLoading={isLoading}>
          Submit for Approval
        </Button>
      </form>
    </AuthLayout>
  );
}
