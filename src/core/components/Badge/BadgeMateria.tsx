import React from "react";
import { FiBook } from "react-icons/fi";

interface MateriaProps {
  nome: string;
  cor: string;
}

export const MateriaBadge: React.FC<MateriaProps> = ({ nome, cor }) => {
  const style = {
    backgroundColor: `${cor}15`,
    color: cor,
  };

  return (
    <div className="flex items-center px-2 py-1 mx-0 rounded-md" style={style}>
      <FiBook className="mr-1" size={10} />
      <span className="font-medium truncate max-w-[110px]">{nome}</span>
    </div>
  );
};
