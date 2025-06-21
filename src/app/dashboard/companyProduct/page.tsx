"use client";

import React, { useEffect, useState } from "react";
import { Spacer } from "@heroui/react";
import VariantRate from "@/components/dashboard/Catalog/variant-rate";
import Title from "@/components/titles";
import { getData } from "@/core/api/apiHandler";
import {
  associateCompanyRoutes,
  variantRateRoutes,
} from "@/core/api/apiRoutes";

interface Company {
  _id: string;
  name: string;
}

interface VariantRateItem {
  associateCompany: { _id: string; name: string } | null;
  associate?: { associateCompany?: { _id: string; name: string } | null };
}

export default function Product() {
  const [companiesWithProducts, setCompaniesWithProducts] = useState<Company[]>(
    []
  );
  const [companiesWithoutProducts, setCompaniesWithoutProducts] = useState<
    Company[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompaniesAndRates = async () => {
      try {
        const [companyRes, rateRes] = await Promise.all([
          getData(associateCompanyRoutes.getAll, { limit: 10000 }),
          getData(variantRateRoutes.getAll, { limit: 10000 }),
        ]);

        const allCompanies: Company[] = companyRes?.data?.data?.data || [];
        const variantRates: VariantRateItem[] = rateRes?.data?.data?.data || [];

        // ✅ Collect company IDs from either associateCompany OR associate.associateCompany
        const productCompanyIds = new Set<string>();

        for (const item of variantRates) {
          const direct = item.associateCompany?._id;
          const fromAssociate = item.associate?.associateCompany?._id;

          if (direct) productCompanyIds.add(direct);
          else if (fromAssociate) productCompanyIds.add(fromAssociate);
        }

        // ✅ Split companies into "with products" and "without products"
        const withProducts = allCompanies.filter((company) =>
          productCompanyIds.has(company._id)
        );

        const withoutProducts = allCompanies.filter(
          (company) => !productCompanyIds.has(company._id)
        );

        setCompaniesWithProducts(withProducts);
        setCompaniesWithoutProducts(withoutProducts);
      } catch (error) {
        console.error("Error loading companies or rates", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompaniesAndRates();
  }, []);

  if (loading) return <div className="p-6">Loading company catalog...</div>;

  return (
    <div className="flex items-center justify-center">
      <div className="w-[95%]">
        <div className="flex w-full gap-4 min-h-[80vh]">
          <div className="w-full pb-10 pr-6 overflow-auto">
            {/* ✅ Companies WITH Products */}
            {companiesWithProducts.map((company) => (
              <div key={company._id} className="mb-10">
                <Title title={company.name} />
                <VariantRate
                  rate="variantRate"
                  additionalParams={{ associateCompany: company._id }}
                />
              </div>
            ))}

            <Spacer y={4} />

            {/* ✅ Companies WITHOUT Products */}
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
