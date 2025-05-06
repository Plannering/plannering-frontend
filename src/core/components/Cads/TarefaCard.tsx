/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import Link from "next/link";
import { FiMoreVertical, FiEye, FiTrash2, FiCheckCircle, FiAlertCircle, FiClock } from "react-icons/fi";
import { Status } from "@/core/enum/status.enum";
import { formatDate } from "../../utils/formatDate";
import { StatusBadge } from "../Badge/BadgeStatus";
import { MateriaBadge } from "../Badge/BadgeMateria";
import { PrioridadeBadge } from "../Badge/BadgePrioridade";
import ModalStatus from "../Modal/ModalComplet";
import { Tarefa } from "@/core/types/tarefas";

interface TarefaCardProps {
  id: string;
  titulo: string;
  descricao?: string;
  dataVencimento: string | Date;
  prioridade: string;
  status: Status;
  materia?: {
    nome: string;
    cor: string;
  };
  onDelete: (id: string) => void;
  onStatusChange: (tarefa: Tarefa) => Promise<void>;
  updateLoading?: string | null;
}

// Enum para status de data
enum DateStatus {
  VENCIDO = "vencido",
  ALERTA = "alerta",
  NORMAL = "normal",
}

export const TarefaCard: React.FC<TarefaCardProps> = ({
  id,
  titulo,
  descricao,
  dataVencimento,
  prioridade,
  status,
  materia,
  onDelete,
  onStatusChange,
  updateLoading = null,
}) => {
  const [openOptionsMenu, setOpenOptionsMenu] = useState(false);
  const [isStatusModalOpen, setStatusModalOpen] = useState(false);

  // Garantir que dataVencimento seja string para funções/utilização
  const dataVencimentoStr = typeof dataVencimento === "string" ? dataVencimento : dataVencimento.toISOString();

  // Função para verificar o status da data
  const getDateStatus = (dateStr: string, taskStatus: Status): { status: DateStatus; daysLeft?: number } => {
    if (taskStatus === Status.CONCLUIDO) return { status: DateStatus.NORMAL };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { status: DateStatus.VENCIDO, daysLeft: diffDays };
    if (diffDays <= 7) return { status: DateStatus.ALERTA, daysLeft: diffDays };
    return { status: DateStatus.NORMAL, daysLeft: diffDays };
  };

  const dateInfo = getDateStatus(dataVencimentoStr, status);
  const isConcluida = status === Status.CONCLUIDO;

  // Função para criar uma cópia da tarefa com o status atualizado
  const handleCompleteTarefa = async (id: string) => {
    // Criar um objeto completo da tarefa com todas as propriedades visíveis
    const tarefaCompleta: Tarefa = {
      id,
      titulo,
      descricao,
      dataVencimento: dataVencimentoStr,
      prioridade: prioridade as any, // Converte string para Prioridade
      status: status,
      materiaId: materia?.nome,
      dataCriacao: "",
      dataAtualizacao: "",
      usuarioId: "",
    };

    // Chamar a função de atualização passando o objeto completo
    await onStatusChange(tarefaCompleta);
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

  // Função para retornar as cores baseadas no status da data
  const getDateColors = () => {
    switch (dateInfo.status) {
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

  const getDateText = () => {
    if (dateInfo.status === DateStatus.VENCIDO) {
      const days = Math.abs(dateInfo.daysLeft || 0);
      if (days === 0) return "Venceu hoje";
      if (days === 1) return "Venceu ontem";
      return `Vencida há ${days} dias`;
    }

    if (dateInfo.status === DateStatus.ALERTA) {
      if (dateInfo.daysLeft === 0) return "Vence hoje";
      if (dateInfo.daysLeft === 1) return "Vence amanhã";
      return `Vence em ${dateInfo.daysLeft} dias`;
    }

    return formatDate(dataVencimentoStr);
  };

  const dateColors = getDateColors();

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-slate-100  overflow-hidden 
                  transition-all duration-150 hover:shadow-md 
                  ${isConcluida ? "opacity-75" : ""}`}
      style={{
        borderLeft: `3px solid ${materia?.cor || "#00a6f4"}`, // Sempre usa a cor da matéria
      }}
    >
      {/* Card Header - mais compacto */}
      <div className="p-2.5 flex justify-between items-center">
        <Link
          href={`/admin/tarefas/${id}`}
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
                href={`/admin/tarefas/${id}`}
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

      {/* Info Strip - design simplificado */}
      <div className="px-2.5 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {materia ? (
            <MateriaBadge nome={materia.nome} cor={materia.cor} />
          ) : (
            <span className="text-slate-400 italic text-xs">Sem matéria</span>
          )}
          <PrioridadeBadge prioridade={prioridade} />
        </div>

        <div
          className={`flex items-center gap-1 ${dateColors.textColor} ${dateColors.bgColor} px-1.5 py-0.5 rounded-full`}
        >
          {dateColors.icon}
          <span className="text-xs font-medium">{getDateText()}</span>
        </div>
      </div>

      {/* Descrição - mais compacta */}
      {descricao && (
        <div className="px-2.5 py-1">
          <p className="text-xs text-slate-500 line-clamp-1" title={descricao}>
            {descricao}
          </p>
        </div>
      )}

      {/* Footer com Status e Ações - design simplificado */}
      <div className="px-2.5 py-2 border-t border-slate-100 flex justify-between items-center">
        <StatusBadge status={status} />

        <div className="flex items-center gap-1.5">
          {!isConcluida && (
            <button
              onClick={() => setStatusModalOpen(true)}
              disabled={updateLoading === id}
              className="flex items-center px-2 py-0.5 text-xs font-medium rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
              title="Marcar como concluída"
            >
              {updateLoading === id ? (
                <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></div>
              ) : (
                <FiCheckCircle className="mr-1" size={12} />
              )}
              Concluir
            </button>
          )}

          <Link
            href={`/admin/tarefas/${id}`}
            className="text-slate-400 hover:text-sky-600 transition-colors p-1 rounded-full hover:bg-sky-50"
            aria-label="Visualizar"
            title="Visualizar tarefa"
          >
            <FiEye size={14} />
          </Link>
        </div>
      </div>

      {/* Modal de conclusão */}
      <ModalStatus
        isOpen={isStatusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        onConfirm={handleCompleteTarefa}
        id={id}
        itemName={titulo}
        isUpdating={updateLoading === id}
        error={null}
      />
    </div>
  );
};
