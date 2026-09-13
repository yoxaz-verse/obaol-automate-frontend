import AuthEntry from "@/components/Auth/AuthEntry";
import React from "react";

export default function AuthEntryPage({
  searchParams,
}: {
  searchParams?: { view?: string; prefill?: string };
}) {
  return <AuthEntry signInView={searchParams?.view === "signin"} prefill={searchParams?.prefill} />;
}
