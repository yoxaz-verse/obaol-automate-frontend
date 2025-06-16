import { getData } from "@/core/api/apiHandler";
import {
  adminRoutes,
  associateCompanyRoutes,
  associateRoutes,
  companyTypeRoutes,
  designationRoutes,
  districtRoutes,
  divisionRoutes,
  enquiryProcessStatusRoutes,
  pincodeEntryRoutes,
  productVariantRoutes,
  stateRoutes,
} from "@/core/api/apiRoutes";

export const fetchDependentOptions = async (
  fieldKey: string,
  parentKey?: string,
  parentValue?: string
) => {
  if (fieldKey.toLowerCase().includes("admin")) {
    const res = await getData(`${adminRoutes.getAll}`, {
      limit: "1000",
    });
    return (
      res?.data?.data?.data?.map((d: any) => ({
        key: d._id,
        value: d.name,
      })) || []
    );
  }

  if (fieldKey === "associateCompany") {
    const res = await getData(`${associateCompanyRoutes.getAll}`, {
      limit: "1000",
    });
    return (
      res?.data?.data?.data?.map((d: any) => ({
        key: d._id,
        value: d.name,
      })) || []
    );
  }
  if (fieldKey.toLowerCase().includes("associate")) {
    const res = await getData(`${associateRoutes.getAll}`, {
      limit: "1000",
    });
    return (
      res?.data?.data?.data?.map((d: any) => ({
        key: d._id,
        value: d.name,
      })) || []
    );
  }
  if (fieldKey === "associate") {
    const res = await getData(`${productVariantRoutes.getAll}`, {
      limit: "1000",
    });
    return (
      res?.data?.data?.map((d: any) => ({
        key: d._id,
        value: d.name,
      })) || []
    );
  }
  if (fieldKey === "companyType") {
    const res = await getData(`${companyTypeRoutes.getAll}`, {
      limit: "1000",
    });
    return (
      res?.data?.data?.data.map((d: any) => ({
        key: d._id,
        value: d.name,
      })) || []
    );
  }
  if (fieldKey === "designation") {
    const res = await getData(`${designationRoutes.getAll}`, {
      limit: "1000",
    });
    return (
      res?.data?.data?.data.map((d: any) => ({
        key: d._id,
        value: d.name,
      })) || []
    );
  }
  if (fieldKey === "enquiryProcessStatus") {
    const res = await getData(`${enquiryProcessStatusRoutes.getAll}`, {
      limit: "1000",
    });
    return (
      res?.data?.data?.data.map((d: any) => ({
        key: d._id,
        value: d.name,
      })) || []
    );
  }
  if (fieldKey.toLowerCase().includes("state")) {
    const res = await getData(`${stateRoutes.getAll}`, { limit: "1000" });
    return (
      res?.data?.data?.map((d: any) => ({
        key: d._id,
        value: d.name,
      })) || []
    );
  }
  if (parentKey) {
    if (fieldKey.toLowerCase().includes("district")) {
      const res = await getData(`${districtRoutes.getAll}`, {
        [parentKey]: parentValue,
        limit: "1000",
      });
      console.log("district");
      console.log(res);

      return (
        res?.data?.data?.map((d: any) => ({
          key: d._id,
          value: d.name,
        })) || []
      );
    }
    if (fieldKey.toLowerCase().includes("division")) {
      const res = await getData(`${divisionRoutes.getAll}`, {
        [parentKey]: parentValue,
        limit: "1000",
      });
      return (
        res?.data?.data?.map((d: any) => ({
          key: d._id,
          value: d.name,
        })) || []
      );
    }

    if (fieldKey.toLowerCase().includes("pincodeentry")) {
      const res = await getData(`${pincodeEntryRoutes.getAll}`, {
        [parentKey]: parentValue,
      });
      console.log("pincodeEntry");
      console.log(res);
      return (
        res?.data?.data?.map((p: any) => ({
          key: p._id,
          value: p.pincode + " - " + p.officename,
        })) || []
      );
    }
  }

  return [];
};
