import { PortalHost } from "@rn-primitives/portal";
import React from "react";
import Theme from "./theme";

export function Provider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Theme>
      {children}
      <PortalHost />
    </Theme>
  );
}
