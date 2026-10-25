import { redirect } from "next/navigation";
export default async function LegacyStudioDetail({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; redirect(`/dashboard/documentation/${id}`); }
