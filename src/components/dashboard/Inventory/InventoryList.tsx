"use client";

import React, { useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Card,
    CardBody,
    Chip,
    Spacer,
} from "@heroui/react";
import { motion } from "framer-motion";

import AddModal from "@/components/CurdTable/add-model";
import CommonTable from "@/components/CurdTable/common-table";
import QueryComponent from "@/components/queryComponent";
import AuthContext from "@/context/AuthContext";
import { apiRoutesByRole, generateColumns, initialTableConfig } from "@/utils/tableValues";
import EditModal from "@/components/CurdTable/edit-model";
import DeleteModal from "@/components/CurdTable/delete";
import DynamicFilter from "@/components/CurdTable/dynamic-filtering";
import TableFrame from "@/components/CurdTable/table-frame";

const InventoryList: React.FC = () => {
    const { user } = useContext(AuthContext);
    const [filters, setFilters] = useState<Record<string, any>>({});
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const roleLower = String(user?.role || "").toLowerCase();
    const isAdmin = roleLower === "admin";
    const isAssociate = roleLower === "associate";

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search.trim());
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const handleFiltersUpdate = (updatedFilters: Record<string, any>) => {
        setFilters(updatedFilters);
    };

    const columns = generateColumns("inventories", initialTableConfig, user?.role);
    const formFields = initialTableConfig["inventories"];

    // Filter form fields based on role if necessary
    const filteredFormFields = isAssociate
        ? formFields.filter(f => f.key !== "associate" && f.key !== "associateCompany")
        : formFields;

    const additionalParams = isAssociate ? { associate: user?.id } : {};

    return (
        <div className="w-full">
            <QueryComponent
                api={apiRoutesByRole["inventories"]}
                queryKey={[
                    "inventories",
                    filters,
                    debouncedSearch,
                    additionalParams
                ]}
                page={1}
                limit={100}
                search={debouncedSearch}
                additionalParams={{
                    ...(filters || {}),
                    ...(additionalParams || {}),
                }}
            >
                {(inventoryData: any, refetch) => {
                    const rawData = inventoryData?.data?.data || [];
                    const items = Array.isArray(rawData) ? rawData : (rawData?.data || []);

                    const tableData = items.map((item: any) => ({
                        ...item,
                        product: item.product?.name || "N/A",
                        productVariant: item.productVariant?.name || "N/A",
                        associate: item.associateCompany?.name || item.associate?.name || "OBAOL",
                    }));

                    return (
                        <div className="w-full">
                            <div className="flex justify-between items-center gap-3 mb-6">
                                <DynamicFilter
                                    currentTable={"inventories"}
                                    formFields={filteredFormFields}
                                    onApply={handleFiltersUpdate}
                                    searchValue={search}
                                    onSearchChange={setSearch}
                                    searchPlaceholder="Search inventory..."
                                />
                                <AddModal
                                    buttonLabel="Add Stock"
                                    currentTable="inventories"
                                    formFields={filteredFormFields}
                                    apiEndpoint={apiRoutesByRole["inventories"]}
                                    refetchData={refetch}
                                    additionalVariable={{
                                        ...(isAssociate && { associate: user?.id }),
                                    }}
                                />
                            </div>

                            <TableFrame>
                                <CommonTable
                                    TableData={tableData}
                                    columns={columns}
                                    isLoading={false}
                                    editModal={(item: any) => (
                                        <EditModal
                                            _id={item._id}
                                            initialData={item}
                                            currentTable="inventories"
                                            formFields={filteredFormFields}
                                            apiEndpoint={apiRoutesByRole["inventories"]}
                                            refetchData={refetch}
                                        />
                                    )}
                                    deleteModal={(item: any) => (
                                        <DeleteModal
                                            _id={item._id}
                                            name={`${item.productVariant}`}
                                            deleteApiEndpoint={apiRoutesByRole["inventories"]}
                                            refetchData={refetch}
                                        />
                                    )}
                                />
                            </TableFrame>
                        </div>
                    );
                }}
            </QueryComponent>
        </div>
    );
};

export default InventoryList;
