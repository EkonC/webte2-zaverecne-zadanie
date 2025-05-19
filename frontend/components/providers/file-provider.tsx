"use client";

import type React from "react";
import { createContext, useState, useContext, ReactNode } from "react";

interface FileContextType {
  sharedFile: File | null;
  setSharedFile: (file: File | null) => void;
  toolTarget: string | null;
  setToolTarget: (target: string | null) => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider = ({ children }: { children: ReactNode }) => {
  const [sharedFile, setSharedFile] = useState<File | null>(null);
  const [toolTarget, setToolTarget] = useState<string | null>(null);

  return (
    <FileContext.Provider value={{ sharedFile, setSharedFile, toolTarget, setToolTarget }}>
      {children}
    </FileContext.Provider>
  );
};

export const useFile = (): FileContextType => {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error("useFile must be used within a FileProvider");
  }
  return context;
};