import React from "react";
import { FiClock, FiCheck, FiX, FiLoader } from "react-icons/fi";
import { Status } from "@/core/enum/status.enum";

interface StatusBadgeProps {
  status: Status;
  size?: "sm" | "md";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "md" }) => {
  const isSmall = size === "sm";
  const iconSize = isSmall ? 10 : 14;

  switch (status) {
    case Status.PENDENTE:
      return (
        <span className="flex items-center bg-orange-50 text-orange-700 rounded-md px-2 py-1 text-xs font-medium">
          <FiClock className="mr-1" size={iconSize} /> Pendente
        </span>
      );
    case Status.EM_ANDAMENTO:
      return (
        <span className="flex items-center bg-blue-50 text-blue-700 rounded-md px-2 py-1 text-xs font-medium">
          <FiLoader className="mr-1" size={iconSize} /> Em andamento
        </span>
      );
    case Status.CONCLUIDO:
      return (
        <span className="flex items-center bg-green-50 text-green-700 rounded-md px-2 py-1 text-xs font-medium">
          <FiCheck className="mr-1" size={iconSize} /> Concluído
        </span>
      );
    case Status.CANCELADO:
      return (
        <span className="flex items-center bg-slate-100 text-slate-700 rounded-md px-2 py-1 text-xs font-medium">
          <FiX className="mr-1" size={iconSize} /> Cancelado
        </span>
      );
    default:
      return null;
  }
};
