import React from "react";
import { FiX, FiCheck, FiAlertCircle } from "react-icons/fi";

interface ModalStatusProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
  id: string;
  itemName: string;
  isUpdating?: boolean;
  error?: string | null;
}

const ModalStatus: React.FC<ModalStatusProps> = ({
  isOpen,
  onClose,
  onConfirm,
  id,
  itemName,
  isUpdating = false,
  error = null,
}) => {
  // Se o modal não estiver aberto, não renderize nada
  if (!isOpen) return null;

  // Função para confirmar a conclusão
  const handleConfirm = async () => {
    try {
      await onConfirm(id);
      onClose();
    } catch (error) {
      console.error("Erro ao concluir tarefa:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
        {/* Cabeçalho */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Concluir Tarefa</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-full p-1"
            disabled={isUpdating}
            type="button"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Mensagem de confirmação */}
        <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-md mb-4">
          <div className="flex items-start">
            <FiCheck className="text-green-600 mr-2 mt-0.5 flex-shrink-0" size={16} />
            <div>
              <p className="text-green-800 font-medium">Confirmar conclusão</p>
              <p className="text-green-700 text-sm mt-1">Deseja marcar a tarefa abaixo como concluída?</p>
            </div>
          </div>
        </div>

        {/* Item sendo concluído */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-md mb-4">
          <p className="text-slate-800 text-sm font-medium break-words">{itemName}</p>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-md">
            <div className="flex items-start">
              <FiAlertCircle className="text-red-600 mr-2 mt-0.5" size={14} />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Botões de ação */}
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
            onClick={handleConfirm}
            disabled={isUpdating}
            className="px-4 py-2 text-sm text-white rounded-lg flex items-center justify-center min-w-[120px] bg-green-600 hover:bg-green-700"
          >
            {isUpdating ? (
              <>
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                <span>Concluindo...</span>
              </>
            ) : (
              "Concluir"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalStatus;
