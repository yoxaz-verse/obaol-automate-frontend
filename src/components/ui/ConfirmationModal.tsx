"use client";

import type { ReactNode } from "react";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react";
import AppButton from "./AppButton";
import AsyncActionButton, { type AsyncActionLabels, type AsyncActionState } from "./AsyncActionButton";
import ActionFeedback from "./ActionFeedback";

type Props = {
  isOpen: boolean;
  title: ReactNode;
  children: ReactNode;
  state: AsyncActionState;
  labels: AsyncActionLabels;
  feedback?: ReactNode;
  destructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmationModal({ isOpen, title, children, state, labels, feedback, destructive, onConfirm, onClose }: Props) {
  const pending = state === "validating" || state === "processing";
  return (
    <Modal isOpen={isOpen} onClose={onClose} isDismissable={!pending} isKeyboardDismissDisabled={pending}>
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>
          {children}
          <ActionFeedback state={state}>{feedback}</ActionFeedback>
        </ModalBody>
        <ModalFooter>
          <AppButton intent="tertiary" onPress={onClose} isDisabled={pending}>Cancel</AppButton>
          <AsyncActionButton intent={destructive ? "danger" : "primary"} state={state} labels={labels} onPress={onConfirm} />
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
