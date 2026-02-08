// src/contexts/ComponentStateContext.tsx
'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface SelectedPR {
  number: number;
  repo: string;
}

interface ComponentState {
  selectedPR: SelectedPR | null;
  setSelectedPR: (pr: SelectedPR | null) => void;
  
  // Can expand with more states as needed
  selectedFile: string | null;
  setSelectedFile: (file: string | null) => void;
}

const ComponentStateContext = createContext<ComponentState | undefined>(undefined);

interface ComponentStateProviderProps {
  children: ReactNode;
}

export function ComponentStateProvider({ children }: ComponentStateProviderProps) {
  const [selectedPR, setSelectedPR] = useState<SelectedPR | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const value: ComponentState = {
    selectedPR,
    setSelectedPR,
    selectedFile,
    setSelectedFile,
  };

  return (
    <ComponentStateContext.Provider value={value}>
      {children}
    </ComponentStateContext.Provider>
  );
}

export function useComponentState() {
  const context = useContext(ComponentStateContext);
  if (context === undefined) {
    throw new Error('useComponentState must be used within a ComponentStateProvider');
  }
  return context;
}
