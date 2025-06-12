import { getData } from "@/core/api/apiHandler";
import {
  adminRoutes,
  associateCompanyRoutes,
  associateRoutes,
  cityRoutes,
  districtRoutes,
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
    console.log(res);

    return (
      res?.data?.data?.data?.map((d: any) => ({
        key: d._id,
        value: d.name,
      })) || []
    );
  }

  if (fieldKey.toLowerCase().includes("associateCompany")) {
    const res = await getData(`${associateCompanyRoutes.getAll}`, {
      limit: "1000",
    });
    console.log(res);

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
    console.log(res);

    return (
      res?.data?.data?.data?.map((d: any) => ({
        key: d._id,
        value: d.name,
      })) || []
    );
  }
  if (fieldKey.toLowerCase().includes("productVariant")) {
    const res = await getData(`${productVariantRoutes.getAll}`, {
      limit: "1000",
    });
    console.log(res);

    return (
      res?.data?.data?.map((d: any) => ({
        key: d._id,
        value: d.name,
      })) || []
    );
  }
  if (fieldKey.toLowerCase().includes("state")) {
    const res = await getData(`${stateRoutes.getAll}`, { limit: "1000" });
    console.log(res);

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

    if (fieldKey.toLowerCase().includes("city")) {
      const res = await getData(`${cityRoutes.getAll}`, {
        [parentKey]: parentValue,
      });
      console.log("city");
      console.log(res);
      return (
        res?.data?.data?.map((c: any) => ({
          key: c._id,
          value: c.name,
        })) || []
      );
    }
  }

  return [];
};
