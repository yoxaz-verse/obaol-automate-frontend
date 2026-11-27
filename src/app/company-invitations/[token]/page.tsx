"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Card, CardBody, Input, Spinner } from "@nextui-org/react";
import { getData, postData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";

export default function CompanyInvitationPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = String(params?.token || "");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const invitation = useQuery({ queryKey: ["company-invitation", token], queryFn: async () => (await getData(apiRoutes.companyGovernance.inspectInvite(token))).data.data, retry: false });
  const accept = useMutation({ mutationFn: () => postData(apiRoutes.companyGovernance.acceptInvite(token), { name, phone, password }), onSuccess: () => router.push("/auth?view=signin&invitation=accepted") });
  return <main className="grid min-h-screen place-items-center bg-default-50 p-5"><Card className="w-full max-w-lg"><CardBody className="p-7 md:p-10">
    {invitation.isLoading ? <div className="grid min-h-48 place-items-center"><Spinner /></div> : invitation.isError ? <div><h1 className="text-2xl font-black">Invitation unavailable</h1><p className="mt-3 text-default-500">This invitation is invalid, cancelled, or expired.</p></div> : <>
      <p className="text-sm font-bold uppercase tracking-wider text-warning">Company invitation</p><h1 className="mt-2 text-3xl font-black">Join {invitation.data?.company?.name}</h1><p className="mt-2 text-default-500">You were invited as {String(invitation.data?.intendedRole || "staff").toLowerCase()} using {invitation.data?.email}.</p>
      <div className="mt-7 space-y-4"><Input label="Full name" value={name} onValueChange={setName} /><Input label="Phone" value={phone} onValueChange={setPhone} /><Input type="password" label="Create password" description="Use at least 8 characters." value={password} onValueChange={setPassword} />
      {accept.isError ? <p role="alert" className="text-sm text-danger">{(accept.error as any)?.response?.data?.message || "Could not accept this invitation."}</p> : null}
      <Button className="w-full" color="warning" size="lg" isLoading={accept.isPending} isDisabled={!name.trim() || !phone.trim() || password.length < 8} onPress={() => accept.mutate()}>Accept invitation</Button></div>
    </>}
  </CardBody></Card></main>;
}
