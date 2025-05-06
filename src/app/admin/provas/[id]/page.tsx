"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiEdit2, FiTrash2, FiCheckCircle, FiAlertCircle, FiCalendar, FiBook } from "react-icons/fi";

import apiFetch from "@/core/api/fetcher";
import { Status } from "@/core/enum/status.enum";
import { Materia } from "@/core/types/materias";

type Prova = {
  id: string;
  titulo: string;
  descricao?: string;
  dataProva?: string;
  valor?: number;
  nota?: number;
  status: Status;
  dataCriacao: string;
  dataAtualizacao: string;
  usuarioId: string;
  materiaId?: string;
  materia?: Materia;
};

export default function ViewProva() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [prova, setProva] = useState<Prova | null>(null);
  const [materia, setMateria] = useState<Materia | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProva = async () => {
      setIsLoading(true);
      try {
        const provaData = await apiFetch<Prova>(`provas/${id}`);
        setProva(provaData);

        if (provaData.materiaId) {
          const materiaData = await apiFetch<Materia>(`materias/${provaData.materiaId}`);
          setMateria(materiaData);
        }
      } catch (err) {
        console.error("Erro ao buscar prova:", err);
        setError("Não foi possível carregar os detalhes da prova. Por favor, tente novamente.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProva();
    }
  }, [id]);

  const confirmDelete = async () => {
    if (confirm("Tem certeza que deseja excluir esta prova? Esta ação não pode ser desfeita.")) {
      setIsDeleting(true);
      try {
        await apiFetch(`provas/${id}`, {
          method: "DELETE",
        });
        router.push("/admin/provas");
      } catch (err) {
        console.error("Erro ao excluir prova:", err);
        alert("Não foi possível excluir a prova. Por favor, tente novamente.");
        setIsDeleting(false);
      }
    }
  };

  const handleStatusChange = async (newStatus: Status) => {
    if (!prova) return;

    setIsSubmitting(true);
    try {
      const updatedProva = {
        ...prova,
        status: newStatus,
      };

      await apiFetch(`provas/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updatedProva),
      });

      setProva({
        ...prova,
        status: newStatus,
      });
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      alert("Não foi possível atualizar o status da prova. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatusLabel = (status: Status) => {
    const statusConfig = {
      [Status.PENDENTE]: {
        label: "Pendente",
        classes: "bg-yellow-50 text-yellow-700 border-yellow-200",
      },
      [Status.EM_ANDAMENTO]: {
        label: "Em preparação",
        classes: "bg-blue-50 text-blue-700 border-blue-200",
      },
      [Status.CONCLUIDO]: {
        label: "Concluída",
        classes: "bg-green-50 text-green-700 border-green-200",
      },
      [Status.CANCELADO]: {
        label: "Cancelada",
        classes: "bg-gray-50 text-gray-700 border-gray-200",
      },
    };

    const config = statusConfig[status];
    return <span className={`px-3 py-1 text-sm rounded-full border ${config.classes}`}>{config.label}</span>;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm p-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !prova) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center">
            <FiAlertCircle className="text-red-500 mr-2" size={20} />
            <p className="text-red-700">{error || "Prova não encontrada"}</p>
          </div>
          <Link href="/admin/provas" className="mt-4 inline-block text-blue-600 hover:underline">
            Voltar para lista de provas
          </Link>
        </div>
      </div>
    );
  }

  const formattedData = prova.dataProva ? new Date(prova.dataProva).toLocaleDateString("pt-BR") : "Não definida";
  const formattedCriacao = new Date(prova.dataCriacao).toLocaleDateString("pt-BR");

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl animate-in fade-in duration-300">
      <div className="flex items-center mb-6">
        <Link href="/admin/provas" className="mr-4 text-gray-500 hover:text-gray-700 transition">
          <FiArrowLeft size={20} />
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Detalhes da Prova</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-6">
        {materia && <div className="h-2" style={{ backgroundColor: materia.cor || "#808080" }}></div>}

        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-2 md:mb-0">{prova.titulo}</h2>
            {renderStatusLabel(prova.status)}
          </div>

          {prova.descricao && (
            <div className="mb-6">
              <p className="text-gray-600 whitespace-pre-line">{prova.descricao}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center text-gray-700 mb-1">
                <FiCalendar className="mr-2" />
                <span className="font-medium">Data da Prova:</span>
              </div>
              <p className="text-gray-600">{formattedData}</p>
            </div>

            {materia && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center text-gray-700 mb-1">
                  <FiBook className="mr-2" />
                  <span className="font-medium">Matéria:</span>
                </div>
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: materia.cor || "#808080" }}
                  ></div>
                  <p className="text-gray-600">{materia.nome}</p>
                </div>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center text-gray-700 mb-1">
                <span className="font-medium">Valor da Prova:</span>
              </div>
              <p className="text-gray-600">{prova.valor !== undefined ? prova.valor : "Não definido"}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center text-gray-700 mb-1">
                <span className="font-medium">Nota Obtida:</span>
              </div>
              <p className="text-gray-600">{prova.nota !== undefined ? prova.nota : "Não atribuída"}</p>
            </div>
          </div>

          <div className="text-sm text-gray-500 italic">Prova criada em {formattedCriacao}</div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-3 justify-between">
          <div className="flex gap-2">
            {prova.status !== Status.CONCLUIDO && (
              <button
                onClick={() => handleStatusChange(Status.CONCLUIDO)}
                disabled={isSubmitting}
                className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
              >
                <FiCheckCircle className="mr-1" /> Marcar como Concluída
              </button>
            )}

            {prova.status === Status.CONCLUIDO && (
              <button
                onClick={() => handleStatusChange(Status.PENDENTE)}
                disabled={isSubmitting}
                className="flex items-center px-3 py-2 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 transition disabled:opacity-50"
              >
                <FiAlertCircle className="mr-1" /> Marcar como Pendente
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <Link
              href={`/admin/provas/${id}/edit`}
              className="flex items-center px-3 py-2 text-sm bg-sky-50 text-sky-600 rounded hover:bg-sky-100 transition"
            >
              <FiEdit2 className="mr-1" /> Editar
            </Link>

            <button
              onClick={confirmDelete}
              disabled={isDeleting}
              className="flex items-center px-3 py-2 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition disabled:opacity-50"
            >
              <FiTrash2 className="mr-1" /> {isDeleting ? "Excluindo..." : "Excluir"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
