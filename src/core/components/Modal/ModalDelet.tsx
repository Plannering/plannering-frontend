"use client";

import React from "react";

interface ModalDeleteProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  onViewDetails?: () => void;
  itemId?: string;
  itemName?: string;
  itemType?: string; // "matéria", "tarefa", etc.
  dependencyCount?: number;
  dependencyType?: string; // "tarefas", "atividades", etc.
}

export function ModalDelete({
  isOpen,
  onClose,
  onConfirm,
  onViewDetails,

  itemName,
  itemType = "item",
  dependencyCount = 0,
  dependencyType = "itens",
}: ModalDeleteProps) {
  const hasDependencies = dependencyCount > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl p-5 max-w-md w-full shadow-lg animate-in slide-in-from-bottom-5 duration-200">
        {hasDependencies ? (
          <>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Não é possível excluir</h3>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-md mb-4">
              <p className="text-amber-700 text-sm">
                {itemName ? `"${itemName}"` : `Este ${itemType}`} possui{" "}
                <strong>
                  {dependencyCount} {dependencyCount === 1 ? dependencyType.replace(/s$/, "") : dependencyType}
                </strong>{" "}
                associado(s) e não pode ser excluído.
              </p>
            </div>
            <p className="text-slate-600 text-sm mb-4">
              Para excluir {itemName ? `"${itemName}"` : `este ${itemType}`}, primeiro é necessário remover todos os{" "}
              {dependencyType} vinculados.
            </p>
            <div className="flex justify-between gap-3 mt-4">
              {onViewDetails && (
                <button
                  onClick={onViewDetails}
                  className="bg-sky-100 hover:bg-sky-200 text-sky-700 px-4 py-2 rounded-lg transition text-sm"
                >
                  Ver detalhes
                </button>
              )}
              <button
                onClick={onClose}
                className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition text-sm ml-auto"
              >
                Fechar
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Excluir {itemName ? `"${itemName}"` : itemType}
            </h3>
            <p className="text-slate-600 text-sm mb-4">
              Tem certeza que deseja excluir {itemName ? `"${itemName}"` : `este ${itemType}`}? <br /> Esta ação não
              pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={onClose}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg transition text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition text-sm"
              >
                Excluir
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
