import { Status } from "@/core/enum/status.enum";
import { JSX } from "react";
import { FiAlertCircle, FiClock } from "react-icons/fi";

export enum DateStatus {
  VENCIDO = "vencido",
  ALERTA = "alerta",
  NORMAL = "normal",
}

export interface DateStatusInfo {
  status: DateStatus;
  daysLeft?: number;
  textColor: string;
  bgColor: string;
  icon: JSX.Element | null;
  text: string;
}

export const useDateStatus = (dateStr: string, taskStatus: Status): DateStatusInfo => {
  const getDateStatus = (): { status: DateStatus; daysLeft?: number } => {
    if (taskStatus === Status.CONCLUIDO) return { status: DateStatus.NORMAL };
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [dia, mes, ano] = dateStr.split("/").map(Number);

    const targetDate = new Date(ano, mes - 1, dia);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { status: DateStatus.VENCIDO, daysLeft: diffDays };
    if (diffDays <= 7) return { status: DateStatus.ALERTA, daysLeft: diffDays };
    return { status: DateStatus.NORMAL, daysLeft: diffDays };
  };

  const getDateColors = (status: DateStatus) => {
    switch (status) {
      case DateStatus.VENCIDO:
        return {
          textColor: "text-red-600",
          bgColor: "bg-red-50",
          icon: <FiAlertCircle size={14} className="text-red-500" />,
        };
      case DateStatus.ALERTA:
        return {
          textColor: "text-amber-600",
          bgColor: "bg-amber-50",
          icon: <FiClock size={14} className="text-amber-500" />,
        };
      default:
        return { textColor: "text-slate-600", bgColor: "", icon: null };
    }
  };

  const getDateText = (status: DateStatus, daysLeft?: number): string => {
    if (status === DateStatus.VENCIDO) {
      const days = Math.abs(daysLeft || 0);
      if (days === 0) return "Venceu hoje";
      if (days === 1) return "Venceu ontem";
      return `Vencida há ${days} dias`;
    }

    if (status === DateStatus.ALERTA) {
      if (daysLeft === 0) return "Vence hoje";
      if (daysLeft === 1) return "Vence amanhã";
      return `Vence em ${daysLeft} dias`;
    }

    return dateStr;
  };

  const dateInfo = getDateStatus();
  const colors = getDateColors(dateInfo.status);
  const text = getDateText(dateInfo.status, dateInfo.daysLeft);

  return {
    ...dateInfo,
    ...colors,
    text,
  };
};
