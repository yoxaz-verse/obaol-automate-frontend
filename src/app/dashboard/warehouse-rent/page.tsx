"use client";

import React from "react";
import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { useRouter } from "next/navigation";
import Title from "@/components/titles";
import { FiArrowRight } from "react-icons/fi";

export default function WarehouseRentPage() {
  const router = useRouter();

  return (
    <section className="w-full min-h-screen p-6 md:p-10 bg-background text-foreground">
      <Title title="Warehouse Space" />
      <Card className="border border-default-200/60 bg-content1/70 backdrop-blur-md rounded-2xl max-w-3xl">
        <CardHeader className="px-6 pt-6">
          <div>
            <h1 className="text-xl font-black tracking-tight">Warehouse Requests Moved</h1>
            <p className="text-sm text-default-500 mt-2">
              Warehouse service requests have been migrated to External Orders. Use External Orders to create,
              manage, and track warehouse engagements going forward.
            </p>
          </div>
        </CardHeader>
        <CardBody className="px-6 pb-6">
          <Button
            color="primary"
            className="h-10 px-5 rounded-xl font-bold uppercase tracking-widest text-xs"
            endContent={<FiArrowRight size={16} />}
            onPress={() => router.push("/dashboard/external-orders")}
          >
            Go To External Orders
          </Button>
        </CardBody>
      </Card>
    </section>
  );
}
