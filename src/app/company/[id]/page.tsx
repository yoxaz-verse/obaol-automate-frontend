"use client";

import React from "react";
import { NextPage } from "next";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Spacer, Card, CardBody, User, Chip, Skeleton, Divider } from "@heroui/react";
import { associateCompanyRoutes, apiRoutes } from "@/core/api/apiRoutes";
import { getData } from "@/core/api/apiHandler";
import VariantRate from "@/components/dashboard/Catalog/variant-rate";
import Title from "@/components/titles";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";

const CompanyProfilePage: NextPage = () => {
    const params = useParams();
    const companyId = params.id as string;

    const { data: companyData, isLoading: isCompanyLoading } = useQuery({
        queryKey: ["associateCompany", companyId],
        queryFn: () => getData(`${associateCompanyRoutes.getAll}/${companyId}`),
        enabled: !!companyId,
    });

    const { data: teamStatsData, isLoading: isTeamStatsLoading } = useQuery({
        queryKey: ["teamStats", companyId],
        queryFn: () => getData(`/api/v1/web/associate-companies/${companyId}/stats`),
        enabled: !!companyId,
    });

    const company = companyData?.data;
    const teamStats = teamStatsData?.data || [];

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

                {/* Team & Performance Section */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2">Team & Performance</h2>
                    <p className="text-default-500 text-sm mb-4">
                        Overview of associates, their verification status, and platform activity.
                    </p>
                </div>

                {isTeamStatsLoading ? (
                    <Skeleton className="rounded-lg w-full h-32 mb-8" />
                ) : teamStats.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {teamStats.map((member: any) => (
                            <Card key={member._id} className="w-full">
                                <CardBody className="p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg">{member.name}</h3>
                                            <p className="text-default-500 text-xs">{member.designation || "Associate"}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 text-sm text-default-600 mb-4">
                                        <div className="flex items-center gap-2">
                                            <span>📧</span> {member.email}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span>📞</span> {member.phone}
                                        </div>
                                    </div>

                                    <div className="bg-default-100 rounded-xl p-3 mb-4 grid grid-cols-2 gap-2 text-center">
                                        <div>
                                            <p className="text-xs text-default-500 uppercase font-bold tracking-wider">Enquiries</p>
                                            <p className="text-xl font-black text-primary">{member.performance.enquiriesHandled}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-default-500 uppercase font-bold tracking-wider">Orders</p>
                                            <p className="text-xl font-black text-success">{member.performance.ordersCompleted}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mt-auto">
                                        <Tooltip content="Email Verification">
                                            <Chip size="sm" variant="flat" color={member.isEmailVerified ? "success" : "default"} startContent={member.isEmailVerified ? <FiCheckCircle /> : <FiXCircle />}>
                                                Email
                                            </Chip>
                                        </Tooltip>
                                        <Tooltip content="Phone Verification">
                                            <Chip size="sm" variant="flat" color={member.isPhoneVerified ? "success" : "default"} startContent={member.isPhoneVerified ? <FiCheckCircle /> : <FiXCircle />}>
                                                Phone
                                            </Chip>
                                        </Tooltip>
                                        <Tooltip content="1-to-1 Verification">
                                            <Chip size="sm" variant="flat" color={member.isOneToOneVerified ? "success" : "default"} startContent={member.isOneToOneVerified ? <FiCheckCircle /> : <FiXCircle />}>
                                                1-on-1
                                            </Chip>
                                        </Tooltip>
                                        <Tooltip content="Company Context">
                                            <Chip size="sm" variant="flat" color={member.isCompanyVerified ? "success" : "default"} startContent={member.isCompanyVerified ? <FiCheckCircle /> : <FiXCircle />}>
                                                Context
                                            </Chip>
                                        </Tooltip>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="mb-8">
                        <CardBody className="p-8 text-center text-default-400">
                            No associates found for this company.
                        </CardBody>
                    </Card>
                )}

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
