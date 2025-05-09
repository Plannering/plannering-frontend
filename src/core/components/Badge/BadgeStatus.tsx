import React from "react";
import { FiClock, FiCheck, FiX, FiLoader } from "react-icons/fi";
import { Status } from "@/core/enum/status.enum";

interface StatusBadgeProps {
  status: Status;
  quantidade?: number;
  size?: "sm" | "md";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, quantidade, size = "md" }) => {
  const isSmall = size === "sm";
  const iconSize = isSmall ? 10 : 14;

  switch (status) {
    case Status.PENDENTE:
      return (
        <span className="flex items-center bg-amber-50 text-amber-600 rounded-md px-2 py-1 text-xs font-medium">
          <FiClock className="mr-1" size={iconSize} /> Pendente <span>{quantidade}</span>
        </span>
      );
    case Status.EM_ANDAMENTO:
      return (
        <span className="flex items-center bg-sky-50 text-sky-600 rounded-md px-2 py-1 text-xs font-medium">
          <FiLoader className="mr-1" size={iconSize} /> Em andamento <span>{quantidade}</span>
        </span>
      );
    case Status.CONCLUIDO:
      return (
        <span className="flex items-center bg-green-50 text-green-600 rounded-md px-2 py-1 text-xs font-medium">
          <FiCheck className="mr-1" size={iconSize} /> Concluído <span>{quantidade}</span>
        </span>
      );
    case Status.CANCELADO:
      return (
        <span className="flex items-center bg-slate-100 text-slate-600 rounded-md px-2 py-1 text-xs font-medium">
          <FiX className="mr-1" size={iconSize} /> Cancelado <span>{quantidade}</span>
        </span>
      );
    default:
      return null;
  }
};
