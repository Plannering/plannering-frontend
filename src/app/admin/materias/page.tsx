"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiTrash2, FiPlus, FiSearch, FiBook, FiAlertCircle, FiX, FiChevronRight } from "react-icons/fi";
import apiFetch from "@/core/api/fetcher";
import Link from "next/link";

import { Tarefa } from "@/core/types/tarefas";
import { ModalDelete } from "@/core/components/Modal/ModalDelet";
import HeaderCard from "@/core/components/Cads/HeaderCard";

interface Materia {
  tarefas: Tarefa[];
  id: string;
  nome: string;
  descricao: string;
  cor: string;
  diasDaSemana: string[];
}

export default function Materias() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [materiaComDependencias, setMateriaComDependencias] = useState<Record<string, number>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchMaterias = async () => {
      setIsLoading(true);
      try {
        const data = await apiFetch<Materia[]>("materias");
        setMaterias(data);

        const dependencias: Record<string, number> = {};
        data.forEach((materia) => {
          if (materia.tarefas && materia.tarefas.length > 0) {
            dependencias[materia.id] = materia.tarefas.length;
          }
        });

        setMateriaComDependencias(dependencias);
        setError(null);
      } catch (err) {
        console.error("Erro ao buscar matérias:", err);
        setError("Não foi possível carregar as matérias. Por favor, tente novamente.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterias();
  }, []);

  const materiasFiltradas = materias.filter(
    (materia) => searchTerm === "" || materia.nome.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleteLoading(deleteId);
    setShowDeleteConfirm(false);

    try {
      await apiFetch(`materias/${deleteId}`, {
        method: "DELETE",
      });

      setMaterias(materias.filter((materia) => materia.id !== deleteId));
    } catch (err) {
      console.error("Erro ao excluir matéria:", err);
      alert("Erro ao excluir a matéria. Por favor, tente novamente.");
    } finally {
      setDeleteLoading(null);
      setDeleteId(null);
    }
  };

  const openDeleteModal = (id: string) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  return (
    <div className="container mx-auto px-4 py-6 animate-in fade-in duration-300">
      <HeaderCard
        title="Gerenciamento de Matérias"
        description="Cadastre e organize suas matérias"
        buttonLabel="Nova Matéria"
        buttonHref="/admin/materias/newMateria"
        buttonColor="sky"
        canCreate={true}
      />

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-3 sm:p-4 mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar matérias por nome..."
            className="w-full pl-10 pr-10 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <FiX size={18} />
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden animate-pulse"
            >
              <div className="h-3 w-full bg-slate-200"></div>
              <div className="p-4">
                <div className="h-5 bg-slate-200 rounded w-2/3 mb-4"></div>
                <div className="h-4 bg-slate-100 rounded w-full mb-3"></div>
                <div className="h-4 bg-slate-100 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <div className="flex items-center">
            <FiAlertCircle className="text-red-500 mr-2 flex-shrink-0" size={20} />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      ) : materiasFiltradas.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center">
          <FiBook className="text-slate-300 mx-auto mb-3" size={40} />
          <p className="text-slate-500">
            {searchTerm
              ? "Nenhuma matéria encontrada com os critérios de busca."
              : "Você ainda não cadastrou nenhuma matéria."}
          </p>
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="mt-3 text-sky-500 hover:text-sky-700 text-sm font-medium flex items-center gap-1 mx-auto"
            >
              <FiX size={14} /> Limpar busca
            </button>
          )}
          {!searchTerm && (
            <Link
              href="/admin/materias/newMateria"
              className="mt-4 inline-flex items-center text-sky-500 hover:text-sky-700 gap-1 text-sm font-medium"
            >
              <FiPlus size={16} /> Adicionar matéria
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {materiasFiltradas.map((materia) => (
            <div
              key={materia.id}
              className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden transition-all duration-150 hover:shadow-md"
              style={{ borderLeft: `3px solid ${materia.cor || "#3b82f6"}` }}
            >
              <div className="p-3 flex justify-between items-center border-b border-slate-50">
                <h2
                  className="text-base font-medium text-slate-800 line-clamp-1 hover:text-sky-600 transition-colors cursor-pointer"
                  onClick={() => router.push(`/admin/materias/${materia.id}`)}
                >
                  {materia.nome}
                </h2>
                <div className="flex items-center gap-1">
                  {materiaComDependencias[materia.id] ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal(materia.id);
                      }}
                      className="text-slate-400 hover:text-amber-500 transition-colors p-1 rounded-full hover:bg-slate-50"
                      title={`Esta matéria possui ${materiaComDependencias[materia.id]} item(ns) associado(s)`}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal(materia.id);
                      }}
                      disabled={deleteLoading === materia.id}
                      className={`text-slate-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-slate-50 ${
                        deleteLoading === materia.id ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      title="Excluir matéria"
                    >
                      {deleteLoading === materia.id ? (
                        <div className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin"></div>
                      ) : (
                        <FiTrash2 size={16} />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {materia.descricao && (
                <div className="px-3 py-1.5">
                  <p className="text-xs text-slate-500 line-clamp-2" title={materia.descricao}>
                    {materia.descricao}
                  </p>
                </div>
              )}

              <div className="px-3 py-2 bg-slate-50 border-t border-slate-100">
                <button
                  onClick={() => router.push(`/admin/materias/${materia.id}`)}
                  className="flex justify-center items-center w-full text-xs font-medium text-sky-600 hover:text-sky-700 transition-colors py-1"
                >
                  Ver detalhes
                  <FiChevronRight size={14} className="ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ModalDelete
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        onViewDetails={deleteId ? () => router.push(`/admin/materias/${deleteId}`) : undefined}
        itemId={deleteId || ""}
        itemName={deleteId ? materias.find((m) => m.id === deleteId)?.nome : ""}
        itemType="matéria"
        dependencyCount={deleteId ? materiaComDependencias[deleteId] || 0 : 0}
        dependencyType="itens"
      />
    </div>
  );
}
