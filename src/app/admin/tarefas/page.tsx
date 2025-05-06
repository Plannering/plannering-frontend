"use client";

import React, { useState, useEffect } from "react";

import Link from "next/link";
import { FiPlus, FiAlertCircle, FiX, FiArrowUp, FiHelpCircle } from "react-icons/fi";

import apiFetch from "@/core/api/fetcher";
import { Status } from "@/core/enum/status.enum";

import { TarefaCard } from "@/core/components/Cads/TarefaCard";
import { FilterBar } from "@/core/components/Paginacao/FiltroBar";
import { Pagination } from "@/core/components/Paginacao/Paginacao";
import { buscarTarefabyId } from "@/core/api/tarefas";
import { Tarefa } from "@/core/types/tarefas";

interface Materia {
  id: string;
  nome: string;
  cor: string;
}

export default function Tarefas() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtro, setFiltro] = useState<string>("pendentes");
  const [filtroMateria, setFiltroMateria] = useState<string>("");
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>("");
  const [filtroData, setFiltroData] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const [showFilters, setShowFilters] = useState(false);
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [tarefasData, materiasData] = await Promise.all([
          apiFetch<Tarefa[]>("tarefas"),
          apiFetch<Materia[]>("materias"),
        ]);

        setTarefas(tarefasData);
        setMaterias(materiasData);
        setError(null);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        setError("Não foi possível carregar as tarefas. Por favor, tente novamente.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filtro, filtroMateria, filtroPrioridade, filtroData, searchTerm]);

  const tarefasFiltradas = tarefas
    .filter((tarefa) => {
      if (filtro !== "concluidas" && tarefa.status === Status.CONCLUIDO) {
        return false;
      }

      if (filtro === "todas") return true;
      if (filtro === "pendentes") return tarefa.status === Status.PENDENTE;
      if (filtro === "em_andamento") return tarefa.status === Status.EM_ANDAMENTO;
      if (filtro === "concluidas") return tarefa.status === Status.CONCLUIDO;
      if (filtro === "canceladas") return tarefa.status === Status.CANCELADO;

      return true;
    })
    .filter((tarefa) => filtroMateria === "" || (tarefa.materiaId && tarefa.materiaId === filtroMateria))
    .filter((tarefa) => {
      if (filtroPrioridade === "") return true;
      return tarefa.prioridade.toLowerCase() === filtroPrioridade;
    })
    .filter((tarefa) => {
      if (filtroData === "") return true;

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      if (!tarefa.dataVencimento) {
        return (
          filtroData !== "atrasadas" &&
          filtroData !== "hoje" &&
          filtroData !== "esta_semana" &&
          filtroData !== "proximos_7_dias"
        );
      }

      const dataVencimento = new Date(tarefa.dataVencimento);
      dataVencimento.setHours(0, 0, 0, 0);

      if (filtroData === "hoje") {
        return dataVencimento.getTime() === hoje.getTime();
      }

      if (filtroData === "esta_semana") {
        const diaSemana = hoje.getDay();
        const inicioSemana = new Date(hoje);

        inicioSemana.setDate(hoje.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));
        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(inicioSemana.getDate() + 6);
        return dataVencimento >= inicioSemana && dataVencimento <= fimSemana;
      }

      if (filtroData === "atrasadas") {
        return dataVencimento < hoje && tarefa.status !== Status.CONCLUIDO;
      }

      if (filtroData === "proximos_7_dias") {
        const proximosSete = new Date(hoje);
        proximosSete.setDate(hoje.getDate() + 7);
        return dataVencimento >= hoje && dataVencimento <= proximosSete;
      }

      return true;
    })
    .filter(
      (tarefa) =>
        searchTerm === "" ||
        tarefa.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tarefa.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false),
    )
    .filter((tarefa) => {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      if (filtroData === "atrasadas") return true;

      if (!tarefa.dataVencimento) return true;

      const dataVencimento = new Date(tarefa.dataVencimento);
      dataVencimento.setHours(0, 0, 0, 0);

      return !(dataVencimento < hoje && tarefa.status !== Status.CONCLUIDO);
    })

    .sort((a, b) => {
      const prioridadeValor: Record<"urgente" | "alta" | "media" | "baixa", number> = {
        urgente: 3,
        alta: 2,
        media: 1,
        baixa: 0,
      };

      const prioridadeA = prioridadeValor[a.prioridade.toLowerCase() as keyof typeof prioridadeValor] || 0;
      const prioridadeB = prioridadeValor[b.prioridade.toLowerCase() as keyof typeof prioridadeValor] || 0;

      if (prioridadeA !== prioridadeB) {
        return prioridadeB - prioridadeA;
      }

      if (a.dataVencimento && b.dataVencimento) {
        return new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime();
      }

      if (a.dataVencimento) return -1;
      if (b.dataVencimento) return 1;

      return 0;
    });

  const totalPages = Math.ceil(tarefasFiltradas.length / itemsPerPage);

  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return tarefasFiltradas.slice(startIndex, endIndex);
  };

  const goToPage = (page: number) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStatusChange = async (tarefaCompleta: Tarefa) => {
    setUpdateLoading(tarefaCompleta.id);

    try {
      const tarefaAtual = await buscarTarefabyId(tarefaCompleta.id);
      const tarefaAtualizada = {
        ...tarefaAtual,
        status: Status.CONCLUIDO,
        titulo: tarefaAtual.titulo ?? "",
        descricao: tarefaAtual.descricao ?? "",
        prioridade: tarefaAtual.prioridade ?? "",
        dataVencimento: tarefaAtual.dataVencimento,
        materiaId: tarefaAtual.materiaId || (tarefaAtual.materiaId ?? ""),
        usuarioId: tarefaAtual.usuarioId || "",
      };

      await apiFetch(`tarefas/${tarefaAtual.id}`, {
        method: "PATCH",
        body: JSON.stringify(tarefaAtualizada),
      });

      setTarefas((tarefasAnteriores) =>
        tarefasAnteriores.map((tarefa) =>
          tarefa.id === tarefaCompleta.id
            ? {
                ...tarefa,
                status: Status.CONCLUIDO,
              }
            : tarefa,
        ),
      );
    } catch (erro) {
      console.error("Erro ao atualizar status:", erro);
      alert("Não foi possível concluir a tarefa. Por favor, tente novamente.");
    } finally {
      setUpdateLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    await apiFetch(`tarefas/${id}`, {
      method: "DELETE",
    });
    setTarefas(tarefas.filter((tarefa) => tarefa.id !== id));
  };

  const clearFilters = () => {
    setFiltro("todas");
    setFiltroMateria("");
    setFiltroPrioridade("");
    setFiltroData("");
    setSearchTerm("");
  };

  const hasActiveFilters =
    filtro !== "todas" || filtroMateria !== "" || filtroPrioridade !== "" || filtroData !== "" || searchTerm !== "";

  const totalItems = tarefasFiltradas.length;
  const currentItems = getCurrentPageItems();
  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(startItem + itemsPerPage - 1, totalItems);

  const podeCriarTarefa = materias.length > 0;

  return (
    <div className="container mx-auto px-4 py-6 animate-in fade-in duration-300">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-700">Gerenciamento de Tarefas</h1>

        {podeCriarTarefa ? (
          <Link
            href="/admin/tarefas/newTarefa"
            className="flex items-center justify-center bg-sky-500 hover:bg-sky-600 text-white px-4 py-2.5 rounded-lg transition shadow-sm w-full sm:w-auto"
          >
            <FiPlus className="mr-2" /> Nova Tarefa
          </Link>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-lg w-full sm:w-auto">
              <p className="text-amber-700 text-sm">Você precisa cadastrar uma matéria antes de criar tarefas.</p>
            </div>
            <Link
              href="/admin/materias/newMateria"
              className="flex items-center justify-center bg-sky-500 hover:bg-sky-600 text-white px-4 py-2.5 rounded-lg transition shadow-sm w-full sm:w-auto whitespace-nowrap"
            >
              <FiPlus className="mr-2" /> Nova Matéria
            </Link>
          </div>
        )}
      </div>

      {/* Barra de filtros */}
      <FilterBar
        filtro={filtro}
        filtroMateria={filtroMateria}
        filtroPrioridade={filtroPrioridade}
        filtroData={filtroData}
        materias={materias}
        searchTerm={searchTerm}
        showFilters={showFilters}
        setFiltro={setFiltro}
        setFiltroMateria={setFiltroMateria}
        setFiltroPrioridade={setFiltroPrioridade}
        setFiltroData={setFiltroData}
        setSearchTerm={setSearchTerm}
        setShowFilters={setShowFilters}
        clearFilters={clearFilters}
      />

      {/* Contagem e resultados */}
      {!isLoading && !error && tarefasFiltradas.length > 0 && (
        <div className="flex justify-between items-center mb-4 text-sm text-slate-500">
          <div>
            Mostrando {startItem}-{endItem} de {totalItems} tarefa{totalItems !== 1 ? "s" : ""}
          </div>

          {hasActiveFilters && (
            <div className="bg-sky-50 text-sky-700 px-3 py-1 rounded-full text-xs">
              {totalItems} resultado{totalItems !== 1 ? "s" : ""} encontrado{totalItems !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      )}

      {/* Lista de tarefas */}
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
      ) : tarefasFiltradas.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-slate-100">
          <div className="max-w-md mx-auto">
            <div className="text-slate-400 mb-4 flex justify-center">
              <FiHelpCircle size={48} />
            </div>
            <h3 className="text-lg font-medium text-slate-700 mb-2">Nenhuma tarefa encontrada</h3>
            <p className="text-slate-500 mb-6">
              {hasActiveFilters
                ? "Tente ajustar os filtros para encontrar o que está procurando."
                : "Você ainda não possui nenhuma tarefa. Crie sua primeira tarefa para começar."}
            </p>

            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 bg-sky-50 text-sky-700 rounded-lg hover:bg-sky-100"
              >
                <FiX className="mr-2" /> Limpar filtros
              </button>
            ) : (
              podeCriarTarefa && (
                <Link
                  href="/admin/tarefas/newTarefa"
                  className="inline-flex items-center px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600"
                >
                  <FiPlus className="mr-2" /> Criar nova tarefa
                </Link>
              )
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 sm:gap-6 gap-3">
            {currentItems.map((tarefa) => (
              <TarefaCard
                key={tarefa.id}
                id={tarefa.id}
                titulo={tarefa.titulo}
                descricao={tarefa.descricao}
                dataVencimento={tarefa.dataVencimento ?? ""}
                prioridade={tarefa.prioridade}
                status={tarefa.status}
                materia={materias.find((m) => m.id === tarefa.materiaId)}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                updateLoading={updateLoading}
              />
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />}

          {/* Botão para voltar ao topo (aparece quando a página tem scroll) */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 bg-white shadow-md rounded-full p-3 text-sky-600 hover:bg-sky-50 z-10 lg:hidden"
            aria-label="Voltar ao topo"
          >
            <FiArrowUp size={20} />
          </button>
        </>
      )}
    </div>
  );
}
