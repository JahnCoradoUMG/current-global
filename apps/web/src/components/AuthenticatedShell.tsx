"use client";

import type { ReactNode } from "react";
import { AppNav } from "./AppNav";
import { SocketProvider } from "./SocketProvider";

export function AuthenticatedShell({
  username,
  displayName,
  avatarUrl,
  children,
}: {
  username?: string;
  displayName?: string;
  avatarUrl?: string | null;
  children: ReactNode;
}) {
  return (
    <SocketProvider>
      <AppNav username={username} displayName={displayName} avatarUrl={avatarUrl}>
        {children}
      </AppNav>
    </SocketProvider>
  );
}
