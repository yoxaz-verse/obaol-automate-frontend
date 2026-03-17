"use client";

import React from "react";
import { Button, Input } from "@nextui-org/react";

type RulesSearchBarProps = {
  search: string;
  onSearch: (value: string) => void;
  onRestore: () => void;
  onAdd: () => void;
  restoreLoading?: boolean;
};

export default function RulesSearchBar({
  search,
  onSearch,
  onRestore,
  onAdd,
  restoreLoading,
}: RulesSearchBarProps) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <Input
        className="w-full md:w-80"
        placeholder="Search stages"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
      />
      <div className="flex items-center gap-2">
        <Button variant="flat" onPress={onRestore} isLoading={restoreLoading}>
          Restore Defaults
        </Button>
        <Button color="primary" onPress={onAdd}>
          Add Stage
        </Button>
      </div>
    </div>
  );
}
