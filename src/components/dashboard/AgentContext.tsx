"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface AgentContextType {
  isAgentOpen: boolean;
  toggleAgent: () => void;
  openAgent: () => void;
  closeAgent: () => void;
}

const AgentContext = createContext<AgentContextType>({
  isAgentOpen: false,
  toggleAgent: () => {},
  openAgent: () => {},
  closeAgent: () => {},
});

export function AgentProvider({ children }: { children: ReactNode }) {
  const [isAgentOpen, setIsAgentOpen] = useState(false);

  return (
    <AgentContext.Provider
      value={{
        isAgentOpen,
        toggleAgent: () => setIsAgentOpen((prev) => !prev),
        openAgent: () => setIsAgentOpen(true),
        closeAgent: () => setIsAgentOpen(false),
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}

export const useAgent = () => useContext(AgentContext);
