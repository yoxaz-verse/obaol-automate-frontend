// src/utils/fetchDependentOptions.ts
import { queryClient } from "@/app/provider";
import { getData } from "@/core/api/apiHandler";
import { buildDependentOptionParams, extractDependentOptionRows } from "@/utils/dependentOptionContract";
import {
  adminRoutes,
  associateCompanyRoutes,
  associateRoutes,
  categoryRoutes,
  certificationRoutes,
  companyBusinessModelRoutes,
  companyFunctionRoutes,
  companySubFunctionRoutes,
  companyStageRoutes,
  companyTypeRoutes,
  countryRoutes,
  designationRoutes,
  districtRoutes,
  divisionRoutes,
  operatorRoutes,
  enquiryProcessStatusRoutes,
  generalIntentRoutes,
  incotermRoutes,
  inventoryManagerRoutes,
  jobRoleRoutes,
  jobTypeRoutes,
  languageRoutes,
  paymentTermRoutes,
  warehouseRoutes,
  pincodeEntryRoutes,
  productRoutes,
  productVariantRoutes,
  stateRoutes,
  subCategoryRoutes,
  subIntentRoutes,
} from "@/core/api/apiRoutes";

const getOptions = async (
  fieldKey: string,
  parentKey?: string,
  parentValue?: string | string[],
  context?: {
    mode?: "associateForm" | "default";
    scope?: string;
    throwOnError?: boolean;
    forceRefresh?: boolean;
    timeoutMs?: number;
  }
): Promise<{ key: string; value: string }[]> => {
  const lowerKey = fieldKey.toLowerCase();
  const extractArray = extractDependentOptionRows;

  const query = async () => {
    let params: any = buildDependentOptionParams(parentKey, parentValue);

    if (lowerKey.includes("admin")) {
      const res = await getData(adminRoutes.getAll, params);
      return extractDependentOptionRows(res).map((d: any) => ({ key: d._id, value: d.name }));
    }

    if (lowerKey === "operator") {
      const res = await getData(operatorRoutes.getAll, params);
      return extractDependentOptionRows(res).map((d: any) => ({ key: d._id, value: d.name }));
    }

    if (lowerKey === "category") {
      const res = await getData(categoryRoutes.getAll, params);
      return extractDependentOptionRows(res).map((d: any) => ({ key: d._id, value: d.name }));
    }

    if (lowerKey === "product") {
      const res = await getData(productRoutes.getAll, params);
      return extractDependentOptionRows(res).map((d: any) => ({ key: d._id, value: d.name }));
    }

    if (lowerKey === "productvariant") {
      const res = await getData(productVariantRoutes.getAll, params);
      return extractDependentOptionRows(res).map((d: any) => ({ key: d._id, value: d.name }));
    }

    if (lowerKey === "subcategory") {
      const parentVal = typeof parentValue === "string" ? parentValue : undefined;
      const subParams = { 
        ...params, 
        ...(parentVal && { category: parentVal }) 
      };
      const res = await getData(subCategoryRoutes.getAll, subParams);
      return extractDependentOptionRows(res).map((d: any) => ({ key: d._id, value: d.name }));
    }

    if (lowerKey === "inventorymanager") {
      const res = await getData(inventoryManagerRoutes.getAll, params);
      return extractArray(res).map((d: any) => ({ key: d._id, value: d.name }));
    }

    if (lowerKey === "associatecompany") {
      if (context?.mode === "associateForm") {
        params = { ...params };
      }
      const res = await getData(associateCompanyRoutes.getAll, params);
      return extractArray(res).map((d: any) => ({ key: d._id, value: d.name }));
    }

    if (lowerKey === "warehouse") {
      if (context?.scope) {
        params.scope = context.scope;
      }
      const res = await getData(warehouseRoutes.getAll, params);
      return extractArray(res).map((d: any) => ({ key: d._id, value: d.name }));
    }

    if (lowerKey === "country") {
      const res = await getData(countryRoutes.getAll, params);
      return extractArray(res).map((d: any) => ({ key: d._id, value: d.name }));
    }

    if (lowerKey === "generalintent") {
      const res = await getData(generalIntentRoutes.getAll, params);
      return extractArray(res).map((d: any) => ({ key: d._id, value: d.name }));
    }

    if (lowerKey === "subintent") {
      const res = await getData(subIntentRoutes.getAll, params);
      return extractArray(res).map((d: any) => ({ key: d._id, value: d.name }));
    }

    if (lowerKey === "certification") {
      const res = await getData(certificationRoutes.getAll, params);
      return extractArray(res).map((d: any) => ({ key: d._id, value: d.name }));
    }

    if (lowerKey === "companybusinessmodel") {
      const res = await getData(companyBusinessModelRoutes.getAll, params);
      return extractArray(res).map((d: any) => ({ key: d._id, value: d.name }));
    }
    if (lowerKey === "companyfunction") {
      const res = await getData(companyFunctionRoutes.getAll, params);
      return extractArray(res).map((d: any) => ({ key: d._id, value: d.name }));
    }
    if (lowerKey === "companysubfunction") {
      const functionId = typeof parentValue === "string" ? parentValue : undefined;
      const subParams = functionId ? { ...params, functionId } : params;
      const res = await getData(companySubFunctionRoutes.getAll, subParams);
      return extractArray(res).map((d: any) => ({ key: d._id, value: d.name }));
    }

    if (lowerKey === "companystage") {
      const res = await getData(companyStageRoutes.getAll, params);
      return extractArray(res).map((d: any) => ({ key: d._id, value: d.name }));
    }

    if (lowerKey.includes("associate")) {
      const res = await getData(associateRoutes.getAll, params);
      return extractArray(res).map((d: any) => ({ key: d._id, value: d.name }));
    }

    if (lowerKey === "companytype") {
      const res = await getData(companyTypeRoutes.getAll, params);
      return extractArray(res).map((d: any) => ({ key: d._id, value: d.name }));
    }

    if (lowerKey === "jobrole") {
      const res = await getData(jobRoleRoutes.getAll, params);
      return extractArray(res).map((d: any) => ({ key: d._id, value: d.name }));
    }

    if (lowerKey === "jobtype") {
      const res = await getData(jobTypeRoutes.getAll, params);
      return extractArray(res).map((d: any) => ({ key: d._id, value: d.name }));
    }

    if (lowerKey === "language") {
      const res = await getData(languageRoutes.getAll, params);
      return extractArray(res).map((d: any) => ({ key: d._id, value: d.name }));
    }

    if (lowerKey === "designation") {
      const res = await getData(designationRoutes.getAll, params);
      return extractArray(res).map((d: any) => ({ key: d._id, value: d.name }));
    }

    if (lowerKey === "enquiryprocessstatus") {
      const res = await getData(enquiryProcessStatusRoutes.getAll, params);
      return extractArray(res).map((d: any) => ({ key: d._id, value: d.name }));
    }
    if (lowerKey === "incoterm") {
      const res = await getData(incotermRoutes.getAll, params);
      return extractArray(res).map((d: any) => ({
        key: d._id,
        value: [d.code, d.name].filter(Boolean).join(" - ") || d.name || d.code || "Incoterm",
      }));
    }

    if (lowerKey === "paymentterm") {
      const res = await getData(paymentTermRoutes.getAll, params);
      return extractArray(res).map((d: any) => ({ key: d._id, value: d.label || "Payment Term" }));
    }

    if (lowerKey.includes("state")) {
      const res = await getData(stateRoutes.getAll, params);
      return extractArray(res).map((d: any) => ({ key: d._id, value: d.name }));
    }

    if (lowerKey.includes("district")) {
      const res = await getData(districtRoutes.getAll, params);
      return extractArray(res).map((d: any) => ({ key: d._id, value: d.name }));
    }

    if (lowerKey.includes("division")) {
      const res = await getData(divisionRoutes.getAll, params);
      return extractArray(res).map((d: any) => ({ key: d._id, value: d.name }));
    }

    if (lowerKey.includes("pincodeentry")) {
      const res = await getData(pincodeEntryRoutes.getAll, params);
      return extractArray(res).map((p: any) => ({
        key: p._id,
        value: `${p.pincode} - ${p.officename}`,
      }));
    }

    return [];
  };

  // cache key includes dependencies
  // JSON.stringify handled arrays in cache key
  const queryKey = [
    fieldKey,
    parentKey,
    JSON.stringify(parentValue),
    context?.mode || "default",
    context?.scope || "",
  ];

  if (context?.forceRefresh) {
    queryClient.removeQueries({ queryKey, exact: true });
  }

  // fetch or return cached data
  return queryClient.fetchQuery({
    queryKey,
    staleTime: context?.forceRefresh ? 0 : 30_000,
    queryFn: async () => {
      try {
        const timeoutMs = Math.max(1_000, context?.timeoutMs ?? 15_000);
        let timeoutId: ReturnType<typeof setTimeout> | undefined;
        const timeout = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(
            () => reject(new Error(`Timed out loading ${fieldKey} options.`)),
            timeoutMs,
          );
        });
        try {
          return await Promise.race([query(), timeout]);
        } finally {
          if (timeoutId) clearTimeout(timeoutId);
        }
      } catch (err) {
        console.error(`Failed to fetch options for ${fieldKey}:`, err);
        if (context?.throwOnError) throw err;
        return [];
      }
    },
  });
};

export { getOptions as fetchDependentOptions };
