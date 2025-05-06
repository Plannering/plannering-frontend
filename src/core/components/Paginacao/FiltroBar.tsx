import React from "react";
import { FiFilter, FiX, FiCalendar, FiBook, FiCheckCircle, FiSearch, FiFlag } from "react-icons/fi";

import { Prioridade } from "@/core/enum/prioridades.enum";

interface Materia {
  id: string;
  nome: string;
  cor: string;
}

interface FilterBarProps {
  filtro: string;
  filtroMateria: string;
  filtroData: string;
  filtroPrioridade: string;
  materias: Materia[];
  searchTerm: string;
  showFilters: boolean;
  setFiltro: (value: string) => void;
  setFiltroMateria: (value: string) => void;
  setFiltroData: (value: string) => void;
  setFiltroPrioridade: (value: string) => void;
  setSearchTerm: (value: string) => void;
  setShowFilters: (value: boolean) => void;
  clearFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filtro,
  filtroMateria,
  filtroData,
  filtroPrioridade,
  materias,
  searchTerm,
  showFilters,
  setFiltro,
  setFiltroMateria,
  setFiltroData,
  setFiltroPrioridade,
  setSearchTerm,
  setShowFilters,
  clearFilters,
}) => {
  const hasActiveFilters =
    filtro !== "todas" || filtroMateria !== "" || filtroPrioridade !== "" || filtroData !== "" || searchTerm !== "";

  const totalFilters =
    (filtro !== "todas" ? 1 : 0) +
    (filtroMateria !== "" ? 1 : 0) +
    (filtroPrioridade !== "" ? 1 : 0) +
    (filtroData !== "" ? 1 : 0);

  // Função para obter o rótulo do status
  const getFilterStatusLabel = (statusFilter: string): string => {
    switch (statusFilter) {
      case "pendentes":
        return "Provas pendentes";
      case "em_andamento":
        return "Estudando";
      case "concluidas":
        return "Realizadas";
      case "canceladas":
        return "Corrigidas";
      default:
        return "Status desconhecido";
    }
  };

  // Função para obter o rótulo da prioridade
  const getFilterPriorityLabel = (priorityFilter: string): string => {
    switch (priorityFilter) {
      case Prioridade.URGENTE:
        return "Prioridade urgente";
      case Prioridade.ALTA:
        return "Prioridade alta";
      case Prioridade.MEDIA:
        return "Prioridade média";
      case Prioridade.BAIXA:
        return "Prioridade baixa";
      default:
        return "Prioridade desconhecida";
    }
  };

  // Função para obter o rótulo da data
  const getFilterDateLabel = (dateFilter: string): string => {
    switch (dateFilter) {
      case "hoje":
        return "Provas hoje";
      case "esta_semana":
        return "Provas nesta semana";
      case "atrasadas":
        return "Provas passadas";
      case "proximos_7_dias":
        return "Próximos 7 dias";
      default:
        return "Data desconhecida";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-slate-100 hover:shadow-lg transition-shadow duration-300">
      <div className="flex flex-col gap-4">
        {/* Barra de pesquisa com estilo melhorado */}
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-sky-400">
            <FiSearch size={18} />
          </div>

          <input
            type="text"
            placeholder="Buscar provas..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-300 transition-all duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {searchTerm && (
            <button
              className="absolute right-3 text-slate-400 hover:text-sky-600 transition-colors duration-200"
              onClick={() => setSearchTerm("")}
            >
              <FiX size={16} />
            </button>
          )}

          <button
            className="md:hidden ml-2 px-3 py-2.5 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 flex items-center transition-colors duration-200"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter size={16} />
            <span className="ml-1 text-xs font-medium">{hasActiveFilters ? `(${totalFilters})` : ""}</span>
          </button>
        </div>

        {/* Filtros com animação de entrada/saída */}
        <div
          className={`flex flex-wrap items-center gap-3 transition-all duration-300 ease-in-out ${
            showFilters ? "max-h-96 opacity-100" : "max-h-0 opacity-0 md:max-h-96 md:opacity-100"
          } overflow-hidden`}
        >
          <span className="text-slate-500 flex items-center whitespace-nowrap text-sm">
            <FiFilter className="mr-1.5 text-sky-500" size={14} /> Filtros:
          </span>

          <div className="flex flex-wrap gap-2 md:gap-3 flex-grow">
            {/* Filtro de Status com ícones */}
            <div className="relative flex-grow md:flex-grow-0 min-w-[140px] max-w-full group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sky-400">
                <FiCheckCircle size={14} />
              </div>
              <select
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full pl-9 px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm appearance-none pr-8 hover:border-sky-300 transition-colors"
              >
                <option value="todas" className="bg-white">
                  Todos os status
                </option>
                <option value="pendentes" className="bg-amber-50 text-amber-500 ">
                  Pendentes
                </option>
                <option value="em_andamento" className="bg-sky-50 text-sky-500">
                  Executando
                </option>
                <option value="concluidas" className="bg-green-50 text-green-500">
                  Concluidas
                </option>
                <option value="canceladas" className="bg-red-50 text-red-500">
                  Canceladas
                </option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
            {/* Filtro de Prioridade com ícones */}
            <div className="relative flex-grow md:flex-grow-0 min-w-[140px] max-w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sky-400">
                <FiFlag size={14} />
              </div>
              <select
                value={filtroPrioridade}
                onChange={(e) => setFiltroPrioridade(e.target.value)}
                className="w-full pl-9 px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm appearance-none pr-8 hover:border-sky-300 transition-colors"
                data-testid="priority-filter"
              >
                <option value="">Todas as prioridades</option>
                <option value={Prioridade.URGENTE}>Urgente</option>
                <option value={Prioridade.ALTA}>Alta</option>
                <option value={Prioridade.MEDIA}>Média</option>
                <option value={Prioridade.BAIXA}>Baixa</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
            {/* Filtro de Matéria com ícones */}
            <div className="relative flex-grow md:flex-grow-0 min-w-[140px] max-w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sky-400">
                <FiBook size={14} />
              </div>
              <select
                value={filtroMateria}
                onChange={(e) => setFiltroMateria(e.target.value)}
                className="w-full pl-9 px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm appearance-none pr-8 hover:border-sky-300 transition-colors"
              >
                <option value="">Todas as matérias</option>
                {materias.map((materia) => (
                  <option key={materia.id} value={materia.id}>
                    {materia.nome}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
            {/* Filtro de Data com ícones */}
            <div className="relative flex-grow md:flex-grow-0 min-w-[140px] max-w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sky-400">
                <FiCalendar size={14} />
              </div>
              <select
                value={filtroData}
                onChange={(e) => setFiltroData(e.target.value)}
                className="w-full pl-9 px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm appearance-none pr-8 hover:border-sky-300 transition-colors"
              >
                <option value="">Qualquer data</option>
                <option value="hoje">Hoje</option>
                <option value="esta_semana">Esta semana</option>
                <option value="atrasadas">Passadas</option>
                <option value="proximos_7_dias">Próximos 7 dias</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Chips de filtros ativos com design melhorado */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-2 w-full md:w-auto md:mt-0">
              {filtro !== "todas" && (
                <div className="inline-flex items-center bg-sky-50 text-sky-700 rounded-full text-xs px-3 py-1.5 shadow-sm">
                  {getFilterStatusLabel(filtro)}
                  <button
                    onClick={() => setFiltro("todas")}
                    className="ml-1.5 hover:text-sky-900 bg-sky-100 rounded-full w-4 h-4 flex items-center justify-center"
                    aria-label="Remover filtro de status"
                  >
                    <FiX size={10} />
                  </button>
                </div>
              )}

              {filtroPrioridade !== "" && (
                <div className="inline-flex items-center bg-sky-50 text-sky-700 rounded-full text-xs px-3 py-1.5 shadow-sm">
                  {getFilterPriorityLabel(filtroPrioridade)}
                  <button
                    onClick={() => setFiltroPrioridade("")}
                    className="ml-1.5 hover:text-sky-900 bg-sky-100 rounded-full w-4 h-4 flex items-center justify-center"
                    aria-label="Remover filtro de prioridade"
                  >
                    <FiX size={10} />
                  </button>
                </div>
              )}

              {filtroMateria !== "" && (
                <div className="inline-flex items-center bg-sky-50 text-sky-700 rounded-full text-xs px-3 py-1.5 shadow-sm">
                  {materias.find((m) => m.id === filtroMateria)?.nome || "Matéria"}
                  <button
                    onClick={() => setFiltroMateria("")}
                    className="ml-1.5 hover:text-sky-900 bg-sky-100 rounded-full w-4 h-4 flex items-center justify-center"
                    aria-label="Remover filtro de matéria"
                  >
                    <FiX size={10} />
                  </button>
                </div>
              )}

              {filtroData !== "" && (
                <div className="inline-flex items-center bg-sky-50 text-sky-700 rounded-full text-xs px-3 py-1.5 shadow-sm">
                  {getFilterDateLabel(filtroData)}
                  <button
                    onClick={() => setFiltroData("")}
                    className="ml-1.5 hover:text-sky-900 bg-sky-100 rounded-full w-4 h-4 flex items-center justify-center"
                    aria-label="Remover filtro de data"
                  >
                    <FiX size={10} />
                  </button>
                </div>
              )}

              <button
                onClick={clearFilters}
                className="ml-auto md:ml-2 px-3 py-1.5 text-xs text-red-600 hover:text-red-800 flex items-center rounded-full hover:bg-red-50 transition-colors border border-red-100 shadow-sm"
              >
                <FiX className="mr-1" size={12} /> Limpar todos
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
