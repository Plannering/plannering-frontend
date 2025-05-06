"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FiPlus, FiAlertCircle, FiX, FiArrowUp, FiHelpCircle } from "react-icons/fi";

import apiFetch from "@/core/api/fetcher";
import { Status } from "@/core/enum/status.enum";
import { ProvaCard } from "@/core/components/Cads/ProvaCards";
import { FilterBar } from "@/core/components/Paginacao/FiltroBar";
import { Pagination } from "@/core/components/Paginacao/Paginacao";
import { Prova } from "@/core/types/provas";
import { buscarProvabyId } from "@/core/api/provas";

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

  const [filtro, setFiltro] = useState<string>("pendentes");
  const [filtroMateria, setFiltroMateria] = useState<string>("");
  const [filtroData, setFiltroData] = useState<string>("");
  const [, setFiltroPrioridade] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const [showFilters, setShowFilters] = useState(false);
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);

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

  const provasFiltradas = provas
    .filter((prova) => {
      if (filtro !== "concluidas" && prova.status === Status.CONCLUIDO) {
        return false;
      }

      if (filtro === "todas") return true;
      if (filtro === "pendentes") return prova.status === Status.PENDENTE;
      if (filtro === "em_andamento") return prova.status === Status.EM_ANDAMENTO;
      if (filtro === "concluidas") return prova.status === Status.CONCLUIDO;
      if (filtro === "canceladas") return prova.status === Status.CANCELADO;

      return true;
    })
    .filter((prova) => filtroMateria === "" || (prova.materiaId && prova.materiaId === filtroMateria))
    .filter((prova) => {
      if (filtroData === "") return true;

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      if (!prova.data) {
        return (
          filtroData !== "atrasadas" &&
          filtroData !== "hoje" &&
          filtroData !== "esta_semana" &&
          filtroData !== "proximos_7_dias"
        );
      }

      const dataProva = new Date(prova.data);
      dataProva.setHours(0, 0, 0, 0);

      if (filtroData === "hoje") {
        return dataProva.getTime() === hoje.getTime();
      }

      if (filtroData === "esta_semana") {
        const diaSemana = hoje.getDay();
        const inicioSemana = new Date(hoje);

        inicioSemana.setDate(hoje.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));
        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(inicioSemana.getDate() + 6);
        return dataProva >= inicioSemana && dataProva <= fimSemana;
      }

      if (filtroData === "atrasadas") {
        return dataProva < hoje && prova.status !== Status.CONCLUIDO;
      }

      if (filtroData === "proximos_7_dias") {
        const proximosSete = new Date(hoje);
        proximosSete.setDate(hoje.getDate() + 7);
        return dataProva >= hoje && dataProva <= proximosSete;
      }

      return true;
    })
    .filter(
      (prova) =>
        searchTerm === "" ||
        prova.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prova.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false),
    )
    .sort((a, b) => {
      // Primeiro por status
      const statusOrdem = {
        [Status.PENDENTE]: 0,
        [Status.EM_ANDAMENTO]: 1,
        [Status.CONCLUIDO]: 2,
        [Status.CANCELADO]: 3,
      };

      const statusValorA = statusOrdem[a.status] || 0;
      const statusValorB = statusOrdem[b.status] || 0;

      if (statusValorA !== statusValorB) {
        return statusValorA - statusValorB;
      }

      // Depois por data da prova (mais próximas primeiro)
      if (a.data && b.data) {
        return new Date(a.data).getTime() - new Date(b.data).getTime();
      }

      // Provas com data vêm antes das sem data
      if (a.data) return -1;
      if (b.data) return 1;

      return 0;
    });

  const totalPages = Math.ceil(provasFiltradas.length / itemsPerPage);

  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return provasFiltradas.slice(startIndex, endIndex);
  };

  const goToPage = (page: number) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStatusChange = async (provaCompleta: Prova) => {
    setUpdateLoading(provaCompleta.id);

    try {
      const provaAtual = await buscarProvabyId(provaCompleta.id);
      const provaAtualizada = {
        ...provaAtual,
        status: Status.CONCLUIDO,
        titulo: provaAtual.titulo ?? "",
        descricao: provaAtual.descricao ?? "",
        data: provaAtual.data,

        nota: provaAtual.nota,
        local: provaAtual.local || "",
        materiaId: provaAtual.materiaId || "",
        usuarioId: provaAtual.usuarioId || "",
      };

      await apiFetch(`provas/${provaAtual.id}`, {
        method: "PATCH",
        body: JSON.stringify(provaAtualizada),
      });

      setProvas((provasAnteriores) =>
        provasAnteriores.map((prova) =>
          prova.id === provaCompleta.id
            ? {
                ...prova,
                status: Status.CONCLUIDO,
              }
            : prova,
        ),
      );
    } catch (erro) {
      console.error("Erro ao atualizar status:", erro);
      alert("Não foi possível atualizar o status da prova. Por favor, tente novamente.");
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

  const hasActiveFilters = filtro !== "todas" || filtroMateria !== "" || filtroData !== "" || searchTerm !== "";

  const totalItems = provasFiltradas.length;
  const currentItems = getCurrentPageItems();
  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(startItem + itemsPerPage - 1, totalItems);

  const podeCriarProva = materias.length > 0;

  return (
    <div className="container mx-auto px-4 py-6 animate-in fade-in duration-300">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-700">Gerenciamento de Provas</h1>

        {podeCriarProva ? (
          <Link
            href="/admin/provas/newProva"
            className="flex items-center justify-center bg-sky-500 hover:bg-sky-600 text-white px-4 py-2.5 rounded-lg transition shadow-sm w-full sm:w-auto"
          >
            <FiPlus className="mr-2" /> Nova Prova
          </Link>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-lg w-full sm:w-auto">
              <p className="text-amber-700 text-sm">
                Você precisa criar pelo menos uma matéria antes de adicionar provas.
              </p>
            </div>
            <Link
              href="/admin/materias/newMateria"
              className="flex items-center justify-center bg-sky-500 hover:bg-sky-600 text-white px-4 py-2.5 rounded-lg transition shadow-sm w-full sm:w-auto"
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
        filtroData={filtroData}
        materias={materias.map((m) => ({ ...m, cor: m.cor || "#808080" }))}
        searchTerm={searchTerm}
        showFilters={showFilters}
        setFiltro={setFiltro}
        setFiltroMateria={setFiltroMateria}
        setFiltroData={setFiltroData}
        setFiltroPrioridade={setFiltroPrioridade}
        setSearchTerm={setSearchTerm}
        setShowFilters={setShowFilters}
        clearFilters={clearFilters}
        filtroPrioridade={""}
      />

      {/* Contagem e resultados */}
      {!isLoading && !error && provasFiltradas.length > 0 && (
        <div className="flex justify-between items-center mb-4 text-sm text-slate-500">
          <div>
            Mostrando {startItem}-{endItem} de {totalItems} prova{totalItems !== 1 ? "s" : ""}
          </div>

          {hasActiveFilters && (
            <div className="bg-sky-50 text-sky-700 px-3 py-1 rounded-full text-xs">
              {totalItems} resultado{totalItems !== 1 ? "s" : ""} encontrado{totalItems !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      )}

      {/* Lista de provas */}
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
              {hasActiveFilters
                ? "Tente ajustar os filtros para encontrar o que está procurando."
                : "Você ainda não possui nenhuma prova. Crie sua primeira prova para começar."}
            </p>

            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 bg-sky-50 text-sky-700 rounded-lg hover:bg-sky-100"
              >
                <FiX className="mr-2" /> Limpar filtros
              </button>
            ) : (
              podeCriarProva && (
                <Link
                  href="/admin/provas/newProva"
                  className="inline-flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
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
                local={prova.local || ""}
                status={prova.status}
                materia={materias.find((m) => m.id === prova.materiaId)}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                updateLoading={updateLoading}
                duracao={0}
              />
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />}

          {/* Botão para voltar ao topo (aparece quando a página tem scroll) */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 bg-white shadow-md rounded-full p-3 text-purple-600 hover:bg-purple-50 z-10 lg:hidden"
            aria-label="Voltar ao topo"
          >
            <FiArrowUp size={20} />
          </button>
        </>
      )}
    </div>
  );
}
