"use client";
import React, { useEffect, useState } from "react";
import QueryComponent from "@/components/queryComponent";
import AddModal from "@/components/CurdTable/add-model";
import CommonTable from "../../CurdTable/common-table";
import { Spacer } from "@nextui-org/react";
import DeleteModal from "@/components/CurdTable/delete";
import DetailsModal from "@/components/CurdTable/details";
import EditModal from "@/components/CurdTable/edit-model";
import EmptyState from "@/components/ui/EmptyState";
import { FiUsers, FiMail, FiBriefcase, FiClock } from "react-icons/fi";
import { DashboardStatusBadge } from "@/components/dashboard/DashboardUI";
import {
  apiRoutesByRole,
  generateColumns,
  initialTableConfig,
} from "@/utils/tableValues";
import DynamicFilter from "@/components/CurdTable/dynamic-filtering";
import TableFrame from "@/components/CurdTable/table-frame";
import { getPresenceStatus } from "@/utils/presence";
import UsersExportButton from "./users-export-button";

interface UserTabContentProps {
  currentTable: string;
  lockedFilters?: Record<string, string | number | boolean>;
  showAdd?: boolean;
  showDelete?: boolean;
}

const EMPTY_STATE_COPY: Record<string, { label: string; title: string; description: string }> = {
  associate: {
    label: "associates",
    title: "No associates yet",
    description: "Associates will appear here after they are added and linked to a company.",
  },
  admin: {
    label: "admins",
    title: "No admins yet",
    description: "Admin accounts will appear here after they are added to the platform.",
  },
  operator: {
    label: "operators",
    title: "No operators yet",
    description: "Operator accounts will appear here after they are added to the platform.",
  },
  inventoryManager: {
    label: "inventory managers",
    title: "No inventory managers yet",
    description: "Inventory manager accounts will appear here after they are added to the platform.",
  },
};

const hasFilterValue = (value: any) => {
  if (value === null || value === undefined || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

const UserTabContent: React.FC<UserTabContentProps> = ({
  currentTable,
  lockedFilters = {},
  showAdd = true,
  showDelete = true,
}) => {
  const tableConfig = { ...initialTableConfig }; // Create a copy to avoid mutations
  const generatedColumns = generateColumns(currentTable, tableConfig);
  const columns = currentTable === "associate" ? [
    { name: "ASSOCIATE", uid: "associateProfile" },
    { name: "COMPANY & ROLE", uid: "companyRole" },
    { name: "VERIFICATION", uid: "verificationSummary" },
    { name: "ACCOUNT", uid: "accountSummary" },
    { name: "RECENT ACTIVITY", uid: "activitySummary" },
    { name: "ACTIONS", uid: "actions2", type: "action" },
  ] : generatedColumns;
  const [filters, setFilters] = useState<Record<string, any>>({}); // Dynamic filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 25;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, JSON.stringify(filters || {}), currentTable]);

  const handleFiltersUpdate = (updatedFilters: Record<string, any>) => {
    setFilters(updatedFilters); // Update the filters
  };
  const tableLabel = currentTable;
  const emptyStateCopy = EMPTY_STATE_COPY[currentTable] || {
    label: "records",
    title: "No records yet",
    description: "Records will appear here after they are added to the platform.",
  };
  const hasActiveCriteria = search.trim().length > 0 || Object.values(filters).some(hasFilterValue);
  const isFreightAssociates = currentTable === "associate" && lockedFilters.companyCapability === "freight-forwarding";

  const clearSearchAndFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setFilters({});
    setPage(1);
  };

  return (
    <div className="w-full max-w-full min-w-0">
      <QueryComponent
        api={apiRoutesByRole[currentTable]}
        queryKey={[
          currentTable,
          apiRoutesByRole[currentTable],
          filters,
          lockedFilters,
          debouncedSearch,
          page,
        ]}
        page={page}
        limit={limit}
        search={debouncedSearch}
        additionalParams={{
          ...filters,
          ...lockedFilters,
          sort: "createdAt:desc",
        }}
      >
        {(data: any, refetch, meta) => {
          const fetchedData = Array.isArray(data) ? data : (data?.data || []);
          // Generate formFields with updated values
          let formFields = tableConfig[currentTable];

          const tableData = fetchedData.map((item: any) => {
            const { isDeleted, password, __v, ...rest } = item;
            const joinNames = (arr: any[] = []) =>
              arr.length > 0
                ? arr.map((x) => x.name).join(", ")
                : "Not Defined";

            if (currentTable === "operator") {
              const presenceStatus = item.presenceStatus || getPresenceStatus(item.lastSeenAt);
              return {
                ...rest,
                admin: item.admin ? item.admin.name : "N/A",
                languageKnown: joinNames(item.languageKnown),
                presenceStatus,
              };
            } else if (currentTable === "associate") {
              const designationId =
                item.designationId ||
                (typeof item.designation === "object" ? item.designation?._id : item.designation);
              const designationName =
                item.designationName ||
                (typeof item.designation === "object" ? item.designation?.name : "") ||
                (typeof item.designation === "string" && item.designation.length > 0 ? item.designation : "");
              const presenceStatus = item.presenceStatus || getPresenceStatus(item.lastSeenAt);
              return {
                ...rest,
                associateProfile: (
                  <div className="flex min-w-[220px] items-center gap-3 py-1">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-obaol-500/12 text-sm font-black text-obaol-700 dark:text-obaol-300">{String(item.name || "A").split(/\s+/).slice(0, 2).map((part: string) => part[0]).join("").toUpperCase()}</span>
                    <span className="min-w-0"><span className="block truncate font-bold text-foreground">{item.name || "Unnamed associate"}</span><span className="mt-0.5 flex items-center gap-1 truncate text-xs text-default-400"><FiMail />{item.email || "No email"}</span></span>
                  </div>
                ),
                associateCompany: item.associateCompany
                  ? item.associateCompany.name
                  : "N/A",
                designation: designationName || "Unknown",
                designationId: designationId || "",
                presenceStatus,
                companyRole: <div className="min-w-[190px]"><span className="flex items-center gap-1.5 font-semibold text-foreground"><FiBriefcase className="text-obaol-500" />{item.associateCompany?.name || "Not linked"}</span><span className="mt-1 block text-xs text-default-400">{designationName || "Designation not provided"}</span></div>,
                verificationSummary: <div className="flex min-w-[170px] flex-wrap gap-2"><DashboardStatusBadge tone={item.isEmailVerified ? "success" : "warning"}>Email {item.isEmailVerified ? "verified" : "pending"}</DashboardStatusBadge><DashboardStatusBadge tone={item.isCompanyVerified ? "success" : "warning"}>Company {item.isCompanyVerified ? "verified" : "pending"}</DashboardStatusBadge></div>,
                accountSummary: <div className="flex min-w-[140px] flex-wrap gap-2"><DashboardStatusBadge tone={item.isActive ? "success" : "danger"}>{item.isActive ? "Active" : "Inactive"}</DashboardStatusBadge><DashboardStatusBadge tone={String(item.registrationStatus).toUpperCase() === "APPROVED" ? "success" : "warning"}>{item.registrationStatus || "Pending"}</DashboardStatusBadge></div>,
                activitySummary: <div className="min-w-[165px]"><span className="flex items-center gap-1.5 text-sm font-semibold text-foreground"><FiClock className="text-default-400" />{presenceStatus}</span><span className="mt-1 block text-xs text-default-400">{item.lastSeenAt ? `Seen ${new Date(item.lastSeenAt).toLocaleDateString("en-GB")}` : "Never seen"}</span></div>,
              };
            }
            // Handle other user types similarly if needed

            return rest;
          });

          return (
            <>
              <div className="flex items-center justify-between">
                {/* AddModal for adding new entries */}
                {showAdd ? <AddModal
                  currentTable={currentTable}
                  formFields={formFields} // Pass the updated formFields
                  apiEndpoint={apiRoutesByRole[currentTable]}
                  refetchData={refetch}
                /> : <span />}
                <DynamicFilter
                  currentTable={currentTable}
                  formFields={tableConfig[currentTable]}
                  onApply={handleFiltersUpdate} // Pass the callback to DynamicFilter
                  searchValue={search}
                  onSearchChange={setSearch}
                  searchPlaceholder={`Search ${tableLabel}...`}
                  appliedFilters={filters}
                  actionElement={(
                    <UsersExportButton
                      currentTable={currentTable}
                      search={debouncedSearch}
                      filters={filters}
                    />
                  )}
                />{" "}
              </div>
              <Spacer y={5} />
              {tableData.length > 0 ? (
                <TableFrame>
                  <CommonTable
                    TableData={tableData}
                    columns={columns}
                    isLoading={false}
                    page={meta?.currentPage || page}
                    totalPages={meta?.totalPages || 1}
                    rowsPerPage={limit}
                    onPageChange={(nextPage) => setPage(nextPage)}
                    viewModal={(item: any) => (
                      <DetailsModal
                        currentTable={currentTable}
                        columns={columns}
                        data={item}
                      />
                    )}
                    editModal={(item: any) => (
                      <EditModal
                        _id={item._id}
                        initialData={{
                          ...item,
                          designation: item.designationId || item.designation,
                        }}
                        currentTable={currentTable}
                        formFields={formFields}
                        apiEndpoint={apiRoutesByRole[currentTable]} // Assuming API endpoint for update
                        refetchData={refetch}
                        presentation={currentTable === "associate" ? "drawer" : "modal"}
                      />
                    )}
                    deleteModal={showDelete ? (item: any) => (
                      <DeleteModal
                        _id={item._id}
                        name={item.name}
                        deleteApiEndpoint={apiRoutesByRole[currentTable]}
                        refetchData={refetch}
                        useBody={true}
                      />
                    ) : undefined}
                  />
                </TableFrame>
              ) : (
                <EmptyState
                  icon={<FiUsers className="text-2xl" />}
                  title={hasActiveCriteria ? `No matching ${emptyStateCopy.label}` : emptyStateCopy.title}
                  description={
                    hasActiveCriteria
                      ? "Try a different search or clear the current filters to see more results."
                      : isFreightAssociates
                        ? "Associates will appear here after users are linked to companies that provide freight-forwarding services."
                        : emptyStateCopy.description
                  }
                  action={hasActiveCriteria ? (
                    <button
                      type="button"
                      onClick={clearSearchAndFilters}
                      className="inline-flex min-h-11 items-center justify-center rounded-xl bg-obaol-500 px-5 py-2.5 text-sm font-bold text-obaol-950 outline-none transition hover:bg-obaol-400 focus-visible:ring-2 focus-visible:ring-obaol-500 focus-visible:ring-offset-2"
                    >
                      Clear search and filters
                    </button>
                  ) : undefined}
                />
              )}
            </>
          );
        }}
      </QueryComponent>
    </div>
  );
};

export default UserTabContent;
