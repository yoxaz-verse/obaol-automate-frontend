"use client";

import React, { useState, useContext, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Input,
  Switch,
  Tooltip,
} from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import AuthContext from "@/context/AuthContext";
import { apiRoutesByRole } from "@/utils/tableValues";
import { getData, patchData, postData } from "@/core/api/apiHandler";

interface SelectModalProps {
  variantRate: any;
  refetchData?: () => void;
}

const HeroModal = Modal as any;

const SelectModal: React.FC<SelectModalProps> = ({
  variantRate,
  refetchData,
}) => {
  const { user } = useContext(AuthContext);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const queryClient = useQueryClient();

  const userRole = user?.role;
  const associateId = user?.id;

  // 1. Determine Endpoints
  let apiEndpoint = apiRoutesByRole["displayedRate"];
  if (userRole === "Admin") {
    apiEndpoint = apiRoutesByRole["variantRate"];
  }

  // 2. Fetch DisplayedRate if Associate
  const shouldFetch = userRole === "Associate" && associateId && variantRate?._id;
  const { data: fetchResult, isLoading: isFetching } = useQuery({
    queryKey: [apiEndpoint, variantRate._id, associateId],
    queryFn: async () => {
      const url = `${apiEndpoint}?variantRate=${variantRate._id}&associate=${associateId}`;
      return getData(url);
    },
    enabled: !!shouldFetch && isOpen,
  });

  // 3. Resolve Record to Use
  let displayedRateRecord: any = null;
  let newRecordNeeded = false;

  if (userRole === "Associate") {
    const arr = fetchResult?.data?.data?.data || [];
    displayedRateRecord = arr.find(
      (dr: any) =>
        (dr.variantRate && dr.variantRate._id === variantRate._id) ||
        (dr.variantRate?._id === variantRate.variantRate?._id)
    );
    newRecordNeeded = !displayedRateRecord;
  }

  const recordToUse = userRole === "Admin" ? variantRate : displayedRateRecord ?? variantRate;
  const isNewRecord = userRole !== "Admin" && newRecordNeeded;

  // 4. Form State
  const [commission, setCommission] = useState<number>(0);

  // Sync state when modal opens or data changes
  useEffect(() => {
    if (isOpen && recordToUse) {
      setCommission(recordToUse.commission ?? 0);
    }
  }, [isOpen, recordToUse]);

  // 5. Mutation
  const mutation = useMutation<AxiosResponse<any, any>, Error, void>({
    mutationFn: async () => {
      const payload: any = {
        commission,
        selected: true, // Auto-select when saved
      };

      if (isNewRecord) {
        payload.variantRate = variantRate?._id;
        payload.associate = user?.id;
        return postData(apiEndpoint, payload);
      } else {
        return patchData(`${apiEndpoint}/${recordToUse._id}`, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiEndpoint, variantRate._id, associateId] });
      if (refetchData) refetchData();
      onClose();
    },
  });

  const isReadOnly = userRole === "Employee";
  const canEdit = userRole === "Admin" || userRole === "Associate";

  if (!canEdit && !isReadOnly) return null;

  return (
    <>
      <Tooltip
        content={isReadOnly ? "View Rates" : "Configure Commission"}
        delay={0}
        closeDelay={0}
        color="foreground"
        showArrow
      >
        <Button
          isIconOnly
          size="sm"
          variant="flat"
          color={recordToUse?.selected ? "warning" : "default"}
          onPress={onOpen}
          className="rounded-full shadow-sm"
        >
          {isReadOnly ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          )}
        </Button>
      </Tooltip>

      <HeroModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        backdrop="blur"
        classNames={{
          base: "bg-background/80 backdrop-blur-lg border border-default-100",
          header: "border-b border-default-100",
          footer: "border-t border-default-100",
        }}
      >
        <ModalContent>
          {(onClose: any) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  {isReadOnly ? "Rate Overview" : "Rate Configuration"}
                </h3>
                <p className="text-xs text-default-400 font-medium">
                  {variantRate.productVariant?.name || "Product Variant"}
                </p>
              </ModalHeader>
              <ModalBody className="py-10">
                <div className="flex flex-col gap-6">
                  <Input
                    type="number"
                    label="Commission (₹)"
                    description="Enter the markup/commission for this variant"
                    placeholder="0.00"
                    variant="flat"
                    labelPlacement="inside"
                    size="lg"
                    isDisabled={isReadOnly}
                    value={commission.toString()}
                    startContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-lg">₹</span>
                      </div>
                    }
                    classNames={{
                      inputWrapper: "h-16 rounded-2xl bg-default-100/50 hover:bg-default-200/50 transition-background",
                      label: "font-bold text-foreground/80 mb-2",
                      description: "text-[10px] font-medium text-default-400",
                    }}
                    onValueChange={(val: any) => {
                      const v = parseFloat(val);
                      setCommission(isNaN(v) ? 0 : v);
                    }}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" color="danger" onPress={onClose} radius="full" className="font-semibold">
                  {isReadOnly ? "Close" : "Cancel"}
                </Button>
                {!isReadOnly && (
                  <Button
                    color="warning"
                    className="font-bold shadow-lg shadow-warning/20 px-8 text-white"
                    radius="full"
                    onPress={() => mutation.mutate()}
                    isLoading={mutation.isPending}
                  >
                    Save Changes
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </HeroModal>
    </>
  );
};

export default SelectModal;
