"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardBody, CardHeader, Select, SelectItem, Spinner, Chip } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import AuthContext from "@/context/AuthContext";
import { apiRoutes } from "@/core/api/apiRoutes";
import { getData } from "@/core/api/apiHandler";
import {
  FiUser, FiCalendar, FiActivity, FiClock,
  FiBriefcase, FiBox, FiMessageSquare, FiShoppingCart,
  FiFolder, FiFolderMinus, FiFolderPlus,
  FiCheckCircle, FiXCircle, FiInfo
} from "react-icons/fi";

const toId = (value: unknown) => String(value || "").trim();

const extractList = (response: any): any[] => {
  const payload = response?.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

const MetricCard = ({ title, value, icon: Icon, colorClass }: any) => (
  <Card className="bg-content1/40 backdrop-blur-md border border-default-200/20 hover:border-default-300/50 transition-all shadow-sm group">
    <CardBody className="p-5 flex flex-row items-center justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-widest text-default-400 font-bold mb-1 group-hover:text-default-500 transition-colors">{title}</p>
        <p className="text-3xl font-light text-foreground">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-default-100/50 border border-default-200/30 ${colorClass}`}>
        <Icon size={22} />
      </div>
    </CardBody>
  </Card>
);

export default function OperatorOverviewPage() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
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
      <div className="p-6 text-default-500 flex flex-col items-center justify-center min-h-[50vh]">
        <FiXCircle size={48} className="text-danger/50 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p>You do not have administrative privileges to view this page.</p>
      </div>
    );
  }

  if (operatorsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  const overviewData = overviewQuery.data?.data?.data || {};
  const operator = overviewData.operator || {};
  const summary = overviewData.companySummary || {};
  const enquirySummary = overviewData.enquirySummary || {};
  const companies = Array.isArray(overviewData.companies) ? overviewData.companies : [];
  const enquiries = Array.isArray(overviewData.enquiries) ? overviewData.enquiries : [];
  const handledProducts = Array.isArray(overviewData.handledProducts) ? overviewData.handledProducts : [];
  const joinedOn = operator?.joiningDate || operator?.createdAt;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent mb-2">
            Operator Overview
          </h1>
          <p className="text-sm sm:text-base text-default-500 max-w-2xl">
            Monitor assigned companies and evaluate performance metrics for each operator in the network.
          </p>
        </div>
        <div className="w-full md:w-80 relative z-10">
          <Select
            aria-label="Select Operator"
            label="Selected Operator"
            labelPlacement="outside"
            placeholder="Choose an operator"
            selectedKeys={selectedOperatorId ? [selectedOperatorId] : []}
            onSelectionChange={(keys: any) => setSelectedOperatorId(Array.from(keys)[0] as string)}
            classNames={{
              trigger: "bg-content1/60 backdrop-blur-md border border-default-200/40 hover:border-primary/50 transition-colors shadow-sm",
            }}
            startContent={<FiUser className="text-primary mr-1" />}
          >
            {operatorOptions.map((opt: any) => (
              <SelectItem key={opt.id} textValue={opt.name}>
                <div className="flex flex-col py-1">
                  <span className="text-sm font-medium">{opt.name}</span>
                  <span className="text-tiny text-default-400">ID: {opt.id.slice(-8)}</span>
                </div>
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      {overviewQuery.isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Spinner size="lg" color="primary" />
          <p className="text-default-500 text-sm animate-pulse">Loading operator metrics...</p>
        </div>
      ) : !selectedOperatorId ? (
        <div className="flex flex-col items-center justify-center py-20 text-default-500 bg-content1/20 border border-default-200/20 rounded-2xl border-dashed">
          <FiUser size={48} className="text-default-300 mb-4" />
          <p>Please select an operator to view their overview data.</p>
        </div>
      ) : (
        <>
          {/* Operator Profile Card */}
          <Card className="bg-content1/40 backdrop-blur-lg border border-default-200/20 shadow-lg mb-8 overflow-visible relative">
            {/* Glowing accent backdrop */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-50 rounded-2xl pointer-events-none"></div>
            
            <CardBody className="p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative z-10">
                <div className="flex gap-4 items-center border-b sm:border-b-0 sm:border-r border-default-200/20 pb-4 sm:pb-0 pr-0 sm:pr-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary shrink-0">
                    <FiUser size={26} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-widest text-default-400 font-bold mb-1">Operator</p>
                    <p className="text-base sm:text-lg font-semibold text-foreground leading-tight truncate">{operator?.name || "-"}</p>
                    <p className="text-xs text-default-500 mt-0.5 truncate">{operator?.email || "-"}</p>
                  </div>
                </div>

                <div className="flex gap-4 items-center border-b lg:border-b-0 lg:border-r border-default-200/20 pb-4 lg:pb-0 pr-0 lg:pr-4">
                  <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center border border-secondary/20 text-secondary shrink-0">
                    <FiCalendar size={26} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-widest text-default-400 font-bold mb-1">Joined On</p>
                    <p className="text-base sm:text-lg font-semibold text-foreground leading-tight truncate">{joinedOn ? dayjs(joinedOn).format("DD MMM YYYY") : "N/A"}</p>
                    <p className="text-xs text-default-500 mt-0.5 truncate">
                      {joinedOn ? `${dayjs().diff(dayjs(joinedOn), "day")} days on platform` : "No join data"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-center border-b sm:border-b-0 sm:border-r border-default-200/20 pb-4 sm:pb-0 pr-0 sm:pr-4">
                  <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center border border-success/20 text-success shrink-0">
                    <FiActivity size={26} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-widest text-default-400 font-bold mb-1">Status</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Chip size="sm" color={operator?.isActive ? "success" : "default"} variant="dot" className="border-none px-0">
                        <span className="text-base font-semibold text-foreground">{operator?.isActive ? "Active" : "Inactive"}</span>
                      </Chip>
                    </div>
                    <p className="text-xs text-default-500 mt-1 truncate">{operator?.registrationStatus || "N/A"}</p>
                  </div>
                </div>

                <div className="flex gap-4 items-center">
                  <div className="w-14 h-14 rounded-2xl bg-warning/10 flex items-center justify-center border border-warning/20 text-warning shrink-0">
                    <FiClock size={26} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-widest text-default-400 font-bold mb-1">Last Seen</p>
                    <p className="text-base sm:text-lg font-semibold text-foreground leading-tight truncate">
                      {operator?.lastSeenAt ? dayjs(operator.lastSeenAt).format("DD MMM YYYY") : "Not available"}
                    </p>
                    <p className="text-xs text-default-500 mt-0.5 truncate">
                      {operator?.lastSeenAt ? dayjs(operator.lastSeenAt).format("hh:mm A") : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Primary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <MetricCard title="Companies" value={summary.totalAssignedCompanies || 0} icon={FiBriefcase} colorClass="text-primary" />
            <MetricCard title="Products" value={summary.totalProducts || 0} icon={FiBox} colorClass="text-secondary" />
            <MetricCard title="Enquiries" value={summary.totalEnquiries || 0} icon={FiMessageSquare} colorClass="text-success" />
            <MetricCard title="Orders" value={summary.totalOrders || 0} icon={FiShoppingCart} colorClass="text-warning" />
          </div>

          {/* Enquiry Operations Metrics */}
          <div className="mb-8 mt-4">
            <div className="flex items-center gap-3 mb-5 px-1">
              <div className="h-px bg-default-200/50 flex-grow"></div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-default-400 shrink-0">Enquiry Pipeline Breakdown</h3>
              <div className="h-px bg-default-200/50 flex-grow"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
              <MetricCard title="Handled Total" value={enquirySummary.totalAssignedEnquiries || 0} icon={FiFolder} colorClass="text-primary" />
              <MetricCard title="With DC" value={enquirySummary.enquiriesWithDC || 0} icon={FiFolderMinus} colorClass="text-warning" />
              <MetricCard title="With Handler" value={enquirySummary.enquiriesWithHandler || 0} icon={FiFolderPlus} colorClass="text-secondary" />
              <MetricCard title="With Owner" value={enquirySummary.enquiriesWithSupplierPortfolioOwner || 0} icon={FiUser} colorClass="text-danger" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
               <MetricCard title="Open" value={enquirySummary.openEnquiries || 0} icon={FiActivity} colorClass="text-blue-500" />
               <MetricCard title="Closed" value={enquirySummary.closedEnquiries || 0} icon={FiCheckCircle} colorClass="text-success" />
               <MetricCard title="Cancelled" value={enquirySummary.cancelledEnquiries || 0} icon={FiXCircle} colorClass="text-default-400" />
            </div>
          </div>

          {/* Assigned Companies Table */}
          <Card className="bg-content1/40 backdrop-blur-lg border border-default-200/20 shadow-lg mb-8">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-5 border-b border-default-200/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <FiBriefcase size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground leading-none mb-1">Assigned Companies</h2>
                  <p className="text-xs text-default-500">Companies managed by this operator</p>
                </div>
              </div>
              <Chip size="md" variant="flat" color="primary" className="mt-4 sm:mt-0 px-2 border border-primary/20 bg-primary/10">{companies.length} Total</Chip>
            </CardHeader>
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-default-100/40 text-default-500 border-b border-default-200/20">
                    <tr>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Company</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-center">Products</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-center">Live Products</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-default-200/20">
                    {companies.map((company: any) => (
                      <tr
                        key={company._id}
                        className="group hover:bg-default-100/40 transition-colors cursor-pointer"
                        onClick={() => router.push(`/dashboard/companies?companyId=${company._id}&tab=enquiries`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-default-100 border border-default-200/50 flex items-center justify-center text-default-400 group-hover:text-primary transition-colors">
                              <FiBox size={16} />
                            </div>
                            <span className="font-medium text-foreground text-base">{company.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-default-600 text-center font-medium">{company.productCount || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Chip size="sm" variant="dot" color={company.liveProductCount > 0 ? "success" : "default"} className="border-none">
                            {company.liveProductCount || 0}
                          </Chip>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-xs font-bold text-primary group-hover:text-primary-400 transition-colors uppercase tracking-widest flex items-center justify-end gap-1">
                            Open <FiActivity size={12} className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-5px] group-hover:translate-x-0 transform" />
                          </span>
                        </td>
                      </tr>
                    ))}
                    {companies.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-16 text-center text-default-500">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-default-100 flex items-center justify-center mb-2">
                              <FiBriefcase size={28} className="text-default-300" />
                            </div>
                            <p className="text-base font-medium text-foreground">No companies found</p>
                            <p className="text-sm">There are no companies assigned to this operator.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>

          {/* Handled Enquiries Table */}
          <Card className="bg-content1/40 backdrop-blur-lg border border-default-200/20 shadow-lg mb-8">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-5 border-b border-default-200/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20">
                  <FiFolder size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground leading-none mb-1">Handled Enquiries</h2>
                  <p className="text-xs text-default-500">Latest enquiries assigned to this operator</p>
                </div>
              </div>
              <Chip size="md" variant="flat" color="secondary" className="mt-4 sm:mt-0 px-2 border border-secondary/20 bg-secondary/10">Showing {enquiries.length}</Chip>
            </CardHeader>
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-default-100/40 text-default-500 border-b border-default-200/20">
                    <tr>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">ID</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Company</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Status</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Portfolio Owner</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">DC</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Handler</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-default-200/20">
                    {enquiries.map((enquiry: any) => (
                      <tr key={enquiry.id} className="group hover:bg-default-100/40 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            type="button"
                            className="font-mono text-primary font-medium group-hover:text-primary-400 group-hover:underline transition-colors bg-primary/5 px-2 py-1 rounded"
                            onClick={() => router.push(`/dashboard/enquiries/${enquiry.id}`)}
                          >
                            {String(enquiry.id || "").slice(-8)}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-foreground font-medium">{enquiry?.company?.name || "N/A"}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Chip size="sm" variant="flat" color={enquiry?.status === 'OPEN' ? 'primary' : enquiry?.status === 'CLOSED' ? 'success' : 'default'} className="uppercase text-xs font-bold tracking-wider">
                            {enquiry?.status || "N/A"}
                          </Chip>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-default-500">{enquiry?.supplierPortfolioOwner?.name || "Unassigned"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-default-500">{enquiry?.enquiryDC?.name || "Unassigned"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-default-500">{enquiry?.handler?.name || "Unassigned"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-default-400 text-xs font-medium">
                          {enquiry?.createdAt ? dayjs(enquiry.createdAt).format("DD MMM YYYY, HH:mm") : "N/A"}
                        </td>
                      </tr>
                    ))}
                    {enquiries.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-16 text-center text-default-500">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-default-100 flex items-center justify-center mb-2">
                              <FiFolder size={28} className="text-default-300" />
                            </div>
                            <p className="text-base font-medium text-foreground">No handled enquiries</p>
                            <p className="text-sm">There are no handled enquiries found for this operator.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>

          {/* Handled Products Table */}
          <Card className="bg-content1/40 backdrop-blur-lg border border-default-200/20 shadow-lg">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-5 border-b border-default-200/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center text-warning border border-warning/20">
                  <FiBox size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground leading-none mb-1">Handled Products</h2>
                  <p className="text-xs text-default-500">Products with enquiries managed by this operator</p>
                </div>
              </div>
              <Chip size="md" variant="flat" color="warning" className="mt-4 sm:mt-0 px-2 border border-warning/20 bg-warning/10">{handledProducts.length} Total</Chip>
            </CardHeader>
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-default-100/40 text-default-500 border-b border-default-200/20">
                    <tr>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Product Name</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-center">Enquiries Handled</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Last Handled Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-default-200/20">
                    {handledProducts.map((row: any) => (
                      <tr key={row.productId} className="hover:bg-default-100/40 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-default-100 flex items-center justify-center text-default-400 border border-default-200/50">
                              <FiBox size={16} />
                            </div>
                            <span className="font-medium text-foreground text-base">{row.productName || "Unknown Product"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-default-600">
                          <Chip size="sm" variant="faded" className="border-default-200 font-bold">{row.enquiryCount || 0}</Chip>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-default-500 text-xs font-medium">
                          {row?.lastHandledAt ? dayjs(row.lastHandledAt).format("DD MMM YYYY, HH:mm") : "N/A"}
                        </td>
                      </tr>
                    ))}
                    {handledProducts.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-16 text-center text-default-500">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-default-100 flex items-center justify-center mb-2">
                              <FiBox size={28} className="text-default-300" />
                            </div>
                            <p className="text-base font-medium text-foreground">No handled products</p>
                            <p className="text-sm">There are no handled products found for this operator yet.</p>
                          </div>
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
