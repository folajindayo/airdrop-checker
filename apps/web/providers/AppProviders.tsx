"use client";

import React, { ReactNode } from "react";
import { AirdropProvider } from "@/contexts/AirdropContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

interface AppProvidersProps {
  children: ReactNode;
  userId?: string;
}

export function AppProviders({ children, userId }: AppProvidersProps) {
  return (
    <AirdropProvider>
      <NotificationProvider userId={userId}>
        {children}
      </NotificationProvider>
    </AirdropProvider>
  );
}

