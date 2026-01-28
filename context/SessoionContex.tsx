"use client";

import { SessionProvider } from "next-auth/react";

type Props = {
  children?: React.ReactNode;
};

// i can use useSession hook now in children components
export const SessionProviderWrapper = ({ children }: Props) => {
  return <SessionProvider>{children}</SessionProvider>;
};
