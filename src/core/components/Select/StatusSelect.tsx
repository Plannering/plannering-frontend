import { Status } from "@/core/enum/status.enum";
import { FiClock, FiActivity, FiCheck, FiX } from "react-icons/fi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import React from "react";

interface StatusSelectProps {
  htmlFor: string;
  value: string;
  onValueChange: (value: string) => void;
  required?: boolean;
}

export default function StatusSelect({ htmlFor, value, onValueChange, required = false }: StatusSelectProps) {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case Status.PENDENTE:
        return "text-amber-700 bg-amber-50";
      case Status.EM_ANDAMENTO:
        return "text-sky-700 bg-sky-50";
      case Status.CONCLUIDO:
        return "text-green-700 bg-green-50";
      case Status.CANCELADO:
        return "text-slate-700 bg-slate-50";
      default:
        return "text-slate-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case Status.PENDENTE:
        return "Pendente";
      case Status.EM_ANDAMENTO:
        return "Em andamento";
      case Status.CONCLUIDO:
        return "Concluída";
      case Status.CANCELADO:
        return "Cancelada";
      default:
        return "Selecione";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case Status.PENDENTE:
        return <FiClock className="text-amber-500" />;
      case Status.EM_ANDAMENTO:
        return <FiActivity className="text-sky-500" />;
      case Status.CONCLUIDO:
        return <FiCheck className="text-green-500" />;
      case Status.CANCELADO:
        return <FiX className="text-slate-500" />;
      default:
        return null;
    }
  };

  return (
    <div>
      <Label htmlFor={htmlFor} className="text-xs sm:text-sm font-medium mb-1.5 flex items-center text-slate-700">
        <FiCheck className="mr-1.5 text-sky-500" size={14} />
        Status {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>

      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          id={htmlFor}
          className={`w-full h-10 sm:h-12 text-xs sm:text-sm bg-white shadow-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-200 focus:border-sky-400 ${getStatusStyle(
            value,
          )}`}
        >
          <SelectValue placeholder="Selecione o status">
            {value ? (
              <div className="flex items-center gap-2">
                {getStatusIcon(value)}
                <span>{getStatusText(value)}</span>
              </div>
            ) : (
              "Selecione o status"
            )}
          </SelectValue>
        </SelectTrigger>

        <SelectContent position="popper" className="border-slate-200 bg-white z-50 shadow-md">
          <SelectItem value={Status.PENDENTE} className="hover:bg-amber-50 cursor-pointer text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-amber-700">
              <FiClock className="text-amber-500" size={14} />
              <span>Pendente</span>
            </div>
          </SelectItem>

          <SelectItem value={Status.EM_ANDAMENTO} className="hover:bg-sky-50 cursor-pointer text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-sky-700">
              <FiActivity className="text-sky-500" size={14} />
              <span>Em andamento</span>
            </div>
          </SelectItem>

          <SelectItem value={Status.CONCLUIDO} className="hover:bg-green-50 cursor-pointer text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-green-700">
              <FiCheck className="text-green-500" size={14} />
              <span>Concluída</span>
            </div>
          </SelectItem>

          <SelectItem value={Status.CANCELADO} className="hover:bg-slate-50 cursor-pointer text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-slate-700">
              <FiX className="text-slate-500" size={14} />
              <span>Cancelada</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
