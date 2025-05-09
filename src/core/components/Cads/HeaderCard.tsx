import React from "react";
import { FiPlus, FiAlertCircle } from "react-icons/fi";
import Link from "next/link";

interface HeaderCardProps {
  title: string;
  description?: string;
  buttonLabel?: string;
  buttonHref?: string;
  buttonIcon?: React.ReactNode;
  buttonColor?: "sky" | "indigo" | "rose" | "emerald";
  canCreate?: boolean;
  alertMessage?: string;
  alertActionLabel?: string;
  alertActionHref?: string;
  onButtonClick?: () => void;
}

export default function HeaderCard({
  title,
  description,
  buttonLabel = "Novo item",
  buttonHref,
  buttonIcon = <FiPlus className="mr-2" />,
  buttonColor = "sky",
  canCreate = true,
  alertMessage = "Você precisa cadastrar uma matéria antes de continuar.",
  alertActionLabel = "Nova Matéria",
  alertActionHref = "/admin/materias/newMateria",
  onButtonClick,
}: HeaderCardProps) {
  const buttonColorClasses = {
    sky: "bg-sky-500 hover:bg-sky-600",
    indigo: "bg-indigo-500 hover:bg-indigo-600",
    rose: "bg-rose-500 hover:bg-rose-600",
    emerald: "bg-emerald-500 hover:bg-emerald-600",
  };

  const renderButton = () => {
    const buttonClass = `flex items-center justify-center ${buttonColorClasses[buttonColor]} text-white px-4 py-2.5 rounded-lg transition shadow-sm w-full sm:w-auto`;

    if (onButtonClick) {
      return (
        <button onClick={onButtonClick} className={buttonClass}>
          {buttonIcon} {buttonLabel}
        </button>
      );
    }

    if (buttonHref) {
      return (
        <Link href={buttonHref} className={buttonClass}>
          {buttonIcon} {buttonLabel}
        </Link>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-700">{title}</h1>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>

      {canCreate ? (
        renderButton()
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-lg w-full sm:w-auto">
            <p className="text-amber-700 text-sm flex items-start">
              <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" size={16} />
              <span>{alertMessage}</span>
            </p>
          </div>
          <Link
            href={alertActionHref}
            className="flex items-center justify-center bg-sky-500 hover:bg-sky-600 text-white px-4 py-2.5 rounded-lg transition shadow-sm w-full sm:w-auto whitespace-nowrap"
          >
            <FiPlus className="mr-2" /> {alertActionLabel}
          </Link>
        </div>
      )}
    </div>
  );
}
