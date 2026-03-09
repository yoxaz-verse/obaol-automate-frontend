import React from "react";
import InventoryList from "@/components/dashboard/Inventory/InventoryList";

export default function InventoryPage() {
    return (
        <div className="flex flex-col items-center w-full">
            <div className="w-full px-4 md:px-0 md:w-[95%]">
                <div className="min-h-[70vh] pb-10">
                    <div className="mb-8 mt-4">
                        <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase">
                            Inventory <span className="text-warning-500">Management</span>
                        </h1>
                        <p className="text-sm text-default-400 mt-1">
                            Track and manage your physical stock levels across warehouses.
                        </p>
                    </div>
                    <InventoryList />
                </div>
            </div>
        </div>
    );
}
