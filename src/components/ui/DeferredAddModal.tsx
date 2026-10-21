"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@nextui-org/react";
import { LuPlus } from "react-icons/lu";
import type { AddModalProps } from "@/data/interface-data";

const AddModal = dynamic(() => import("@/components/CurdTable/add-model"), {
  ssr: false,
});

type DeferredAddModalProps = AddModalProps & {
  onSuccess?: (data: any) => void;
};

export default function DeferredAddModal(props: DeferredAddModalProps) {
  const [requested, setRequested] = useState(false);

  if (requested) {
    return <AddModal {...props} defaultOpen hideTrigger onRequestClose={() => setRequested(false)} />;
  }

  return (
    <div className="flex justify-end pr-2 group">
      <Button
        size="sm"
        onPress={() => setRequested(true)}
        variant="flat"
        color="warning"
        className="dashboard-add-button h-9 rounded-xl px-4 font-bold tracking-tight transition-all duration-200 hover:bg-obaol-500 hover:text-white"
        startContent={<LuPlus className="text-lg font-black" />}
      >
        {props.buttonLabel || (props.name ? `Add ${props.name}` : `Create ${props.currentTable}`)}
      </Button>
    </div>
  );
}
