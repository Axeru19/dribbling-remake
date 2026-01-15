"use client";

import { fields } from "@prisma/client";
import { createContext, useContext } from "react";

const FieldsContext = createContext<fields[]>([]);

export function useFields() {
  return useContext(FieldsContext);
}

export function FieldsProvider({
  value,
  children,
}: {
  value: fields[];
  children: React.ReactNode;
}) {
  return (
    <FieldsContext.Provider value={value}>{children}</FieldsContext.Provider>
  );
}
