import * as Popover from "@radix-ui/react-popover";
import React from "react";

export function PopContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="bn-pop bn-z-pop rounded-lg overflow-hidden">
      {children}
    </div>
  );
}

export { Popover };
