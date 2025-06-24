"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Spacer, Autocomplete, AutocompleteItem, Avatar } from "@heroui/react";
import { Button } from "@nextui-org/react";
import VariantRate from "@/components/dashboard/Catalog/variant-rate";
import Title from "@/components/titles";
import { getData } from "@/core/api/apiHandler";
import {
  associateCompanyRoutes,
  variantRateRoutes,
} from "@/core/api/apiRoutes";
import { IoSearchCircleOutline } from "react-icons/io5";

const SearchIcon = ({
  size = 24,
  strokeWidth = 1.5,

  ...props
}) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height={size}
    role="presentation"
    viewBox="0 0 24 24"
    width={size}
    {...props}
  >
    <path
      d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
    />
    <path
      d="M22 22L20 20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
    />
  </svg>
);

interface Company {
  _id: string;
  name: string;
}

interface VariantRateItem {
  associateCompany: { _id: string; name: string } | null;
  associate?: { associateCompany?: { _id: string; name: string } | null };
}

const ITEMS_PER_PAGE = 10;

export default function Product() {
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
      companiesWithProducts: filteredCompanies,
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
  console.log(currentCompaniesPage);

  return (
    <div className="flex items-center justify-center">
      <div className="w-[95%]">
        {/* 🔍 Autocomplete Search */}
        <div className="w-full max-w-md mb-6">
          <Autocomplete
            aria-label="Select a company"
            defaultItems={companiesWithProducts}
            maxListboxHeight={400}
            itemHeight={60}
            placeholder="Search by company name"
            variant="bordered"
            radius="full"
            className="text-warning-400"
            classNames={{
              base: "max-w-full",
              listboxWrapper: "max-h-[320px]",
              selectorButton: "text-warning-500",
            }}
            startContent={
              <SearchIcon
                className="text-default-400"
                size={20}
                strokeWidth={2.5}
              />
            }
            inputProps={{
              classNames: {
                input: "ml-1",
                inputWrapper: "h-[48px]",
              },
            }}
            popoverProps={{
              offset: 10,
              classNames: {
                base: "rounded-large",
                content:
                  "p-1 flex flex-col gap-2 border-small border-default-100 bg-background",
              },
            }}
            onSelectionChange={(key) => {
              setCurrentPage(1);
              setSelectedCompanyId((key as string) ?? null);
            }}
          >
            {(item) => (
              <AutocompleteItem
                key={item._id}
                textValue={item.name}
                className="flex items-center gap-2 py-2"
              >
                <div className="flex items-center gap-2 py-2">
                  <Avatar
                    className="flex-shrink-0"
                    size="sm"
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      item.name
                    )}&background=random`}
                  />
                  <div className="text-small">{item.name}</div>
                </div>
              </AutocompleteItem>
            )}
          </Autocomplete>
        </div>

        {/* 🔄 Company List with Products */}
        <div className="flex w-full gap-4 min-h-[80vh]">
          <div className="w-full pb-10 pr-6 overflow-auto">
            {currentCompaniesPage.map((company) => (
              <div key={company._id} className="mb-10">
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
