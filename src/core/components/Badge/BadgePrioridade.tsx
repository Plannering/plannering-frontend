import React from "react";
import { Prioridade } from "@/core/enum/prioridades.enum";

interface PrioridadeBadgeProps {
  prioridade: Prioridade | string;
}

export const PrioridadeBadge: React.FC<PrioridadeBadgeProps> = ({ prioridade }) => {
  const prioridadeLower = typeof prioridade === "string" ? prioridade.toLowerCase() : String(prioridade).toLowerCase();

  switch (prioridadeLower) {
    case "baixa":
      return <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">Baixa</span>;
    case "media":
      return <span className="px-2 py-0.5 bg-amber-50 text-amber-500 rounded-md text-xs font-medium">Média</span>;
    case "alta":
      return <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded-md text-xs font-medium">Alta</span>;
    case "urgente":
      return <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md text-xs font-medium">Urgente</span>;
    default:
      return null;
  }
};
