"use client";

import React from "react";
import { NextPage } from "next";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Spacer, Card, CardBody, User, Chip, Skeleton, Divider } from "@heroui/react";
import { associateCompanyRoutes } from "@/core/api/apiRoutes";
import { getData } from "@/core/api/apiHandler";
import VariantRate from "@/components/dashboard/Catalog/variant-rate";
import Title from "@/components/titles";

const CompanyProfilePage: NextPage = () => {
    const params = useParams();
    const companyId = params.id as string;

    const { data: companyData, isLoading: isCompanyLoading } = useQuery({
        queryKey: ["associateCompany", companyId],
        queryFn: () => getData(`${associateCompanyRoutes.getAll}/${companyId}`),
        enabled: !!companyId,
    });

    const company = companyData?.data;

    if (isCompanyLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-[95%] max-w-7xl">
                    <Spacer y={6} />
                    <Skeleton className="rounded-lg w-1/3 h-10 mb-4" />
                    <Skeleton className="rounded-lg w-full h-40" />
                </div>
            </div>
        );
    }

    if (!company) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Company not found.</p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="w-[95%] max-w-7xl py-8">
                {/* @ts-ignore */}
                <Spacer y={2} />

                {/* Company Header */}
                <Card className="w-full mb-8">
                    <CardBody className="flex flex-col md:flex-row gap-6 items-start md:items-center p-6">
                        <div className="flex-1">
                            <div className="flex gap-4 items-center mb-2">
                                <Title title={company.name} />
                                {company.companyType && (
                                    <Chip color="primary" variant="flat" size="sm">{company.companyType.name}</Chip>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-4 text-default-500 text-sm">
                                {company.email && (
                                    <div className="flex items-center gap-1">
                                        <span>📧</span> {company.email}
                                    </div>
                                )}
                                {company.phone && (
                                    <div className="flex items-center gap-1">
                                        <span>📞</span> {company.phone}
                                    </div>
                                )}
                                {company.location && (
                                    <div className="flex items-center gap-1">
                                        <span>📍</span> {company.location}
                                    </div>
                                )}
                            </div>
                        </div>
                        {company.website && (
                            <a
                                href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline"
                            >
                                Visit Website ↗
                            </a>
                        )}
                    </CardBody>
                </Card>

                <Divider className="my-6" />

                {/* Products Section */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2">Product Catalog</h2>
                    <p className="text-default-500 text-sm mb-4">
                        Browse verified products and rates offered by {company.name}.
                    </p>
                </div>

                {/* Displayed Rates Table */}
                <VariantRate
                    rate="displayedRate" // Use displayedRate to fetch products explicitly displayed by this company
                    displayOnly
                    additionalParams={{ associateCompany: companyId }}
                />

                {/* @ts-ignore */}
                <Spacer y={4} />
            </div>
        </div>
    );
};

export default CompanyProfilePage;
