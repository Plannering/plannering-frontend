import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center mt-8 bg-white shadow-sm rounded-lg border border-slate-100 p-2">
      <nav className="flex items-center space-x-1" aria-label="Paginação">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-md ${
            currentPage === 1 ? "text-slate-300 cursor-not-allowed" : "text-slate-600 hover:bg-slate-100"
          }`}
          aria-label="Página anterior"
        >
          <FiChevronLeft size={18} />
        </button>

        <div className="flex items-center space-x-1">
          {Array.from({ length: totalPages }, (_, i) => {
            const page = i + 1;
            const isCurrentPage = page === currentPage;
            const isNearCurrentPage = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;

            // Mostrar apenas páginas próximas à atual e primeira/última
            if (!isNearCurrentPage) {
              // Mostrar reticências apenas uma vez entre intervalos
              if (page === 2 || page === totalPages - 1) {
                return (
                  <span key={`ellipsis-${page}`} className="px-2 text-slate-400">
                    ...
                  </span>
                );
              }
              return null;
            }

            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-9 h-9 flex items-center justify-center rounded-md text-sm transition ${
                  isCurrentPage ? "bg-sky-50 text-sky-600 font-medium" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-md ${
            currentPage === totalPages ? "text-slate-300 cursor-not-allowed" : "text-slate-600 hover:bg-slate-100"
          }`}
          aria-label="Próxima página"
        >
          <FiChevronRight size={18} />
        </button>
      </nav>
    </div>
  );
};
