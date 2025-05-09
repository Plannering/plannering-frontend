"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FiPlus, FiAlertCircle, FiX, FiArrowUp, FiHelpCircle } from "react-icons/fi";

import apiFetch from "@/core/api/fetcher";
import { ProvaCard } from "@/core/components/Cads/ProvaCards";
import { FilterBar } from "@/core/components/Paginacao/FiltroBar";
import { Pagination } from "@/core/components/Paginacao/Paginacao";
import { Prova } from "@/core/types/provas";
import HeaderCard from "@/core/components/Cads/HeaderCard";
import { filtrarProvas, hasActiveFiltersProva } from "@/core/utils/Filters/ProvaFilter";
import { calculateTotalPages, getPaginatedItems } from "@/core/utils/paginatedItems";

interface Materia {
  id: string;
  nome: string;
  cor: string;
}

export default function Provas() {
  const [provas, setProvas] = useState<Prova[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);

  const [filtro, setFiltro] = useState<string>("todas");
  const [filtroMateria, setFiltroMateria] = useState<string>("");
  const [filtroData, setFiltroData] = useState<string>("");
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [provasData, materiasData] = await Promise.all([
          apiFetch<Prova[]>("provas"),
          apiFetch<Materia[]>("materias"),
        ]);

        setProvas(provasData);
        setMaterias(materiasData);
        setError(null);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        setError("Não foi possível carregar as provas. Por favor, tente novamente.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filtro, filtroMateria, filtroData, searchTerm]);

  const provasFiltradas = filtrarProvas(provas, filtro, filtroMateria, filtroData, searchTerm);

  const totalPages = calculateTotalPages(provasFiltradas.length, itemsPerPage);
  const currentItems = getPaginatedItems(provasFiltradas, currentPage, itemsPerPage);

  const goToPage = (page: number) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStatusChange = async (alterarStatus: Prova) => {
    setUpdateLoading(alterarStatus.id);

    try {
      await apiFetch(`provas/${alterarStatus.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: alterarStatus.status }),
      });

      setProvas((provasAnteriores) =>
        provasAnteriores.map((prova) =>
          prova.id === alterarStatus.id ? { ...prova, status: alterarStatus.status } : prova,
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
      await apiFetch(`provas/${id}`, {
        method: "DELETE",
      });
      setProvas(provas.filter((prova) => prova.id !== id));
    } catch (erro) {
      console.error("Erro ao excluir prova:", erro);
      alert("Não foi possível excluir a prova. Por favor, tente novamente.");
    } finally {
      setUpdateLoading(null);
    }
  };

  const clearFilters = () => {
    setFiltro("todas");
    setFiltroMateria("");
    setFiltroData("");
    setFiltroPrioridade("");
    setSearchTerm("");
  };

  const filtrosAtivos = hasActiveFiltersProva(filtro, filtroMateria, filtroData, searchTerm);

  const totalItems = provasFiltradas.length;
  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(startItem + itemsPerPage - 1, totalItems);

  const podeCriarProva = materias.length > 0;

  return (
    <div className="container mx-auto px-4 py-6 animate-in fade-in duration-300">
      <HeaderCard
        title="Gerenciamento de Provas"
        description="Organize suas provas e avaliações"
        buttonLabel="Nova Prova"
        buttonHref="/admin/provas/newProva"
        buttonColor="indigo"
        canCreate={materias.length > 0}
        alertMessage="Você precisa cadastrar uma matéria antes de criar provas."
      />

      <FilterBar
        filtro={filtro}
        filtroMateria={filtroMateria}
        filtroData={filtroData}
        filtroPrioridade={filtroPrioridade}
        searchTerm={searchTerm}
        materias={materias}
        showFilters={showFilters}
        setFiltro={setFiltro}
        setFiltroMateria={setFiltroMateria}
        setFiltroData={setFiltroData}
        setFiltroPrioridade={setFiltroPrioridade}
        setSearchTerm={setSearchTerm}
        setShowFilters={setShowFilters}
        clearFilters={clearFilters}
        searchPlaceholder="Buscar provas..."
        statusOptions={[
          { value: "todas", label: "Todas as provas" },
          { value: "pendentes", label: "Provas pendentes" },
          { value: "em_andamento", label: "Estudando" },
          { value: "concluidas", label: "Realizadas" },
          { value: "canceladas", label: "Canceladas" },
        ]}
        statusLabel="Status da prova"
        priorityLabel="Prioridade"
        materyLabel="Matéria"
        dateLabel="Data da prova"
        showPriorityFilter={false}
      />

      {!isLoading && !error && provasFiltradas.length > 0 && (
        <div className="flex justify-between items-center mb-4 text-sm text-slate-500">
          <div>
            Mostrando {startItem}-{endItem} de {totalItems} prova{totalItems !== 1 ? "s" : ""}
          </div>

          {filtrosAtivos && (
            <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs">
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
      ) : provasFiltradas.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-slate-100">
          <div className="max-w-md mx-auto">
            <div className="text-slate-400 mb-4 flex justify-center">
              <FiHelpCircle size={48} />
            </div>
            <h3 className="text-lg font-medium text-slate-700 mb-2">Nenhuma prova encontrada</h3>
            <p className="text-slate-500 mb-6">
              {filtrosAtivos
                ? "Tente ajustar os filtros para encontrar o que está procurando."
                : "Você ainda não possui nenhuma prova. Crie sua primeira prova para começar."}
            </p>

            {filtrosAtivos ? (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100"
              >
                <FiX className="mr-2" /> Limpar filtros
              </button>
            ) : (
              podeCriarProva && (
                <Link
                  href="/admin/provas/newProva"
                  className="inline-flex items-center px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                >
                  <FiPlus className="mr-2" /> Criar nova prova
                </Link>
              )
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 sm:gap-6 gap-3">
            {currentItems.map((prova) => (
              <ProvaCard
                key={prova.id}
                id={prova.id}
                titulo={prova.titulo}
                descricao={prova.descricao}
                data={prova.data}
                nota={prova.nota ?? 0}
                local={""}
                status={prova.status}
                materia={materias.find((m) => m.id === prova.materiaId)}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                updateLoading={updateLoading}
                duracao={0}
              />
            ))}
          </div>

          {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />}

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 bg-white shadow-md rounded-full p-3 text-indigo-600 hover:bg-indigo-50 z-10 lg:hidden"
            aria-label="Voltar ao topo"
          >
            <FiArrowUp size={20} />
          </button>
        </>
      )}
    </div>
  );
}
