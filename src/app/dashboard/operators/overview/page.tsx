"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardBody, CardHeader, Select, SelectItem, Spinner, Button } from "@nextui-org/react";
import AuthContext from "@/context/AuthContext";
import { apiRoutes } from "@/core/api/apiRoutes";
import { getData } from "@/core/api/apiHandler";
import Link from "next/link";

const toId = (value: unknown) => String(value || "").trim();

const extractList = (response: any): any[] => {
  const payload = response?.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

export default function OperatorOverviewPage() {
  const { user } = useContext(AuthContext);
  const roleLower = String(user?.role || "").trim().toLowerCase();
  const isAdmin = roleLower === "admin";

  const [selectedOperatorId, setSelectedOperatorId] = useState("");

  const operatorsQuery = useQuery({
    queryKey: ["operator-overview", "operators"],
    queryFn: async () => getData(apiRoutes.operator.getAll, { page: 1, limit: 5000 }),
    enabled: isAdmin,
    refetchOnWindowFocus: false,
  });

  const operatorOptions = useMemo(() => {
    const rows = extractList(operatorsQuery.data);
    return rows
      .map((row: any) => ({ id: toId(row?._id || row?.id), name: String(row?.name || "").trim() }))
      .filter((row: any) => Boolean(row.id));
  }, [operatorsQuery.data]);

  useEffect(() => {
    if (!isAdmin) return;
    if (operatorOptions.length === 0) {
      setSelectedOperatorId("");
      return;
    }
    if (selectedOperatorId && operatorOptions.some((opt: any) => opt.id === selectedOperatorId)) return;
    setSelectedOperatorId(operatorOptions[0].id);
  }, [operatorOptions, selectedOperatorId, isAdmin]);

  const overviewQuery = useQuery({
    queryKey: ["operator-overview", selectedOperatorId],
    queryFn: async () => getData(apiRoutes.operatorHierarchy.overview(selectedOperatorId)),
    enabled: isAdmin && Boolean(selectedOperatorId),
    refetchOnWindowFocus: false,
  });

  if (!isAdmin) {
    return (
      <div className="p-6 text-default-500">
        You do not have access to this page.
      </div>
    );
  }

  if (operatorsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  const overviewData = overviewQuery.data?.data?.data || {};
  const summary = overviewData.companySummary || {};
  const companies = Array.isArray(overviewData.companies) ? overviewData.companies : [];

  return (
    <div className="w-full p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Operator Overview</h1>
          <p className="text-sm text-default-500">Monitor assigned companies and performance for each operator.</p>
        </div>
        <div className="w-full md:w-64">
          <Select
            label="Select Operator"
            selectedKeys={selectedOperatorId ? [selectedOperatorId] : []}
            onSelectionChange={(keys: any) => setSelectedOperatorId(Array.from(keys)[0] as string)}
          >
            {operatorOptions.map((opt: any) => (
              <SelectItem key={opt.id}>{opt.name}</SelectItem>
            ))}
          </Select>
        </div>
      </div>

      {overviewQuery.isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Spinner />
        </div>
      ) : !selectedOperatorId ? (
        <div className="text-sm text-default-500">Select an operator to view overview data.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-content1 border border-default-200/60">
              <CardBody className="p-4">
                <p className="text-xs uppercase text-default-400 font-bold">Companies</p>
                <p className="text-2xl font-semibold text-foreground">{summary.totalAssignedCompanies || 0}</p>
              </CardBody>
            </Card>
            <Card className="bg-content1 border border-default-200/60">
              <CardBody className="p-4">
                <p className="text-xs uppercase text-default-400 font-bold">Products</p>
                <p className="text-2xl font-semibold text-foreground">{summary.totalProducts || 0}</p>
              </CardBody>
            </Card>
            <Card className="bg-content1 border border-default-200/60">
              <CardBody className="p-4">
                <p className="text-xs uppercase text-default-400 font-bold">Enquiries</p>
                <p className="text-2xl font-semibold text-foreground">{summary.totalEnquiries || 0}</p>
              </CardBody>
            </Card>
            <Card className="bg-content1 border border-default-200/60">
              <CardBody className="p-4">
                <p className="text-xs uppercase text-default-400 font-bold">Orders</p>
                <p className="text-2xl font-semibold text-foreground">{summary.totalOrders || 0}</p>
              </CardBody>
            </Card>
          </div>

          <Card className="bg-content1 border border-default-200/60">
            <CardHeader className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Assigned Companies</h2>
              <span className="text-xs text-default-400">Total: {companies.length}</span>
            </CardHeader>
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-default-100/60 text-default-500">
                    <tr>
                      <th className="px-4 py-3 text-left">Company</th>
                      <th className="px-4 py-3 text-left">Products</th>
                      <th className="px-4 py-3 text-left">Live Products</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map((company: any) => (
                      <tr key={company._id} className="border-t border-default-200/60">
                        <td className="px-4 py-3 text-foreground font-medium">{company.name}</td>
                        <td className="px-4 py-3 text-default-600">{company.productCount || 0}</td>
                        <td className="px-4 py-3 text-default-600">{company.liveProductCount || 0}</td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            as={Link}
                            size="sm"
                            color="warning"
                            variant="flat"
                            href={`/dashboard/companyProduct?companyId=${company._id}`}
                          >
                            View Company
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {companies.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-default-500">
                          No companies assigned to this operator.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
