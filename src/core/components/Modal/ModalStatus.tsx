import React, { useState, useEffect } from "react";
import { FiX, FiClock, FiActivity, FiCheck, FiSlash, FiAlertCircle } from "react-icons/fi";
import StatusSelect from "@/core/components/Select/StatusSelect";
import { Status } from "@/core/enum/status.enum";

interface ModalStatusProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string, novoStatus: Status) => Promise<void>;
  id: string;
  itemName: string;
  statusAtual: Status;
  isUpdating?: boolean;
  error?: string | null;
}

const ModalChangeStatus: React.FC<ModalStatusProps> = ({
  isOpen,
  onClose,
  onConfirm,
  id,
  itemName,
  statusAtual,
  isUpdating = false,
  error = null,
}) => {
  const [statusSelecionado, setStatusSelecionado] = useState<Status>(statusAtual);

  useEffect(() => {
    if (isOpen) {
      setStatusSelecionado(statusAtual);
    }
  }, [statusAtual, isOpen]);

  if (!isOpen) return null;

  const handleStatus = async () => {
    try {
      if (statusSelecionado !== statusAtual) {
        await onConfirm(id, statusSelecionado);
      }
      onClose();
    } catch (error) {
      console.error("", error);
    }
  };

  const getStatusBgColor = (status: Status): string => {
    switch (status) {
      case Status.PENDENTE:
        return "bg-amber-50 border-amber-500";
      case Status.EM_ANDAMENTO:
        return "bg-sky-50 border-sky-500";
      case Status.CONCLUIDO:
        return "bg-green-50 border-green-500";
      case Status.CANCELADO:
        return "bg-red-50 border-red-500";
      default:
        return "bg-slate-50 border-slate-500";
    }
  };

  const getStatusIcon = (status: Status) => {
    switch (status) {
      case Status.PENDENTE:
        return <FiClock className="text-amber-600 mr-2 mt-0.5 flex-shrink-0" size={16} />;
      case Status.EM_ANDAMENTO:
        return <FiActivity className="text-sky-600 mr-2 mt-0.5 flex-shrink-0" size={16} />;
      case Status.CONCLUIDO:
        return <FiCheck className="text-green-600 mr-2 mt-0.5 flex-shrink-0" size={16} />;
      case Status.CANCELADO:
        return <FiSlash className="text-red-600 mr-2 mt-0.5 flex-shrink-0" size={16} />;
      default:
        return <FiClock className="text-slate-600 mr-2 mt-0.5 flex-shrink-0" size={16} />;
    }
  };

  const getStatusText = (status: Status): string => {
    switch (status) {
      case Status.PENDENTE:
        return "Pendente";
      case Status.EM_ANDAMENTO:
        return "Em andamento";
      case Status.CONCLUIDO:
        return "Concluído";
      case Status.CANCELADO:
        return "Cancelado";
      default:
        return "Status desconhecido";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Alterar Status</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-full p-1"
            disabled={isUpdating}
            type="button"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 border border-slate-200 rounded-md">
            <p className="text-xs text-slate-500 mb-1">Status atual:</p>
            <div className={`flex items-center p-2 rounded ${getStatusBgColor(statusAtual)}`}>
              {getStatusIcon(statusAtual)}
              <span className="font-medium text-sm">{getStatusText(statusAtual)}</span>
            </div>
          </div>

          <div className="p-3 border border-slate-200 rounded-md">
            <p className="text-xs text-slate-500 mb-1">Novo status:</p>
            <div className={`flex items-center p-2 rounded ${getStatusBgColor(statusSelecionado)}`}>
              {getStatusIcon(statusSelecionado)}
              <span className="font-medium text-sm">{getStatusText(statusSelecionado)}</span>
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-md mb-4">
          <p className="text-xs text-slate-500 mb-1">Item:</p>
          <p className="text-slate-800 text-sm font-medium break-words">{itemName}</p>
        </div>

        <div className="mb-4">
          <StatusSelect
            htmlFor="status-change-select"
            value={statusSelecionado}
            onValueChange={(value) => setStatusSelecionado(value as Status)}
            required={true}
          />
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-md">
            <div className="flex items-start">
              <FiAlertCircle className="text-red-600 mr-2 mt-0.5" size={14} />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
            disabled={isUpdating}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleStatus}
            disabled={isUpdating || statusSelecionado === statusAtual}
            className="px-4 py-2 text-sm text-white rounded-lg flex items-center justify-center min-w-[120px] bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {isUpdating ? (
              <>
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                <span>Atualizando...</span>
              </>
            ) : (
              "Salvar alteração"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalChangeStatus;
