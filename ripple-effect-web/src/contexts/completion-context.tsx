"use client";

import React, { createContext, useContext, useState } from "react";

type CompletionContextProviderProps = {
  children: React.ReactNode;
}

type CompletionContext = {
  completion: string;
  setCompletion: React.Dispatch<React.SetStateAction<string>>;
  graphCompletion: string;
  setGraphCompletion: React.Dispatch<React.SetStateAction<string>>;
}

export const CompletionContext = createContext<CompletionContext | null>(null);

export default function CompletionContextProvider({
  children,
}: CompletionContextProviderProps) {
  const [completion, setCompletion] = useState("Send an input to get started!");
  const [graphCompletion, setGraphCompletion] = useState("");

  return (
    <CompletionContext.Provider
      value={{
        completion,
        setCompletion,
        graphCompletion,
        setGraphCompletion
      }}
    >
      {children}
    </CompletionContext.Provider>
  );
}

export function useCompletionContext() {
  const context = useContext(CompletionContext);
  if (!context) {
    throw new Error(
      "useCompletionContext must be used within a CompletionContextProvider!"
    );
  }
  return context;
}
