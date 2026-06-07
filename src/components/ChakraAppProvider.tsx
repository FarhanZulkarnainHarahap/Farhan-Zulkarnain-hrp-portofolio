"use client";

import {
  ChakraProvider,
  ToastCloseTrigger,
  ToastDescription,
  ToastIndicator,
  ToastRoot,
  ToastTitle,
  Toaster,
  createToaster,
  defaultSystem,
} from "@chakra-ui/react";
import type { ReactNode } from "react";

export const toaster = createToaster({
  placement: "top-end",
  overlap: true,
});

export default function ChakraAppProvider({ children }: { children: ReactNode }) {
  return (
    <ChakraProvider value={defaultSystem}>
      {children}
      <Toaster toaster={toaster}>
        {(toast) => (
          <ToastRoot>
            <ToastIndicator />
            <div>
              {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
              {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
            </div>
            <ToastCloseTrigger />
          </ToastRoot>
        )}
      </Toaster>
    </ChakraProvider>
  );
}
