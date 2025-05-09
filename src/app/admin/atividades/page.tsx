"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FiPlus, FiAlertCircle, FiX, FiArrowUp, FiHelpCircle } from "react-icons/fi";

import apiFetch from "@/core/api/fetcher";
import { AtividadeCard } from "@/core/components/Cads/AtividadeCars";
import { FilterBar } from "@/core/components/Paginacao/FiltroBar";
import { Pagination } from "@/core/components/Paginacao/Paginacao";
import { Materia } from "@/core/types/materias";
import HeaderCard from "@/core/components/Cads/HeaderCard";
import { filtrarAtividades, hasActiveFiltersAtividade } from "@/core/utils/Filters/AtividadeFilter";
import { Atividade } from "@/core/types/atividades";
import { calculateTotalPages, getPaginatedItems } from "@/core/utils/paginatedItems";

export default function Atividades() {
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);

  const [filtro, setFiltro] = useState<string>("todas");
  const [filtroMateria, setFiltroMateria] = useState<string>("");
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>("");
  const [filtroData, setFiltroData] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [atividadesData, materiasData] = await Promise.all([
          apiFetch<Atividade[]>("atividades"),
          apiFetch<Materia[]>("materias"),
        ]);

        setAtividades(atividadesData);
        setMaterias(materiasData);
        setError(null);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        setError("Não foi possível carregar as atividades. Por favor, tente novamente.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filtro, filtroMateria, filtroData, searchTerm]);

  const atividadesFiltradas = filtrarAtividades(atividades, filtro, filtroMateria, filtroData, searchTerm);

  const totalPages = calculateTotalPages(atividadesFiltradas.length, itemsPerPage);
  const currentItems = getPaginatedItems(atividadesFiltradas, currentPage, itemsPerPage);

  const goToPage = (page: number) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStatusChange = async (alterarStatus: Atividade) => {
    setUpdateLoading(alterarStatus.id);

    try {
      await apiFetch(`atividades/${alterarStatus.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: alterarStatus.status }),
      });

      setAtividades((atividadesAnteriores) =>
        atividadesAnteriores.map((atividade) =>
          atividade.id === alterarStatus.id ? { ...atividade, status: alterarStatus.status } : atividade,
        ),
      );
    } catch (erro) {
      console.error("Erro ao atualizar status:", erro);
      alert("Não foi possível atualizar o status da tarefa. Por favor, tente novamente.");
    } finally {
      setUpdateLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    setUpdateLoading(id);
    try {
      await apiFetch(`atividades/${id}`, {
        method: "DELETE",
      });
      setAtividades(atividades.filter((atividade) => atividade.id !== id));
    } catch (erro) {
      console.error("Erro ao excluir atividade:", erro);
      alert("Não foi possível excluir a atividade. Por favor, tente novamente.");
    } finally {
      setUpdateLoading(null);
    }
  };

  const clearFilters = () => {
    setFiltro("todas");
    setFiltroMateria("");
    setFiltroPrioridade("");
    setFiltroData("");
    setSearchTerm("");
  };

  const filtrosAtivos = hasActiveFiltersAtividade(filtro, filtroMateria, filtroData, searchTerm);

  const totalItems = atividadesFiltradas.length;
  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(startItem + itemsPerPage - 1, totalItems);

  const podeCriarAtividade = materias.length > 0;

  return (
    <div className="container mx-auto px-4 py-6 animate-in fade-in duration-300">
      <HeaderCard
        title="Gerenciamento de Atividades"
        buttonLabel="Nova Atividade"
        description="Cadastre e organize suas atividades."
        buttonHref="/admin/atividades/newAtividade"
        buttonColor="emerald"
        canCreate={materias.length > 0}
        alertMessage="Você precisa cadastrar uma matéria antes de criar atividades."
      />

      <FilterBar
        filtro={filtro}
        filtroMateria={filtroMateria}
        filtroPrioridade={filtroPrioridade}
        filtroData={filtroData}
        searchTerm={searchTerm}
        materias={materias.map((materia) => ({
          ...materia,
          cor: materia.cor || "#808080",
        }))}
        showFilters={showFilters}
        setFiltro={setFiltro}
        setFiltroMateria={setFiltroMateria}
        setFiltroPrioridade={setFiltroPrioridade}
        setFiltroData={setFiltroData}
        setSearchTerm={setSearchTerm}
        setShowFilters={setShowFilters}
        clearFilters={clearFilters}
        searchPlaceholder="Buscar atividades..."
        statusOptions={[
          { value: "todas", label: "Todas as atividades" },
          { value: "pendentes", label: "Pendentes" },
          { value: "em_andamento", label: "Em andamento" },
          { value: "concluidas", label: "Concluídas" },
          { value: "canceladas", label: "Canceladas" },
        ]}
        statusLabel="Status da atividade"
        materyLabel="Matéria"
        dateLabel="Data de entrega"
        showPriorityFilter={false}
      />

      {!isLoading && !error && atividadesFiltradas.length > 0 && (
        <div className="flex justify-between items-center mb-4 text-sm text-slate-500">
          <div>
            Mostrando {startItem}-{endItem} de {totalItems} atividade{totalItems !== 1 ? "s" : ""}
          </div>

          {filtrosAtivos && (
            <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs">
              {totalItems} resultado{totalItems !== 1 ? "s" : ""} encontrado{totalItems !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-slate-100">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-slate-200 rounded w-1/3 mx-auto"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto"></div>
            <div className="h-4 bg-slate-200 rounded w-1/4 mx-auto"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-slate-100 rounded-xl h-48"></div>
              ))}
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center">
            <FiAlertCircle className="text-red-500 mr-2" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      ) : atividadesFiltradas.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-slate-100">
          <div className="max-w-md mx-auto">
            <div className="text-slate-400 mb-4 flex justify-center">
              <FiHelpCircle size={48} />
            </div>
            <h3 className="text-lg font-medium text-slate-700 mb-2">Nenhuma atividade encontrada</h3>
            <p className="text-slate-500 mb-6">
              {filtrosAtivos
                ? "Tente ajustar os filtros para encontrar o que está procurando."
                : "Você ainda não possui nenhuma atividade. Crie sua primeira atividade para começar."}
            </p>

            {filtrosAtivos ? (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100"
              >
                <FiX className="mr-2" /> Limpar filtros
              </button>
            ) : (
              podeCriarAtividade && (
                <Link
                  href="/admin/atividades/newAtividade"
                  className="inline-flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                >
                  <FiPlus className="mr-2" /> Criar nova atividade
                </Link>
              )
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 sm:gap-6 gap-3">
            {currentItems.map((atividade) => {
              const foundMateria = materias.find((m) => m.id === atividade.materiaId);
              const formattedMateria = foundMateria
                ? { nome: foundMateria.nome, cor: foundMateria.cor ?? "#808080" }
                : undefined;

              return (
                <AtividadeCard
                  key={atividade.id}
                  id={atividade.id}
                  titulo={atividade.titulo}
                  descricao={atividade.descricao}
                  dataVencimento={atividade.dataVencimento ?? ""}
                  peso={atividade.peso}
                  nota={atividade.nota}
                  status={atividade.status}
                  materia={formattedMateria}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                  updateLoading={updateLoading}
                />
              );
            })}
          </div>

          {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />}

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 bg-white shadow-md rounded-full p-3 text-emerald-600 hover:bg-emerald-50 z-10 lg:hidden"
            aria-label="Voltar ao topo"
          >
            <FiArrowUp size={20} />
          </button>
        </>
      )}
    </div>
  );
}
