"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Spacer, Button } from "@nextui-org/react";
import VariantRate from "@/components/dashboard/Catalog/variant-rate";
import Title from "@/components/titles";
import { getData } from "@/core/api/apiHandler";
import {
  associateCompanyRoutes,
  variantRateRoutes,
} from "@/core/api/apiRoutes";
import CompanySearch from "@/components/dashboard/Company/CompanySearch";

interface Company {
  _id: string;
  name: string;
}

interface VariantRateItem {
  associateCompany: { _id: string; name: string } | null;
  associate?: { associateCompany?: { _id: string; name: string } | null };
}

const ITEMS_PER_PAGE = 10;

export default function CompanyProductPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null
  );
  const [isPaginating, setIsPaginating] = useState(false);

  const { data: companyData, isLoading: loadingCompanies } = useQuery({
    queryKey: ["companies"],
    queryFn: () => getData(associateCompanyRoutes.getAll, { limit: 10000 }),
  });

  const { data: rateData, isLoading: loadingRates } = useQuery({
    queryKey: ["variantRates"],
    queryFn: () => getData(variantRateRoutes.getAll, { limit: 10000 }),
  });

  const {
    companiesWithProducts,
    companiesWithoutProducts,
    totalPages,
    currentCompaniesPage,
  } = useMemo(() => {
    const allCompanies: Company[] = companyData?.data?.data?.data || [];
    const variantRates: VariantRateItem[] = rateData?.data?.data?.data || [];

    const productCompanyIds = new Set<string>();

    for (const item of variantRates) {
      const direct = item.associateCompany?._id;
      const fromAssociate = item.associate?.associateCompany?._id;
      if (direct) productCompanyIds.add(direct);
      else if (fromAssociate) productCompanyIds.add(fromAssociate);
    }

    const withProducts = allCompanies.filter((c) =>
      productCompanyIds.has(c._id)
    );
    const withoutProducts = allCompanies.filter(
      (c) => !productCompanyIds.has(c._id)
    );

    const filteredCompanies = selectedCompanyId
      ? withProducts.filter((c) => c._id === selectedCompanyId)
      : withProducts;

    const totalPages = Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const currentCompaniesPage = filteredCompanies.slice(start, end);

    return {
      companiesWithProducts: withProducts,
      companiesWithoutProducts: withoutProducts,
      totalPages,
      currentCompaniesPage,
    };
  }, [companyData, rateData, currentPage, selectedCompanyId]);

  const handlePageChange = (newPage: number) => {
    if (isPaginating || newPage === currentPage) return;
    setIsPaginating(true);
    setCurrentPage(newPage);
    setTimeout(() => setIsPaginating(false), 300);
  };

  if (loadingCompanies || loadingRates) {
    return <div className="p-6 text-gray-500">Loading company catalog...</div>;
  }

  return (
    <div className="flex items-center justify-center">
      <div className="w-[95%]">
        {/* 🔍 Company Search */}
        <CompanySearch
          defaultSelected={selectedCompanyId}
          itemsFilter={(companies) =>
            companies.filter((c) =>
              companiesWithProducts.some((p) => p._id === c._id)
            )
          }
          onSelect={(id) => {
            setCurrentPage(1);
            setSelectedCompanyId(id);
          }}
        />

        {/* 🏭 Company List with Products */}
        <div className="flex w-full gap-4 min-h-[80vh]">
          <div className="w-full pb-10 pr-6 overflow-auto">
            {currentCompaniesPage.map((company) => (
              <div key={company._id} className="mb-10 border p-2 rounded-xl">
                <Title title={company.name} />
                <VariantRate
                  rate="variantRate"
                  additionalParams={{ associateCompany: company._id }}
                />
              </div>
            ))}

            {/* 🔁 Pagination */}
            {totalPages > 1 && (
              <div className="flex gap-2 mt-4 items-center">
                <Button
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isPaginating}
                  className="px-3 py-1 text-white rounded text-sm bg-warning-500 hover:bg-warning-300 disabled:opacity-50"
                >
                  Prev
                </Button>
                <span className="text-sm text-white">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isPaginating}
                  className="px-3 py-1 text-white rounded text-sm bg-warning-500 hover:bg-warning-300 disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
            )}

            <Spacer y={4} />

            {/* ❌ Companies Without Products */}
            {companiesWithoutProducts.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-3">
                  Companies Without Products
                </h2>
                <ul className="text-sm text-gray-500 list-disc pl-6">
                  {companiesWithoutProducts.map((company) => (
                    <li key={company._id}>{company.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <Spacer y={4} />
      </div>
    </div>
  );
}
