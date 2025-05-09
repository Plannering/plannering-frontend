/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import Link from "next/link";
import { FiMoreVertical, FiEye, FiTrash2, FiEdit } from "react-icons/fi";
import { Status } from "@/core/enum/status.enum";
import { StatusBadge } from "../Badge/BadgeStatus";
import { MateriaBadge } from "../Badge/BadgeMateria";
import { PrioridadeBadge } from "../Badge/BadgePrioridade";
import { BadgeDate } from "../Badge/BadgeData";
import ModalStatus from "../Modal/ModalStatus";
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

  const dataVencimentoStr = typeof dataVencimento === "string" ? dataVencimento : dataVencimento.toString();
  const isConcluida = status === Status.CONCLUIDO;

  const handleCompleteTarefa = async (id: string, novoStatus: Status) => {
    const tarefaCompleta: Tarefa = {
      id,
      titulo,
      descricao,
      dataVencimento: dataVencimentoStr,
      prioridade: prioridade as any,
      status: novoStatus,
      materiaId: materia?.nome,
      dataCriacao: "",
      dataAtualizacao: "",
      usuarioId: "",
    };

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

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden 
                  transition-all duration-150 hover:shadow-md 
                  ${isConcluida ? "opacity-75" : ""}`}
      style={{
        borderLeft: `3px solid ${materia?.cor || "#00a6f4"}`,
      }}
    >
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

      <div className="px-2.5 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {materia ? (
            <MateriaBadge nome={materia.nome} cor={materia.cor} />
          ) : (
            <span className="text-slate-400 italic text-xs">Sem matéria</span>
          )}
          <PrioridadeBadge prioridade={prioridade} />
        </div>

        <BadgeDate date={dataVencimentoStr} status={status} />
      </div>

      {descricao && (
        <div className="px-2.5 py-1">
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
              className="flex items-center px-2 py-0.5 text-xs font-medium rounded-md bg-sky-100 text-sky-700 hover:bg-sky-200 transition-colors"
              title="Marcar como concluída"
            >
              {updateLoading === id ? (
                <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></div>
              ) : (
                <FiEdit className="mr-1" size={12} />
              )}
              Alterar Status
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

      <ModalStatus
        isOpen={isStatusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        onConfirm={handleCompleteTarefa}
        id={id}
        itemName={titulo}
        isUpdating={updateLoading === id}
        error={null}
        statusAtual={status}
      />
    </div>
  );
};
