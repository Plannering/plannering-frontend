import { Prioridade } from "@/core/enum/prioridades.enum";
import { FiFlag } from "react-icons/fi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import React from "react";

interface PrioridadeSelectProps {
  htmlFor: string;
  value: string;
  onValueChange: (value: string) => void;
  required?: boolean;
}

export default function PrioridadeSelect({ htmlFor, value, onValueChange, required = false }: PrioridadeSelectProps) {
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case Prioridade.BAIXA:
        return "text-green-700 bg-green-50";
      case Prioridade.MEDIA:
        return "text-amber-700 bg-amber-50";
      case Prioridade.ALTA:
        return "text-red-700 bg-red-50";
      case Prioridade.URGENTE:
        return "text-purple-700 bg-purple-50";
      default:
        return "text-slate-700";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case Prioridade.BAIXA:
        return "Baixa";
      case Prioridade.MEDIA:
        return "Média";
      case Prioridade.ALTA:
        return "Alta";
      case Prioridade.URGENTE:
        return "Urgente";
      default:
        return "Selecione";
    }
  };

  return (
    <div>
      <Label htmlFor={htmlFor} className="text-xs sm:text-sm font-medium mb-1.5 flex items-center text-slate-700">
        <FiFlag className="mr-1.5 text-sky-500" size={14} />
        Prioridade {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>

      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          id={htmlFor}
          className={`w-full h-10 sm:h-12 text-xs sm:text-sm bg-white shadow-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-200 focus:border-sky-400 ${getPriorityStyle(
            value,
          )}`}
        >
          <SelectValue placeholder="Selecione a prioridade">
            {value ? getPriorityText(value) : "Selecione a prioridade"}
          </SelectValue>
        </SelectTrigger>

        <SelectContent position="popper" className="border-slate-200 bg-white z-50 shadow-md">
          <SelectItem value={Prioridade.BAIXA} className="hover:bg-green-50 cursor-pointer text-xs sm:text-sm">
            <span className="flex items-center gap-2 text-green-700">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              Baixa
            </span>
          </SelectItem>

          <SelectItem value={Prioridade.MEDIA} className="hover:bg-amber-50 cursor-pointer text-xs sm:text-sm">
            <span className="flex items-center gap-2 text-amber-700">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              Média
            </span>
          </SelectItem>

          <SelectItem value={Prioridade.ALTA} className="hover:bg-red-50 cursor-pointer text-xs sm:text-sm">
            <span className="flex items-center gap-2 text-red-700">
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
              Alta
            </span>
          </SelectItem>

          <SelectItem value={Prioridade.URGENTE} className="hover:bg-purple-50 cursor-pointer text-xs sm:text-sm">
            <span className="flex items-center gap-2 text-purple-700">
              <span className="h-2 w-2 rounded-full bg-purple-500"></span>
              Urgente
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
