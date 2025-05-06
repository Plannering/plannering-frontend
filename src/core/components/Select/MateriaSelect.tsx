import React from "react";
import { FiBook } from "react-icons/fi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Materia {
  id: string;
  nome: string;
  cor: string;
}

interface MateriaSelectProps {
  htmlFor: string;
  value: string;
  onValueChange: (value: string) => void;
  materias: Materia[];
  required?: boolean;
}

export default function MateriaSelect({
  htmlFor,
  value,
  onValueChange,
  materias,
  required = false,
}: MateriaSelectProps) {
  const selectedMateriaColor = React.useMemo(() => {
    const selectedMateria = materias.find((m) => m.id === value);
    return selectedMateria?.cor || "#3b82f6";
  }, [value, materias]);

  const selectedMateriaName = React.useMemo(() => {
    const selectedMateria = materias.find((m) => m.id === value);
    return selectedMateria?.nome || "";
  }, [value, materias]);

  return (
    <div>
      <Label htmlFor={htmlFor} className="text-xs sm:text-sm font-medium mb-1.5 flex items-center text-slate-700">
        <FiBook className="mr-1.5 text-sky-500" size={14} />
        Matéria {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>

      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          id={htmlFor}
          className="w-full h-10 sm:h-12 text-xs sm:text-sm bg-white shadow-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-200 focus:border-sky-400"
          style={value ? { borderColor: selectedMateriaColor, borderWidth: "1px", color: selectedMateriaColor } : {}}
        >
          <SelectValue placeholder="Selecione uma matéria">
            {value ? (
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"
                  style={{ backgroundColor: selectedMateriaColor }}
                ></div>
                <span>{selectedMateriaName}</span>
              </div>
            ) : (
              "Selecione uma matéria"
            )}
          </SelectValue>
        </SelectTrigger>

        <SelectContent
          position="popper"
          className="max-h-[200px] sm:max-h-[300px] border-slate-200 bg-white z-50 shadow-md"
        >
          {materias.length > 0 ? (
            materias.map((materia) => (
              <SelectItem
                key={materia.id}
                value={materia.id}
                className="hover:bg-slate-50 cursor-pointer text-xs sm:text-sm"
              >
                <div className="flex items-center">
                  <div
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full mr-2"
                    style={{ backgroundColor: materia.cor || "#3b82f6" }}
                  ></div>
                  {materia.nome}
                </div>
              </SelectItem>
            ))
          ) : (
            <div className="px-2 py-4 text-center text-sm text-slate-500">
              Nenhuma matéria disponível. Por favor, crie uma matéria primeiro.
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
