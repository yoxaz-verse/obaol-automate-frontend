"use client";
import { useQuery } from "@tanstack/react-query";
import { getData } from "@/core/api/apiHandler";
import { OfferingShareDialog, ShareOfferingType } from "./OfferingShareDialog";

export function PublishedProfileShareAction({ endpoint, offeringType, fallbackTitle }: { endpoint: string; offeringType: ShareOfferingType; fallbackTitle: string }) {
  const query = useQuery({ queryKey: ["published-profile-share", endpoint], queryFn: async () => (await getData(endpoint)).data.data, retry: false });
  const row = query.data, published = row?.published;
  if (row?.status !== "PUBLISHED" || !row?._id || !published) return null;
  return <div className="mb-4 flex justify-end"><OfferingShareDialog offeringType={offeringType} offeringId={String(row._id)} title={published.displayName || fallbackTitle} description={published.summary || ""} /></div>;
}
