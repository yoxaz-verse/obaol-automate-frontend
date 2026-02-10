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
  companyStageRoutes,
  companyTypeRoutes,
  countryRoutes,
  designationRoutes,
  districtRoutes,
  divisionRoutes,
  employeeRoutes,
  enquiryProcessStatusRoutes,
  generalIntentRoutes,
  inventoryManagerRoutes,
  jobRoleRoutes,
  jobTypeRoutes,
  languageRoutes,
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
  parentValue?: string
): Promise<{ key: string; value: string }[]> => {
  const lowerKey = fieldKey.toLowerCase();

  const query = async () => {
    if (lowerKey.includes("admin")) {
      const res = await getData(adminRoutes.getAll, { limit: "1000" });
      return (
        res?.data?.data?.data?.map((d: any) => ({
          key: d._id,
          value: d.name,
        })) || []
      );
    }

    if (lowerKey === "employee") {
      const res = await getData(employeeRoutes.getAll, { limit: "1000" });
      return (
        res?.data?.data?.data?.map((d: any) => ({
          key: d._id,
          value: d.name,
        })) || []
      );
    }
    if (lowerKey === "category") {
      const res = await getData(categoryRoutes.getAll, { limit: "1000" });
      return (
        res?.data?.data?.data?.map((d: any) => ({
          key: d._id,
          value: d.name,
        })) || []
      );
    }

    if (lowerKey === "product") {
      const res = await getData(productRoutes.getAll, { limit: "1000" });
      return (
        res?.data?.data?.data?.map((d: any) => ({
          key: d._id,
          value: d.name,
        })) || []
      );
    }

    if (lowerKey === "productvariant") {
      const res = await getData(productVariantRoutes.getAll, { limit: "1000" });
      return (
        res?.data?.data?.data?.map((d: any) => ({
          key: d._id,
          value: d.name,
        })) || []
      );
    }

    if (lowerKey === "subcategory") {
      const res = await getData(subCategoryRoutes.getAll, { limit: "1000" });
      return (
        res?.data?.data?.data?.map((d: any) => ({
          key: d._id,
          value: d.name,
        })) || []
      );
    }

    if (lowerKey === "inventorymanager") {
      const res = await getData(inventoryManagerRoutes.getAll, {
        limit: "1000",
      });
      return (
        res?.data?.data?.data?.map((d: any) => ({
          key: d._id,
          value: d.name,
        })) || []
      );
    }

    if (lowerKey === "associatecompany") {
      const res = await getData(associateCompanyRoutes.getAll, {
        limit: "1000",
      });
      return (
        res?.data?.data?.data?.map((d: any) => ({
          key: d._id,
          value: d.name,
        })) || []
      );
    }

    if (lowerKey === "country") {
      const res = await getData(countryRoutes.getAll, {
        limit: "1000",
      });
      return (
        res?.data?.data?.data?.map((d: any) => ({
          key: d._id,
          value: d.name,
        })) || []
      );
    }

    if (lowerKey === "generalintent") {
      const res = await getData(generalIntentRoutes.getAll, {
        limit: "1000",
      });
      return (
        res?.data?.data?.data?.map((d: any) => ({
          key: d._id,
          value: d.name,
        })) || []
      );
    }
    if (lowerKey === "subintent") {
      const res = await getData(subIntentRoutes.getAll, {
        limit: "1000",
      });
      return (
        res?.data?.data?.data?.map((d: any) => ({
          key: d._id,
          value: d.name,
        })) || []
      );
    }
    if (lowerKey === "certification") {
      const res = await getData(certificationRoutes.getAll, {
        limit: "1000",
      });
      return (
        res?.data?.data?.data?.map((d: any) => ({
          key: d._id,
          value: d.name,
        })) || []
      );
    }
    if (lowerKey === "companybusinessmodel") {
      const res = await getData(companyBusinessModelRoutes.getAll, {
        limit: "1000",
      });
      return (
        res?.data?.data?.data?.map((d: any) => ({
          key: d._id,
          value: d.name,
        })) || []
      );
    }
    if (lowerKey === "companystage") {
      const res = await getData(companyStageRoutes.getAll, {
        limit: "1000",
      });
      return (
        res?.data?.data?.data?.map((d: any) => ({
          key: d._id,
          value: d.name,
        })) || []
      );
    }
    if (lowerKey.includes("associate")) {
      const res = await getData(associateRoutes.getAll, { limit: "1000" });
      return (
        res?.data?.data?.data?.map((d: any) => ({
          key: d._id,
          value: d.name,
        })) || []
      );
    }

    if (lowerKey === "companytype") {
      const res = await getData(companyTypeRoutes.getAll, { limit: "1000" });
      return (
        res?.data?.data?.data.map((d: any) => ({
          key: d._id,
          value: d.name,
        })) || []
      );
    }

    if (lowerKey === "jobrole") {
      const res = await getData(jobRoleRoutes.getAll, { limit: "1000" });
      return (
        res?.data?.data?.data.map((d: any) => ({
          key: d._id,
          value: d.name,
        })) || []
      );
    }

    if (lowerKey === "jobtype") {
      const res = await getData(jobTypeRoutes.getAll, { limit: "1000" });
      return (
        res?.data?.data?.data.map((d: any) => ({
          key: d._id,
          value: d.name,
        })) || []
      );
    }

    if (lowerKey === "language") {
      const res = await getData(languageRoutes.getAll, { limit: "1000" });
      return (
        res?.data?.data?.data.map((d: any) => ({
          key: d._id,
          value: d.name,
        })) || []
      );
    }

    if (lowerKey === "designation") {
      const res = await getData(designationRoutes.getAll, { limit: "1000" });
      return (
        res?.data?.data?.data.map((d: any) => ({
          key: d._id,
          value: d.name,
        })) || []
      );
    }

    if (lowerKey === "enquiryprocessstatus") {
      const res = await getData(enquiryProcessStatusRoutes.getAll, {
        limit: "1000",
      });
      return (
        res?.data?.data?.data.map((d: any) => ({
          key: d._id,
          value: d.name,
        })) || []
      );
    }

    if (lowerKey.includes("state")) {
      const res = await getData(stateRoutes.getAll, { limit: "1000" });
      return (
        res?.data?.data?.data?.map((d: any) => ({ key: d._id, value: d.name })) || []
      );
    }

    if (parentKey && lowerKey.includes("district")) {
      const res = await getData(districtRoutes.getAll, {
        [parentKey]: parentValue,
        limit: "1000",
      });
      return (
        res?.data?.data?.data?.map((d: any) => ({ key: d._id, value: d.name })) || []
      );
    }

    if (parentKey && lowerKey.includes("division")) {
      const res = await getData(divisionRoutes.getAll, {
        [parentKey]: parentValue,
        limit: "1000",
      });
      return (
        res?.data?.data?.data?.map((d: any) => ({ key: d._id, value: d.name })) || []
      );
    }

    if (parentKey && lowerKey.includes("pincodeentry")) {
      const res = await getData(pincodeEntryRoutes.getAll, {
        [parentKey]: parentValue,
      });
      return (
        res?.data?.data?.data?.map((p: any) => ({
          key: p._id,
          value: `${p.pincode} - ${p.officename}`,
        })) || []
      );
    }

    return [];
  };

  // cache key includes dependencies
  const queryKey = [fieldKey, parentKey, parentValue];

  // fetch or return cached data
  return queryClient.fetchQuery({
    queryKey,
    queryFn: query,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export { getOptions as fetchDependentOptions };
