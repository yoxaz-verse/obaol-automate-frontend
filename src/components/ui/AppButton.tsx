"use client";

import { Button, type ButtonProps } from "@nextui-org/react";

export type AppButtonIntent =
  | "primary"
  | "secondary"
  | "tertiary"
  | "danger"
  | "success"
  | "warning"
  | "icon";

export interface AppButtonProps extends ButtonProps {
  intent?: AppButtonIntent;
}

const intentProps: Record<AppButtonIntent, Pick<ButtonProps, "color" | "variant">> = {
  primary: { color: "primary", variant: "solid" },
  secondary: { color: "primary", variant: "bordered" },
  tertiary: { color: "default", variant: "flat" },
  danger: { color: "danger", variant: "solid" },
  success: { color: "success", variant: "solid" },
  warning: { color: "warning", variant: "solid" },
  icon: { color: "default", variant: "light" },
};

/**
 * The application-wide action primitive. It keeps NextUI's polymorphic/link,
 * loading, icon, keyboard, and press behavior while enforcing one visual
 * hierarchy across public, authentication, and dashboard surfaces.
 */
export function AppButton({ intent = "primary", className = "", ...props }: AppButtonProps) {
  const defaults = intentProps[intent];
  return (
    <Button
      {...defaults}
      {...props}
      className={`app-button app-button--${intent} ${className}`.trim()}
    />
  );
}

export default AppButton;
