// src/utils/fetchDependentOptions.ts
import { queryClient } from "@/app/provider";
import { getData } from "@/core/api/apiHandler";
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
  context?: { mode?: "associateForm" | "default"; scope?: string }
): Promise<{ key: string; value: string }[]> => {
  const lowerKey = fieldKey.toLowerCase();

  const extractArray = (raw: any): any[] => {
    if (Array.isArray(raw)) return raw;
    if (raw?.data && Array.isArray(raw.data)) return raw.data;
    if (raw?.data?.data && Array.isArray(raw.data.data)) return raw.data.data;
    if (raw?.data?.data?.data && Array.isArray(raw.data.data.data)) return raw.data.data.data;
    return [];
  };

  const query = async () => {
    let params: any = { limit: "2000" };
    if (parentKey && parentValue) {
      // If parentValue is an array (multi-select), usually the backend generic CRUD 
      // handles it if passed as multiple params or special format. 
      // For now, let's pass it as is, and let the API handler/axios deal with it.
      params[parentKey] = parentValue;
    }

    if (lowerKey.includes("admin")) {
      const res = await getData(adminRoutes.getAll, params);
      return extractArray(res).map((d: any) => ({ key: d._id, value: d.name }));
    }

    if (lowerKey === "operator") {
      const res = await getData(operatorRoutes.getAll, params);
      return extractArray(res).map((d: any) => ({ key: d._id, value: d.name }));
    }

    if (lowerKey === "category") {
      const res = await getData(categoryRoutes.getAll, params);
      return extractArray(res).map((d: any) => ({ key: d._id, value: d.name }));
    }

    if (lowerKey === "product") {
      const res = await getData(productRoutes.getAll, params);
      return extractArray(res).map((d: any) => ({ key: d._id, value: d.name }));
    }

    if (lowerKey === "productvariant") {
      const res = await getData(productVariantRoutes.getAll, params);
      return extractArray(res).map((d: any) => ({ key: d._id, value: d.name }));
    }

    if (lowerKey === "subcategory") {
      const res = await getData(subCategoryRoutes.getAll, params);
      return extractArray(res).map((d: any) => ({ key: d._id, value: d.name }));
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
  const queryKey = [fieldKey, parentKey, JSON.stringify(parentValue), context?.mode || "default"];

  // fetch or return cached data
  return queryClient.fetchQuery({
    queryKey,
    queryFn: query,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export { getOptions as fetchDependentOptions };
