"use client"
import TopBar from "@/components/dashboard/TopBar";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import "react-toastify/dist/ReactToastify.css";

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const search = searchParams.get('role')
    return (
        <>
        <TopBar username={search?search:'user'}/>
      </>
    );
}
