import React from "react";
import { FiFilter, FiX, FiCalendar, FiBook, FiCheck, FiSearch, FiFlag } from "react-icons/fi";
import { Prioridade } from "@/core/enum/prioridades.enum";
import { Status } from "@/core/enum/status.enum";

interface FilterOption {
  value: string;
  label: string;
  color?: string;
}

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
  searchTerm: string;

  materias: Materia[];

  showFilters: boolean;

  setFiltro: (value: string) => void;
  setFiltroMateria: (value: string) => void;
  setFiltroData: (value: string) => void;
  setFiltroPrioridade: (value: string) => void;
  setSearchTerm: (value: string) => void;
  setShowFilters: (value: boolean) => void;
  clearFilters: () => void;

  searchPlaceholder?: string;
  statusOptions?: FilterOption[];
  dataOptions?: FilterOption[];
  statusLabel?: string;
  priorityLabel?: string;
  materyLabel?: string;
  dateLabel?: string;
  showStatusFilter?: boolean;
  showPriorityFilter?: boolean;
  showMateryFilter?: boolean;
  showDateFilter?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filtro,
  filtroMateria,
  filtroData,
  filtroPrioridade,
  searchTerm,

  materias,

  showFilters,

  setFiltro,
  setFiltroMateria,
  setFiltroData,
  setFiltroPrioridade,
  setSearchTerm,
  setShowFilters,
  clearFilters,

  searchPlaceholder = "Buscar...",
  statusOptions,
  dataOptions,
  statusLabel = "Status",
  priorityLabel = "Prioridade",
  materyLabel = "Matéria",
  dateLabel = "Data",
  showStatusFilter = true,
  showPriorityFilter = true,
  showMateryFilter = true,
  showDateFilter = true,
}) => {
  const defaultStatusOptions: FilterOption[] = [
    { value: "todas", label: "Todos os status" },
    { value: Status.PENDENTE, label: "Pendentes", color: "amber" },
    { value: Status.EM_ANDAMENTO, label: "Em andamento", color: "sky" },
    { value: Status.CONCLUIDO, label: "Concluídas", color: "green" },
    { value: Status.CANCELADO, label: "Canceladas", color: "red" },
  ];

  const defaultDataOptions: FilterOption[] = [
    { value: "", label: "Qualquer data" },
    { value: "hoje", label: "Hoje" },
    { value: "esta_semana", label: "Esta semana" },
    { value: "atrasadas", label: "Atrasadas" },
    { value: "proximos_7_dias", label: "Próximos 7 dias" },
  ];

  const prioridadeOptions = [
    { value: "", label: "Todas as prioridades" },
    { value: Prioridade.URGENTE, label: "Urgente", color: "purple" },
    { value: Prioridade.ALTA, label: "Alta", color: "red" },
    { value: Prioridade.MEDIA, label: "Média", color: "amber" },
    { value: Prioridade.BAIXA, label: "Baixa", color: "green" },
  ];

  const finalStatusOptions = statusOptions || defaultStatusOptions;
  const finalDataOptions = dataOptions || defaultDataOptions;

  const hasActiveFilters =
    filtro !== "todas" || filtroMateria !== "" || filtroPrioridade !== "" || filtroData !== "" || searchTerm !== "";

  const totalFilters =
    (filtro !== "todas" ? 1 : 0) +
    (filtroMateria !== "" ? 1 : 0) +
    (filtroPrioridade !== "" ? 1 : 0) +
    (filtroData !== "" ? 1 : 0);

  const getStatusLabel = () => {
    const option = finalStatusOptions.find((opt) => opt.value === filtro);
    return option?.label || "Status desconhecido";
  };

  const getDateLabel = () => {
    const option = finalDataOptions.find((opt) => opt.value === filtroData);
    return option?.label || "Data desconhecida";
  };

  const getPriorityLabel = () => {
    const option = prioridadeOptions.find((opt) => opt.value === filtroPrioridade);
    return option?.label || "Prioridade desconhecida";
  };

  const showAnyFilter = showStatusFilter || showPriorityFilter || showMateryFilter || showDateFilter;

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-slate-100 hover:shadow-lg transition-shadow duration-300">
      <div className="flex flex-col gap-4">
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-sky-400">
            <FiSearch size={18} />
          </div>

          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-300 transition-all duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {searchTerm && (
            <button
              className="absolute right-3 text-slate-400 hover:text-sky-600 transition-colors duration-200"
              onClick={() => setSearchTerm("")}
              aria-label="Limpar pesquisa"
            >
              <FiX size={16} />
            </button>
          )}

          {showAnyFilter && (
            <button
              className="md:hidden ml-2 px-3 py-2.5 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 flex items-center transition-colors duration-200"
              onClick={() => setShowFilters(!showFilters)}
              aria-label={showFilters ? "Ocultar filtros" : "Mostrar filtros"}
            >
              <FiFilter size={16} />
              <span className="ml-1 text-xs font-medium">{hasActiveFilters ? `(${totalFilters})` : ""}</span>
            </button>
          )}
        </div>

        {showAnyFilter && (
          <div
            className={`flex flex-wrap items-center gap-3 transition-all duration-300 ease-in-out ${
              showFilters ? "max-h-96 opacity-100" : "max-h-0 opacity-0 md:max-h-96 md:opacity-100"
            } overflow-hidden`}
          >
            <span className="text-slate-500 flex items-center whitespace-nowrap text-sm">
              <FiFilter className="mr-1.5 text-sky-500" size={14} /> Filtros:
            </span>

            <div className="flex flex-wrap gap-2 md:gap-3 flex-grow">
              {showStatusFilter && (
                <div className="relative flex-grow md:flex-grow-0 min-w-[140px] max-w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sky-400">
                    <FiCheck size={14} />
                  </div>
                  <select
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    className="w-full pl-9 px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm appearance-none pr-8 hover:border-sky-300 transition-colors"
                    aria-label={statusLabel}
                  >
                    {finalStatusOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        className={option.color ? `text-${option.color}-500` : ""}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              )}

              {showPriorityFilter && (
                <div className="relative flex-grow md:flex-grow-0 min-w-[140px] max-w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sky-400">
                    <FiFlag size={14} />
                  </div>
                  <select
                    value={filtroPrioridade}
                    onChange={(e) => setFiltroPrioridade(e.target.value)}
                    className="w-full pl-9 px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm appearance-none pr-8 hover:border-sky-300 transition-colors"
                    data-testid="priority-filter"
                    aria-label={priorityLabel}
                  >
                    {prioridadeOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        className={option.color ? `text-${option.color}-600` : ""}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              )}

              {showMateryFilter && (
                <div className="relative flex-grow md:flex-grow-0 min-w-[140px] max-w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sky-400">
                    <FiBook size={14} />
                  </div>
                  <select
                    value={filtroMateria}
                    onChange={(e) => setFiltroMateria(e.target.value)}
                    className="w-full pl-9 px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm appearance-none pr-8 hover:border-sky-300 transition-colors"
                    aria-label={materyLabel}
                  >
                    <option value="">Todas as matérias</option>
                    {materias.map((materia) => (
                      <option key={materia.id} value={materia.id} style={{ color: materia.cor }}>
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
              )}

              {showDateFilter && (
                <div className="relative flex-grow md:flex-grow-0 min-w-[140px] max-w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sky-400">
                    <FiCalendar size={14} />
                  </div>
                  <select
                    value={filtroData}
                    onChange={(e) => setFiltroData(e.target.value)}
                    className="w-full pl-9 px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm appearance-none pr-8 hover:border-sky-300 transition-colors"
                    aria-label={dateLabel}
                  >
                    {finalDataOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mt-2 w-full md:w-auto md:mt-0">
                {filtro !== "todas" && showStatusFilter && (
                  <div className="inline-flex items-center bg-sky-50 text-sky-700 rounded-full text-xs px-3 py-1.5 shadow-sm">
                    {getStatusLabel()}
                    <button
                      onClick={() => setFiltro("todas")}
                      className="ml-1.5 hover:text-sky-900 bg-sky-100 rounded-full w-4 h-4 flex items-center justify-center"
                      aria-label="Remover filtro de status"
                    >
                      <FiX size={10} />
                    </button>
                  </div>
                )}

                {filtroPrioridade !== "" && showPriorityFilter && (
                  <div className="inline-flex items-center bg-sky-50 text-sky-700 rounded-full text-xs px-3 py-1.5 shadow-sm">
                    {getPriorityLabel()}
                    <button
                      onClick={() => setFiltroPrioridade("")}
                      className="ml-1.5 hover:text-sky-900 bg-sky-100 rounded-full w-4 h-4 flex items-center justify-center"
                      aria-label="Remover filtro de prioridade"
                    >
                      <FiX size={10} />
                    </button>
                  </div>
                )}

                {filtroMateria !== "" && showMateryFilter && (
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

                {filtroData !== "" && showDateFilter && (
                  <div className="inline-flex items-center bg-sky-50 text-sky-700 rounded-full text-xs px-3 py-1.5 shadow-sm">
                    {getDateLabel()}
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
                  aria-label="Limpar todos os filtros"
                >
                  <FiX className="mr-1" size={12} /> Limpar todos
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
