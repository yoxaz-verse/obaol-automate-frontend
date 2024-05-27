"use client"
import TopBar from "@/components/dashboard/TopBar";
import DashboardTile from "@/components/dashboard/dashboard-tile";
import DashboardTilesComponent from "@/components/dashboard/dashboard-tiles-component";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import "react-toastify/dist/ReactToastify.css";

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const search = searchParams.get('role')
  return (
    <>

    </>
  );
}
