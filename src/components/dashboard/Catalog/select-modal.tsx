"use client";

import React, { useState, useContext } from "react";
import { Input, Button, Switch } from "@nextui-org/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios"; // or your own http client
import AuthContext from "@/context/AuthContext"; // Example context for user
import { apiRoutesByRole } from "@/utils/tableValues";
import { getData, patchData, postData } from "@/core/api/apiHandler";

// Mock helper calls – in your real code, you'd import from your apiHandler
// async function getData(url: string): Promise<AxiosResponse<any, any>> {
//   return axios.get(url);
// }
// async function patchData(
//   url: string,
//   payload: any
// ): Promise<AxiosResponse<any, any>> {
//   return axios.patch(url, payload);
// }
// async function postData(
//   url: string,
//   payload: any
// ): Promise<AxiosResponse<any, any>> {
//   return axios.post(url, payload);
// }

// ---------------------
//  Props / Interfaces
// ---------------------
interface SelectModalProps {
  variantRate: any; // The variantRate object to be handled
  refetchData?: () => void; // Optional callback to refresh parent
}

interface CommissionFormProps {
  record: any; // The displayedRate or variantRate we are editing
  isNewRecord: boolean; // If true => POST, else PATCH
  initialCommission: number;
  initialSelected: boolean;
  endpoint: string;
  userRole: string;
  refetchData?: () => void;
}

// ------------------------------------------------------------------------
//  MAIN SelectModal COMPONENT
// ------------------------------------------------------------------------
const SelectModal: React.FC<SelectModalProps> = ({
  variantRate,
  refetchData,
}) => {
  const { user } = useContext(AuthContext);

  const userRole = user?.role;
  const associateId = user?.id;

  // By default, for an Associate we want the displayedRate endpoint
  let apiEndpoint = apiRoutesByRole["displayedRate"];

  // If user is Admin => we do variantRate endpoint
  if (userRole === "Admin") {
    apiEndpoint = apiRoutesByRole["variantRate"];
  }

  // If user is Associate, we might fetch existing displayedRate
  // If user is Admin, we skip this fetch (just use variantRate directly).
  const shouldFetch =
    userRole === "Associate" && associateId && variantRate?._id;

  const { data } = useQuery({
    queryKey: [apiEndpoint, variantRate._id, associateId],
    queryFn: async () => {
      // e.g. /displayedRate?variantRate=xxx&associate=yyy
      const url = `${apiEndpoint}?variantRate=${variantRate._id}&associate=${associateId}`;
      return getData(url);
    },
    enabled: !!shouldFetch, // only fetch if valid
  });

  // If user is Admin => no "displayedRate" data needed
  let displayedRateRecord: any = null;
  let newRecordNeeded = false;

  if (userRole === "Associate") {
    // The API likely returns an array of displayedRates
    const arr = data?.data?.data?.data || [];
    // find the one whose variantRate._id matches

    displayedRateRecord = arr.find(
      (dr: any) =>
        (dr.variantRate && dr.variantRate._id === variantRate._id) ||
        (dr.variantRate &&
          variantRate.variantRate &&
          dr.variantRate._id === variantRate.variantRate._id)
    );
    newRecordNeeded = !displayedRateRecord; // if not found => we'll POST
  }

  // Decide which record we'll pass to CommissionForm:
  // Admin => the variantRate itself
  // Associate => either the found displayedRate or (none, so we'll create one)
  const recordToUse =
    userRole === "Admin" ? variantRate : displayedRateRecord ?? variantRate;

  // Are we updating or creating?
  const isNewRecord = userRole !== "Admin" && newRecordNeeded;

  // Commission / selected from the record
  const commissionVal = recordToUse?.commission ?? 0;
  const selectedVal = recordToUse?.selected ?? false;

  return (
    <div>
      {/* If we are Admin or Associate, we show the form. Otherwise, no form. */}
      {(userRole === "Admin" || userRole === "Associate") && (
        <CommissionForm
          record={recordToUse}
          isNewRecord={isNewRecord}
          initialCommission={commissionVal}
          initialSelected={selectedVal}
          endpoint={apiEndpoint}
          userRole={userRole ?? ""}
          refetchData={refetchData}
        />
      )}
    </div>
  );
};

export default SelectModal;

// ------------------------------------------------------------------------
//  CommissionForm
// ------------------------------------------------------------------------
const CommissionForm: React.FC<CommissionFormProps> = ({
  record,
  isNewRecord,
  initialCommission,
  initialSelected,
  endpoint,
  userRole,
  refetchData,
}) => {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const [commission, setCommission] = useState<number>(initialCommission);
  const [isSelected, setIsSelected] = useState<boolean>(initialSelected);
  const [buttonStatus, setButtonStatus] = useState<
    "Update" | "Updating" | "Updated" | "Failed"
  >("Update");

  // The actual mutation function
  async function mutationFn(): Promise<AxiosResponse<any, any>> {
    const payload: any = {
      commission,
      selected: isSelected,
    };

    if (isNewRecord) {
      // user is Associate, we do POST => /displayedRate
      // must also pass variantRate & associate
      payload.variantRate = record?._id; // The actual variantRate ID
      payload.associate = user?.id;
      return postData(endpoint, payload);
    } else {
      // either patch the displayedRate or patch the variantRate
      return patchData(`${endpoint}/${record._id}`, payload);
    }
  }

  // useMutation with generics: <Return, Error, Variables?, Context?>
  const updateMutation = useMutation<AxiosResponse<any, any>, Error, void>({
    mutationFn,
    onSuccess: () => {
      setButtonStatus("Updated");
      // Re-fetch the relevant query
      queryClient.refetchQueries({
        queryKey: [endpoint, record._id, user?.id],
      });
      if (refetchData) refetchData();
    },
    onError: () => {
      setButtonStatus("Failed");
    },
  });

  const handleSubmit = () => {
    setButtonStatus("Updating");
    updateMutation.mutate(); // no args => we typed "void" as input
  };

  return (
    <div className="flex items-end  gap-2">
      {/* Commission field */}
      <Input
        type="number"
        label="Commission"
        labelPlacement="outside"
        placeholder="0.00"
        size="sm"
        className="w-20"
        value={commission.toString()}
        startContent={
          <div className="pointer-events-none flex items-center">
            <span className="text-default-400 text-small">₹</span>
          </div>
        }
        onChange={(e) => {
          const val = parseFloat(e.target.value);
          setCommission(isNaN(val) ? 0.0 : val);
          setButtonStatus("Update");
        }}
      />

      {/* Selected switch */}
      <Switch
        color="warning"
        isSelected={isSelected}
        onChange={(e) => {
          setIsSelected(e.target.checked);
          setButtonStatus("Update");
        }}
      />

      {/* Action button */}
      <Button
        size="sm"
        color={buttonStatus === "Updated" ? "success" : "primary"}
        variant="bordered"
        onPress={handleSubmit}
        disabled={buttonStatus === "Updating"}
      >
        {buttonStatus}
      </Button>
    </div>
  );
};
