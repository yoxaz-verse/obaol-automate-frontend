import AddModal from "@/components/CurdTable/add-model";
import CommonTable from "@/components/CurdTable/common-table";
import QueryComponent from "@/components/queryComponent";
import Title from "@/components/titles";
import AuthContext from "@/context/AuthContext";
import { getData, patchData, postData } from "@/core/api/apiHandler";
import {
  associateRoutes,
  displayedRateRoutes,
  locationRoutes,
} from "@/core/api/apiRoutes";
import {
  apiRoutesByRole,
  generateColumns,
  initialTableConfig,
} from "@/utils/tableValues";
import {
  Accordion,
  AccordionItem,
  Button,
  Divider,
  Spacer,
  Tab,
  Tabs,
  toast,
  useDisclosure,
} from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useContext, useEffect, useState } from "react";
import SelectModal from "./select-modal";
import { Input, Switch } from "@nextui-org/react";
import VariantRate from "./variant-rate";

const productVariantTabs = [
  { key: "productVariant", title: "Product Variant" }, // Translate Title
  // { key: "locationManager", title: "Product Associate" }, // Translate Title
  // { key: "locationType", title: "Product Location" }, // Translate Title
];

interface IProductList {
  product: any;
}

export const ProductList = ({ product }: IProductList) => {
  const [locationTab, setLocationTab] = React.useState("location");
  const tableConfig = { ...initialTableConfig }; // Create a copy to avoid mutations

  const { data: locationResponse } = useQuery({
    queryKey: ["Location"],
    queryFn: () => getData(locationRoutes.getAll),
    // enabled: essentialName === "associateCompany",
  });

  const locationValue = locationResponse?.data?.data.data;
  const refetchData = () => {
    // Implement refetch logic if necessary
  };
  return (
    <>
      {product ? (
        <section>
          <Title title={product.name} /> {/* Translate */}
          <Divider />
          <Spacer y={1} />
          {/* <Tabs
            aria-label={product.name + " Variant Tabs"} // Translate
            selectedKey={locationTab}
            onSelectionChange={(key) => setLocationTab(key as string)}
          >
            {productVariantTabs.map((tab) => (
              <Tab key={tab.key} title={tab.title}>
                {tab.key === "productVariant" && (
                  // <LocationTabContent currentType="all" />
                  <> */}
                    <QueryComponent
                      api={apiRoutesByRole["productVariant"]}
                      queryKey={[
                        "productVariant",
                        apiRoutesByRole["productVariant"],
                        product._id,
                      ]}
                      page={1}
                      limit={100}
                      additionalParams={{
                        product: product._id,
                      }}
                    >
                      {(productVariantData: any) => {
                        var productVariantFormFields =
                          tableConfig["productVariant"];
                        const productVariantValue = productVariantData || [];

                        if (locationValue) {
                          const locationValues = locationValue.map(
                            (location: any) => ({
                              key: String(location._id),
                              value: location.name,
                            })
                          );
                          productVariantFormFields =
                            productVariantFormFields.map((field: any) =>
                              field.key === "locations"
                                ? {
                                    ...field,
                                    values: locationValues,
                                  }
                                : field
                            );
                        }
                        // const subCategoryValues = subCategoryValue.map(
                        //   (subCategory: any) => ({
                        //     key: String(subCategory._id),
                        //     value: subCategory.name,
                        //   })
                        // );

                        return (
                          <section>
                            {productVariantFormFields && (
                              <AddModal
                                name="Product Variant"
                                currentTable={"ProductVariant"}
                                formFields={productVariantFormFields} // Pass the updated formFields
                                apiEndpoint={apiRoutesByRole["productVariant"]}
                                refetchData={refetchData}
                                additionalVariable={{
                                  product: product._id,
                                }}
                              />
                            )}
                            <Spacer y={1} />
                            {productVariantValue && (
                              <Accordion variant="splitted">
                                {productVariantValue?.map(
                                  (productVariantValue: any) => (
                                    <AccordionItem
                                      key={productVariantValue._id}
                                      aria-label={productVariantValue.name}
                                      title={productVariantValue.name}
                                      className="opacity-60 hover:opacity-100 "
                                    >
                                      <VariantRate
                                        productVariant={productVariantValue}
                                        rate="variantRate"
                                      />
                                    </AccordionItem>
                                  )
                                )}
                              </Accordion>
                            )}
                          </section>
                        );
                      }}
                    </QueryComponent>{" "}
                  {/* </>
                )}
                {tab.key === "locationType" && (
                  <div>ssss</div>
                  //   <EssentialTabContent essentialName="locationType" />
                )}
                {tab.key === "locationManager" && <div>ssss</div>}
              </Tab>
            ))}
          </Tabs>{" "} */}
        </section>
      ) : (
        <Title title="Select Any Product" />
      )}
    </>
  );
};
