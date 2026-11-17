"use client";
import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import AuthContext from "@/context/AuthContext";
import { getData } from "@/core/api/apiHandler";
import type { CompanyProfileSource } from "@/types/companyProfileSource";
export function useCompanyProfileSource(companyId?:string){const {user}=useContext(AuthContext);const own=String(user?.associateCompanyId||"");const target=companyId||own;return useQuery({queryKey:["company-profile-source",target],queryFn:async()=>(await getData("/company-profile-source",target?{companyId:target}:undefined)).data.data as CompanyProfileSource,enabled:Boolean(target)||String(user?.role).toLowerCase()==="admin",staleTime:30000,retry:false})}
