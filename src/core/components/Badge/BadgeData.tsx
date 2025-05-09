import React from "react";
import { Status } from "@/core/enum/status.enum";
import { useDateStatus } from "@/core/hooks/useDateStatus";
import { formatDate } from "@/core/utils/formatDate";

interface BadgeDateProps {
  date: string | Date;
  status?: Status;
  showFullDate?: boolean;
  className?: string;
}

export const BadgeDate: React.FC<BadgeDateProps> = ({
  date,
  status = Status.PENDENTE,
  showFullDate = false,
  className = "",
}) => {
  const dateStr = typeof date === "string" ? date : formatDate(date.toISOString());

  const dateInfo = useDateStatus(dateStr, status);

  return (
    <div
      className={`flex items-center gap-1 ${dateInfo.textColor} ${dateInfo.bgColor} px-1.5 py-0.5 rounded-full ${className}`}
    >
      {dateInfo.icon}
      <span className="text-xs font-medium">{showFullDate ? dateStr : dateInfo.text}</span>
    </div>
  );
};
