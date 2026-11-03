"use client";

import { Select, type SelectProps } from "@nextui-org/react";

export type AppSelectProps<T extends object = object> = SelectProps<T> & {
  menuMaxHeight?: number;
};

/**
 * Stable application select defaults. The menu is portalled, animation-free and
 * height-bounded so opening it never participates in the surrounding layout.
 */
export default function AppSelect<T extends object = object>({
  classNames,
  listboxProps,
  menuMaxHeight = 320,
  popoverProps,
  ...props
}: AppSelectProps<T>) {
  const incomingPopoverClasses = popoverProps?.classNames as Record<string, string> | undefined;
  const incomingItemClasses = listboxProps?.itemClasses as Record<string, string> | undefined;

  return (
    <Select<T>
      disableAnimation
      {...props}
      classNames={{
        ...classNames,
        trigger: [
          "min-h-12 rounded-xl border border-default-300 bg-content1 shadow-none",
          "transition-colors duration-150 hover:border-default-400",
          "data-[focus=true]:border-obaol-500 data-[focus=true]:ring-2 data-[focus=true]:ring-obaol-500/20",
          "data-[open=true]:border-obaol-500 data-[open=true]:ring-2 data-[open=true]:ring-obaol-500/20",
          classNames?.trigger,
        ].filter(Boolean).join(" "),
        value: ["text-sm font-semibold text-foreground", classNames?.value].filter(Boolean).join(" "),
        selectorIcon: ["text-default-500", classNames?.selectorIcon].filter(Boolean).join(" "),
      }}
      popoverProps={{
        placement: "bottom-start",
        shouldFlip: true,
        offset: 6,
        ...popoverProps,
        classNames: {
          ...incomingPopoverClasses,
          base: ["z-[140]", incomingPopoverClasses?.base].filter(Boolean).join(" "),
          content: [
            "min-w-[var(--trigger-width)] rounded-xl border border-default-200 bg-content1 p-1 shadow-lg",
            incomingPopoverClasses?.content,
          ].filter(Boolean).join(" "),
        },
      }}
      listboxProps={{
        ...listboxProps,
        style: { maxHeight: menuMaxHeight, overflowY: "auto", ...listboxProps?.style },
        itemClasses: {
          ...incomingItemClasses,
          base: [
            "min-h-10 rounded-lg px-3 text-sm text-foreground outline-none",
            "data-[hover=true]:bg-default-100 data-[focus=true]:bg-default-100",
            "data-[selected=true]:bg-obaol-500/15 data-[selected=true]:text-foreground",
            incomingItemClasses?.base,
          ].filter(Boolean).join(" "),
        },
      }}
    />
  );
}
