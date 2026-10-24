"use client";

import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tooltip, useDisclosure } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { FiInfo, FiPackage } from "react-icons/fi";
import { LuBox } from "react-icons/lu";
import { LISTING_ACTION_CLASS } from "../constants";
import type { SampleRate } from "./domain";
import { useSampleRequest } from "./useSampleRequest";
import { SampleRequestFields } from "./SampleRequestFields";
import { CooldownWarning, SampleConfirmation, SampleSuccess } from "./SampleRequestStates";

export interface RequestSampleButtonProps { variantRate: SampleRate }

export const RequestSampleButton = ({ variantRate }: RequestSampleButtonProps) => {
  const disclosure = useDisclosure();
  const router = useRouter();
  const sample = useSampleRequest(variantRate, disclosure.isOpen);
  if (!["associate", "admin", "operator", "team"].includes(sample.role)) return null;

  return (
    <div className="flex flex-col items-center gap-2">
      <Tooltip content={<span className="px-1 text-[10px] font-black uppercase tracking-widest">Request Sample Protocol</span>} closeDelay={0}>
        <Button isIconOnly size="sm" variant="flat" color={sample.cooldown.active ? "success" : "warning"} onPress={disclosure.onOpen} isDisabled={sample.cooldown.active} aria-label={sample.cooldown.label} className={`${LISTING_ACTION_CLASS} p-0 ${sample.cooldown.active ? "opacity-60" : ""}`}>
          <LuBox size={22} className={sample.cooldown.active ? "text-success-600/80" : "text-obaol-600/80"} />
        </Button>
      </Tooltip>
      <Modal placement="center" isOpen={disclosure.isOpen} onOpenChange={disclosure.onOpenChange} isDismissable={false} isKeyboardDismissDisabled size="md" backdrop="blur" className="mx-4 text-foreground">
        <ModalContent className="max-h-[95vh] overflow-hidden rounded-[2.5rem] border border-divider bg-gradient-to-br from-background to-content1 shadow-2xl">
          {(close) => (
            <>
              <ModalHeader className="flex gap-3 border-b border-divider/50 px-8 pb-4">
                <div className="rounded-2xl bg-orange-500/10 p-2.5 text-orange-500"><FiPackage size={22} /></div>
                <div><h3 className="text-xl font-black uppercase tracking-tight">Request Sample</h3><p className="text-[10px] font-bold uppercase tracking-widest text-default-400">Logistics Protocol & Sample Dispatch</p></div>
              </ModalHeader>
              <ModalBody className="flex flex-col gap-6 overflow-y-auto px-8 py-8">
                {!sample.success && sample.cooldown.active && <CooldownWarning label={sample.cooldown.label} />}
                {sample.success ? (
                  <SampleSuccess close={close} navigate={() => { close(); router.push("/dashboard/sample-requests"); }} />
                ) : sample.confirming ? (
                  <SampleConfirmation form={sample.form} states={sample.states} districts={sample.districts} includeBuyer={sample.includeBuyer} />
                ) : (
                  <>
                    <SampleRequestFields
                      form={sample.form} includeBuyer={sample.includeBuyer} states={sample.states} districts={sample.districts}
                      divisions={sample.divisions} pincodes={sample.pincodes} divisionsLoading={sample.divisionsLoading}
                      pincodesLoading={sample.pincodesLoading} queryError={sample.queryError} retry={sample.retry}
                      update={sample.update} selectState={sample.resetAfterState} selectDistrict={sample.resetAfterDistrict} selectDivision={sample.resetAfterDivision}
                    />
                    <div className="flex items-start gap-4 rounded-[1.5rem] border border-orange-500/10 bg-orange-500/5 p-4"><FiInfo className="mt-0.5 shrink-0 text-orange-500" size={18} /><p className="text-[11px] font-semibold leading-relaxed text-default-600">Confirming this protocol will notify the manufacturer to prepare sample dispatch. Standard minimum quantities apply.</p></div>
                  </>
                )}
              </ModalBody>
              {!sample.success && (
                <ModalFooter className="flex items-center justify-between border-t border-divider/50 px-8 py-4">
                  <Button variant="light" onPress={() => sample.confirming ? sample.setConfirming(false) : close()} isDisabled={sample.submitting}>{sample.confirming ? "Back to Edit" : "Cancel"}</Button>
                  <Button size="lg" color={sample.confirming ? "success" : "warning"} onPress={() => sample.confirming ? void sample.submit() : sample.review()} isLoading={sample.submitting} isDisabled={sample.submitting || sample.cooldown.active}>{sample.confirming ? "Authorize Sample Dispatch" : "Request Sample Dispatch"}</Button>
                </ModalFooter>
              )}
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
