import React from "react";
import { FiAlertTriangle, FiX } from "react-icons/fi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CancelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
  title?: string;
  description?: string;
  warningText?: string;
  itemName?: string;
}

export default function CancelModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  title = "Cancelar item",
  description = "Tem certeza que deseja cancelar este item?",
  warningText = "Esta ação irá marcar o item como cancelado e não poderá ser revertida facilmente.",
  itemName,
}: CancelModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-amber-600 flex items-center gap-2">
            <FiAlertTriangle size={18} />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
            {itemName && <span className="font-medium">&quot;{itemName}&quot;</span>}
          </DialogDescription>
        </DialogHeader>
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 text-sm text-amber-700 my-4">
          <p className="font-medium">Atenção:</p>
          <p>{warningText}</p>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="mt-2 sm:mt-0">
            Voltar
          </Button>
          <Button
            variant="default"
            onClick={onConfirm}
            disabled={isLoading}
            className="mt-2 sm:mt-0 bg-amber-500 hover:bg-amber-600"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
            ) : (
              <FiX size={14} className="mr-1.5" />
            )}
            Confirmar cancelamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
