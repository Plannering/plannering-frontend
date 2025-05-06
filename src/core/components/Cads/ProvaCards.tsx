import React, { useState } from "react";
import Link from "next/link";
import { FiMoreVertical, FiEye, FiTrash2, FiCheckCircle, FiAlertCircle, FiClock, FiAward } from "react-icons/fi";
import { Status } from "@/core/enum/status.enum";
import { formatDate } from "../../utils/formatDate";
import { StatusBadge } from "../Badge/BadgeStatus";
import { MateriaBadge } from "../Badge/BadgeMateria";
import ModalStatus from "../Modal/ModalComplet";
import { Prova } from "@/core/types/provas";

interface ProvaCardProps {
  id: string;
  titulo: string;
  descricao?: string;
  data: string | Date;
  duracao: number;
  nota: number;
  local: string;
  status: Status;
  materia?: {
    nome: string;
    cor: string;
  };
  onDelete: (id: string) => void;
  onStatusChange: (prova: Prova) => Promise<void>;
  updateLoading?: string | null;
}

enum DateStatus {
  PASSADO = "passado",
  ALERTA = "alerta",
  NORMAL = "normal",
}

export const ProvaCard: React.FC<ProvaCardProps> = ({
  id,
  titulo,
  descricao,
  data,
  nota,
  local,
  status,
  materia,
  onDelete,
  onStatusChange,
  updateLoading = null,
}) => {
  const [openOptionsMenu, setOpenOptionsMenu] = useState(false);
  const [isStatusModalOpen, setStatusModalOpen] = useState(false);

  const dataStr = typeof data === "string" ? data : data.toISOString();

  const getDateStatus = (dateStr: string, provaStatus: Status): { status: DateStatus; daysLeft?: number } => {
    if (provaStatus === Status.CONCLUIDO) return { status: DateStatus.NORMAL };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { status: DateStatus.PASSADO, daysLeft: diffDays };
    if (diffDays <= 7) return { status: DateStatus.ALERTA, daysLeft: diffDays };
    return { status: DateStatus.NORMAL, daysLeft: diffDays };
  };

  const dateInfo = getDateStatus(dataStr, status);
  const isConcluida = status === Status.CONCLUIDO;

  const handleCompleteProva = async (id: string) => {
    const provaCompleta: Prova = {
      id,
      titulo,
      descricao,
      data: dataStr,
      nota,
      local,
      status: status,
      materiaId: materia?.nome,
      dataCriacao: "",
      dataAtualizacao: "",
      usuarioId: "",
    };

    await onStatusChange(provaCompleta);
  };

  const handleCloseOptionsMenu = () => {
    setOpenOptionsMenu(false);
  };

  React.useEffect(() => {
    if (openOptionsMenu) {
      document.addEventListener("click", handleCloseOptionsMenu);
      return () => {
        document.removeEventListener("click", handleCloseOptionsMenu);
      };
    }
  }, [openOptionsMenu]);

  const getDateColors = () => {
    switch (dateInfo.status) {
      case DateStatus.PASSADO:
        return {
          textColor: "text-slate-600",
          bgColor: "bg-slate-50",
          icon: <FiAlertCircle size={14} className="text-slate-500" />,
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

  const getDateText = () => {
    if (dateInfo.status === DateStatus.PASSADO) {
      const days = Math.abs(dateInfo.daysLeft || 0);
      if (days === 0) return "Foi hoje";
      if (days === 1) return "Foi ontem";
      return `Há ${days} dias`;
    }

    if (dateInfo.status === DateStatus.ALERTA) {
      if (dateInfo.daysLeft === 0) return "Hoje";
      if (dateInfo.daysLeft === 1) return "Amanhã";
      return `Em ${dateInfo.daysLeft} dias`;
    }

    return formatDate(dataStr);
  };

  const dateColors = getDateColors();

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden 
                  transition-all duration-150 hover:shadow-md 
                  ${isConcluida ? "opacity-75" : ""}`}
      style={{
        borderLeft: `3px solid ${materia?.cor || "#3b82f6"}`,
      }}
    >
      {/* Card Header */}
      <div className="p-2.5 flex justify-between items-center">
        <Link
          href={`/admin/provas/${id}`}
          className="font-medium text-sm text-gray-700 line-clamp-1 hover:text-sky-600 transition-colors"
        >
          {titulo}
        </Link>

        <div className="dropdown relative">
          <button
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full"
            aria-label="Opções"
            onClick={(e) => {
              e.stopPropagation();
              setOpenOptionsMenu(!openOptionsMenu);
            }}
          >
            <FiMoreVertical size={14} />
          </button>

          {openOptionsMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-md shadow-md z-50 py-1 min-w-[150px]">
              <Link
                href={`/admin/provas/${id}`}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center text-slate-700"
              >
                <FiEye className="mr-2" size={12} /> Visualizar
              </Link>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenOptionsMenu(false);
                  onDelete(id);
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center text-red-600"
              >
                <FiTrash2 className="mr-2" size={12} /> Excluir
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="px-2.5 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {materia ? (
            <MateriaBadge nome={materia.nome} cor={materia.cor} />
          ) : (
            <span className="text-slate-400 italic text-xs">Sem matéria</span>
          )}
        </div>

        <div
          className={`flex items-center gap-1 ${dateColors.textColor} ${dateColors.bgColor} px-1.5 py-0.5 rounded-full`}
        >
          {dateColors.icon}
          <span className="text-xs font-medium">{getDateText()}</span>
        </div>
      </div>

      <div className="px-2.5 py-1.5 flex justify-between gap-1.5 text-xs">
        <div className="flex items-center gap-1 text-slate-600">
          <FiAward size={12} className="text-amber-500" />
          <span>Nota: {nota}</span>
        </div>
      </div>

      {descricao && (
        <div className="px-2.5 py-1 flex justify-between items-center">
          <p className="text-xs text-slate-500 line-clamp-1" title={descricao}>
            {descricao}
          </p>
        </div>
      )}

      <div className="px-2.5 py-2 border-t border-slate-100 flex justify-between items-center">
        <StatusBadge status={status} />

        <div className="flex items-center gap-1.5">
          {!isConcluida && (
            <button
              onClick={() => setStatusModalOpen(true)}
              disabled={updateLoading === id}
              className="flex items-center px-2 py-0.5 text-xs font-medium rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
              title="Atualizar status"
            >
              {updateLoading === id ? (
                <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></div>
              ) : (
                <FiCheckCircle className="mr-1" size={12} />
              )}
              Finalizar Prova
            </button>
          )}

          <Link
            href={`/admin/provas/${id}`}
            className="text-slate-400 hover:text-sky-600 transition-colors p-1 rounded-full hover:bg-sky-50"
            aria-label="Visualizar"
            title="Visualizar prova"
          >
            <FiEye size={14} />
          </Link>
        </div>
      </div>

      <ModalStatus
        isOpen={isStatusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        onConfirm={handleCompleteProva}
        id={id}
        itemName={titulo}
        isUpdating={updateLoading === id}
        error={null}
      />
    </div>
  );
};
