import React from "react";
import { useRouter } from "next/navigation";
import { FiSave } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";

interface CreateFooterProps {
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  selectedMateriaColor?: string;
  saveButtonLabel?: string;
  onCancel?: () => void;
  cancelButtonLabel?: string;
  saveIcon?: React.ReactNode;
}

export default function CreateFooter({
  handleSubmit,
  isLoading,
  selectedMateriaColor = "#3b82f6",
  saveButtonLabel = "Salvar",
  onCancel,
  cancelButtonLabel = "Cancelar",
  saveIcon = <FiSave size={14} />,
}: CreateFooterProps) {
  const router = useRouter();

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  return (
    <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 py-4 sm:py-5 px-4 sm:px-6 border-t bg-gradient-to-r from-slate-50 to-white">
      <Button
        type="button"
        variant="outline"
        onClick={handleCancel}
        className="w-full sm:w-auto px-4 sm:px-5 text-xs sm:text-sm font-medium hover:bg-slate-100 border-slate-200 order-2 sm:order-1"
      >
        {cancelButtonLabel}
      </Button>

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full sm:w-auto p-2 px-4 sm:px-6 font-medium text-xs sm:text-sm gap-2 shadow-md order-1 sm:order-2"
        style={{
          background: `linear-gradient(to right, ${selectedMateriaColor}, ${selectedMateriaColor}ee)`,
          borderColor: selectedMateriaColor,
        }}
      >
        {isLoading ? (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full"></div>
            <span>Salvando...</span>
          </>
        ) : (
          <>
            {saveIcon}
            <span>{saveButtonLabel}</span>
          </>
        )}
      </Button>
    </CardFooter>
  );
}
