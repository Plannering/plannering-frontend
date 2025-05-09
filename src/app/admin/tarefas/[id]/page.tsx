/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft,
  FiEdit3,
  FiTrash2,
  FiCalendar,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiActivity,
  FiInfo,
  FiChevronDown,
  FiChevronUp,
  FiCornerRightDown,
  FiTag,
  FiFlag,
  FiBook,
  FiLayers,
  FiLoader,
} from "react-icons/fi";
import { format, isToday, isTomorrow, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import apiFetch from "@/core/api/fetcher";
import { Status } from "@/core/enum/status.enum";
import { Prioridade } from "@/core/enum/prioridades.enum";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Materia } from "@/core/types/materias";

interface Tarefa {
  id: string;
  titulo: string;
  descricao: string;
  dataVencimento: string;
  prioridade: Prioridade;
  usuarioId: string;
  status: Status;
  materia: Materia;
  materiaId: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function VisualizarTarefa() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [tarefa, setTarefa] = useState<Tarefa | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusChanging, setStatusChanging] = useState(false);
  const [expandirDescricao, setExpandirDescricao] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchTarefa = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const data = await apiFetch<Tarefa>(`tarefas/${id}`);

        if (data.materiaId && !data.materia) {
          try {
            const materiaData = await apiFetch<Materia>(`materias/${data.materiaId}`);
            data.materia = materiaData;
          } catch (materiaErr) {
            data.materia = {
              id: data.materiaId,
              nome: "Matéria não encontrada",
              cor: "#3b82f6",
              dataCriacao: "",
              dataAtualizacao: "",
              usuarioId: "",
            };
          }
        }

        setTarefa(data);
        setError(null);
      } catch (err) {
        setError("Não foi possível carregar os detalhes da tarefa.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTarefa();
  }, [id]);

  const handleDelete = async () => {
    try {
      setShowDeleteConfirm(false);
      await apiFetch(`tarefas/${id}`, {
        method: "DELETE",
      });
      router.push("/admin/tarefas");
    } catch (err) {}
  };

  const handleStatusChange = async (newStatus: Status) => {
    if (!tarefa) return;

    try {
      setStatusChanging(true);

      const tarefaAtualizada = {
        status: newStatus,
        titulo: tarefa.titulo,
        descricao: tarefa.descricao || "",
        prioridade: tarefa.prioridade,
        dataVencimento: tarefa.dataVencimento,
      };
      await apiFetch(`tarefas/${id}`, {
        method: "PATCH",
        body: JSON.stringify(tarefaAtualizada),
      });

      setTarefa({
        ...tarefa,
        status: newStatus,
      });
    } catch (err) {
      console.error("", err);
      alert("Não foi possível atualizar o status da tarefa. Por favor, tente novamente.");
    } finally {
      setStatusChanging(false);
    }
  };

  const getDateStatus = (dateString: string) => {
    // Converter a data brasileira (dd/mm/yyyy) para um objeto Date
    const parts = dateString.split("/");
    if (parts.length !== 3) return "ok";

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Meses em JS são 0-indexed
    const year = parseInt(parts[2], 10);

    const date = new Date(year, month, day);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) {
      return "expired";
    }

    const diffDays = differenceInDays(date, today);
    if (diffDays <= 3) {
      return "soon";
    }

    return "ok";
  };

  const formatRelativeDate = (dateString: string) => {
    // Converter a data brasileira (dd/mm/yyyy) para um objeto Date
    const parts = dateString.split("/");
    if (parts.length !== 3) return dateString;

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Meses em JS são 0-indexed
    const year = parseInt(parts[2], 10);

    const date = new Date(year, month, day);

    if (isToday(date)) {
      return "Hoje";
    } else if (isTomorrow(date)) {
      return "Amanhã";
    } else {
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    }
  };

  const isTaskExpired = (task: Tarefa) => {
    return task.status !== Status.CONCLUIDO && getDateStatus(task.dataVencimento) === "expired";
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case Status.PENDENTE:
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200 py-1 px-2.5 gap-1.5 text-xs font-medium"
          >
            <FiClock size={12} /> Pendente
          </Badge>
        );
      case Status.EM_ANDAMENTO:
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 py-1 px-2.5 gap-1.5 text-xs font-medium"
          >
            <FiLoader size={12} /> Em andamento
          </Badge>
        );
      case Status.CONCLUIDO:
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 py-1 px-2.5 gap-1.5 text-xs font-medium"
          >
            <FiCheckCircle size={12} /> Concluída
          </Badge>
        );
      case Status.CANCELADO:
        return (
          <Badge
            variant="outline"
            className="bg-slate-50 text-slate-700 border-slate-200 py-1 px-2.5 gap-1.5 text-xs font-medium"
          >
            <FiFlag size={12} /> Cancelada
          </Badge>
        );
      default:
        return null;
    }
  };

  const renderPrioridadeBadge = (prioridade: string) => {
    switch (prioridade) {
      case Prioridade.BAIXA:
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 py-1 px-2.5 gap-1.5 text-xs font-medium"
          >
            <div className="w-2 h-2 rounded-full bg-blue-600"></div> Baixa
          </Badge>
        );
      case Prioridade.MEDIA:
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200 py-1 px-2.5 gap-1.5 text-xs font-medium"
          >
            <div className="w-2 h-2 rounded-full bg-yellow-600"></div> Média
          </Badge>
        );
      case Prioridade.ALTA:
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 py-1 px-2.5 gap-1.5 text-xs font-medium"
          >
            <div className="w-2 h-2 rounded-full bg-red-600"></div> Alta
          </Badge>
        );
      case Prioridade.URGENTE:
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200 py-1 px-2.5 gap-1.5 text-xs font-medium"
          >
            <div className="w-2 h-2 rounded-full bg-purple-600"></div> Urgente
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-3 sm:px-5 py-4 sm:py-8 animate-in fade-in duration-300">
        <div className="mb-5">
          <Link
            href="/admin/tarefas"
            className="flex items-center text-sky-600 hover:text-sky-700 font-medium transition text-sm"
          >
            <FiArrowLeft className="mr-1.5" size={16} /> Voltar para tarefas
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 sm:p-8 text-center border border-slate-100">
          <div className="animate-pulse space-y-4">
            <div className="h-7 bg-slate-200 rounded-md w-2/3 mx-auto"></div>
            <div className="h-4 bg-slate-200 rounded-md w-1/2 mx-auto"></div>
            <div className="h-20 bg-slate-200 rounded-md w-full mx-auto mt-6"></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="h-12 bg-slate-200 rounded-md"></div>
              <div className="h-12 bg-slate-200 rounded-md"></div>
              <div className="h-12 bg-slate-200 rounded-md"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tarefa) {
    return (
      <div className="container mx-auto px-3 sm:px-5 py-4 sm:py-8 animate-in fade-in duration-300">
        <div className="mb-5">
          <Link
            href="/admin/tarefas"
            className="flex items-center text-sky-600 hover:text-sky-700 font-medium transition text-sm"
          >
            <FiArrowLeft className="mr-1.5" size={16} /> Voltar para tarefas
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-center">
            <FiAlertCircle className="text-red-500 mr-2 flex-shrink-0" size={20} />
            <p className="text-red-700 text-sm">{error || "Tarefa não encontrada"}</p>
          </div>
        </div>
      </div>
    );
  }

  const taskExpired = isTaskExpired(tarefa);
  const materiaColor = tarefa.materia?.cor || "#3b82f6";
  const dateStatus = getDateStatus(tarefa.dataVencimento);

  return (
    <div className="container mx-auto px-3 sm:px-5 py-4 sm:py-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <Link
          href="/admin/tarefas"
          className="flex items-center text-sky-600 hover:text-sky-700 font-medium transition text-sm"
        >
          <FiArrowLeft className="mr-1.5" size={16} /> Voltar para tarefas
        </Link>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Link
            href={`/admin/tarefas/editar/${id}`}
            className="flex items-center justify-center bg-sky-50 hover:bg-sky-100 text-sky-600 px-3 py-1.5 rounded-lg transition text-xs font-medium gap-1.5"
          >
            <FiEdit3 size={14} /> Editar
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg transition text-xs font-medium gap-1.5"
          >
            <FiTrash2 size={14} /> Excluir
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl p-5 max-w-md w-full shadow-lg animate-in slide-in-from-bottom-5 duration-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Excluir tarefa</h3>
            <p className="text-slate-600 text-sm mb-4">
              Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg transition text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition text-sm"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
        {/* Cabeçalho com estilo baseado na cor da matéria */}
        <div
          className="py-4 px-4 sm:px-6 border-b border-slate-100"
          style={{
            borderLeft: `4px solid ${materiaColor}`,
            backgroundImage: `linear-gradient(to right, ${materiaColor}10, white)`,
          }}
        >
          <div className="flex justify-between items-start gap-3 flex-wrap sm:flex-nowrap">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-800 mb-1">{tarefa.titulo}</h1>

              <div className="flex flex-wrap gap-2 items-center mb-1">
                {renderStatusBadge(tarefa.status)}
                {renderPrioridadeBadge(tarefa.prioridade)}
              </div>

              <div className="flex flex-wrap gap-2 items-center text-xs text-slate-500 mt-2">
                {tarefa.createdAt && (
                  <span className="flex items-center gap-1">
                    <FiInfo size={12} /> Criada em {format(new Date(tarefa.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                )}

                {tarefa.updatedAt && tarefa.createdAt !== tarefa.updatedAt && (
                  <span className="flex items-center gap-1">
                    <FiActivity size={12} /> Atualizada em{" "}
                    {format(new Date(tarefa.updatedAt), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="p-4 sm:p-6">
          {/* Cards de informações importantes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {/* Card de data de vencimento */}
            <div
              className={`
                rounded-lg overflow-hidden border
                ${
                  dateStatus === "expired"
                    ? "border-red-200 bg-gradient-to-r from-red-50 to-white"
                    : dateStatus === "soon"
                    ? "border-amber-200 bg-gradient-to-r from-amber-50 to-white"
                    : "border-slate-200 bg-gradient-to-r from-slate-50 to-white"
                }
              `}
            >
              <div className="p-4">
                <h3 className="text-xs font-medium text-slate-500 mb-1 flex items-center">
                  <FiCalendar size={14} className="mr-1.5" />
                  Data de vencimento
                </h3>

                <div className="mt-1.5">
                  <div
                    className={`font-semibold text-base 
                      ${
                        dateStatus === "expired"
                          ? "text-red-700"
                          : dateStatus === "soon"
                          ? "text-amber-700"
                          : "text-slate-700"
                      }
                    `}
                  >
                    {formatRelativeDate(tarefa.dataVencimento)}
                  </div>

                  <div className="text-xs mt-1">
                    {dateStatus === "expired" && (
                      <span className="inline-flex items-center text-red-600 gap-1">
                        <FiAlertCircle size={12} /> Tarefa vencida
                      </span>
                    )}
                    {dateStatus === "soon" && (
                      <span className="inline-flex items-center text-amber-600 gap-1">
                        <FiClock size={12} /> Vence em breve
                      </span>
                    )}
                    {dateStatus === "ok" && (
                      <span className="inline-flex items-center text-slate-500 gap-1">
                        <FiInfo size={12} /> Data de entrega
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Card de matéria */}
            <div className="rounded-lg overflow-hidden border border-slate-200 bg-gradient-to-r from-slate-50 to-white">
              <div className="p-4">
                <h3 className="text-xs font-medium text-slate-500 mb-1 flex items-center">
                  <FiBook size={14} className="mr-1.5" />
                  Matéria
                </h3>

                <div className="mt-1.5 flex items-center">
                  <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: materiaColor }}></div>
                  <div className="font-semibold text-base" style={{ color: materiaColor }}>
                    {tarefa.materia?.nome || "Matéria não definida"}
                  </div>
                </div>

                <div className="text-xs mt-1 text-slate-500 flex items-center gap-1">
                  <FiTag size={12} /> Categoria da tarefa
                </div>
              </div>
            </div>

            {/* Card de prioridade */}
            <div className="rounded-lg overflow-hidden border border-slate-200 bg-gradient-to-r from-slate-50 to-white">
              <div className="p-4">
                <h3 className="text-xs font-medium text-slate-500 mb-1 flex items-center">
                  <FiFlag size={14} className="mr-1.5" />
                  Prioridade
                </h3>

                <div className="mt-1.5">
                  <div className="flex items-center">
                    {tarefa.prioridade === Prioridade.BAIXA && (
                      <div className="font-semibold text-base text-blue-600 flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-600"></div>
                        Baixa
                      </div>
                    )}
                    {tarefa.prioridade === Prioridade.MEDIA && (
                      <div className="font-semibold text-base text-yellow-600 flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-yellow-600"></div>
                        Média
                      </div>
                    )}
                    {tarefa.prioridade === Prioridade.ALTA && (
                      <div className="font-semibold text-base text-red-600 flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-600"></div>
                        Alta
                      </div>
                    )}
                    {tarefa.prioridade === Prioridade.URGENTE && (
                      <div className="font-semibold text-base text-purple-600 flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-purple-600"></div>
                        Urgente
                      </div>
                    )}
                  </div>

                  <div className="text-xs mt-1 text-slate-500 flex items-center gap-1">
                    <FiLayers size={12} /> Nível de importância
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Descrição da tarefa */}
          <div className="mb-6">
            <h2 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
              <FiCornerRightDown size={14} className="mr-1.5 text-slate-400" />
              Descrição da tarefa
            </h2>

            <div
              className={`
              bg-slate-50 rounded-lg p-4 text-slate-700 border border-slate-200
              ${
                !expandirDescricao && tarefa.descricao && tarefa.descricao.length > 150
                  ? "max-h-40 overflow-hidden relative"
                  : ""
              }
            `}
            >
              {tarefa.descricao ? (
                <div className="whitespace-pre-line text-sm">{tarefa.descricao}</div>
              ) : (
                <div className="text-slate-400 italic text-sm">Nenhuma descrição fornecida</div>
              )}

              {!expandirDescricao && tarefa.descricao && tarefa.descricao.length > 150 && (
                <>
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 to-transparent"></div>
                  <button
                    onClick={() => setExpandirDescricao(true)}
                    className="absolute bottom-2 right-2 text-xs bg-white px-2 py-1 rounded-md border border-slate-200 text-sky-600 hover:text-sky-700 flex items-center gap-1"
                  >
                    <FiChevronDown size={12} /> Ver tudo
                  </button>
                </>
              )}

              {expandirDescricao && tarefa.descricao && tarefa.descricao.length > 150 && (
                <button
                  onClick={() => setExpandirDescricao(false)}
                  className="mt-3 text-xs bg-white px-2 py-1 rounded-md border border-slate-200 text-sky-600 hover:text-sky-700 flex items-center gap-1 ml-auto"
                >
                  <FiChevronUp size={12} /> Mostrar menos
                </button>
              )}
            </div>
          </div>

          <Separator className="mb-5 bg-slate-100" />

          {/* Seção de atualização de status */}
          <div>
            <h2 className="text-sm font-medium text-slate-700 mb-3 flex items-center">
              <FiActivity size={14} className="mr-1.5 text-slate-400" />
              Atualizar status
            </h2>

            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={() => handleStatusChange(Status.PENDENTE)}
                disabled={statusChanging || tarefa.status === Status.PENDENTE}
                className={`
                  flex items-center rounded-lg px-3 py-2 transition text-xs font-medium gap-1.5
                  ${
                    tarefa.status === Status.PENDENTE
                      ? "bg-amber-100 text-amber-700 font-medium cursor-default ring-1 ring-amber-200"
                      : "bg-white border border-amber-200 text-amber-600 hover:bg-amber-50"
                  }
                  ${statusChanging ? "opacity-60 cursor-not-allowed" : ""}
                `}
              >
                <FiClock size={14} /> Pendente
              </button>

              <button
                onClick={() => handleStatusChange(Status.EM_ANDAMENTO)}
                disabled={statusChanging || tarefa.status === Status.EM_ANDAMENTO}
                className={`
                  flex items-center rounded-lg px-3 py-2 transition text-xs font-medium gap-1.5
                  ${
                    tarefa.status === Status.EM_ANDAMENTO
                      ? "bg-blue-100 text-blue-700 font-medium cursor-default ring-1 ring-blue-200"
                      : "bg-white border border-blue-200 text-blue-600 hover:bg-blue-50"
                  }
                  ${statusChanging ? "opacity-60 cursor-not-allowed" : ""}
                `}
              >
                <FiLoader size={14} /> Em andamento
              </button>

              <button
                onClick={() => handleStatusChange(Status.CONCLUIDO)}
                disabled={statusChanging || tarefa.status === Status.CONCLUIDO}
                className={`
                  flex items-center rounded-lg px-3 py-2 transition text-xs font-medium gap-1.5
                  ${
                    tarefa.status === Status.CONCLUIDO
                      ? "bg-green-100 text-green-700 font-medium cursor-default ring-1 ring-green-200"
                      : "bg-white border border-green-200 text-green-600 hover:bg-green-50"
                  }
                  ${statusChanging ? "opacity-60 cursor-not-allowed" : ""}
                `}
              >
                <FiCheckCircle size={14} /> Concluída
              </button>

              <button
                onClick={() => handleStatusChange(Status.CANCELADO)}
                disabled={statusChanging || tarefa.status === Status.CANCELADO}
                className={`
                  flex items-center rounded-lg px-3 py-2 transition text-xs font-medium gap-1.5
                  ${
                    tarefa.status === Status.CANCELADO
                      ? "bg-slate-100 text-slate-700 font-medium cursor-default ring-1 ring-slate-200"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }
                  ${statusChanging ? "opacity-60 cursor-not-allowed" : ""}
                `}
              >
                <FiFlag size={14} /> Cancelada
              </button>

              {statusChanging && (
                <div className="flex items-center text-sky-600 text-xs font-medium">
                  <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span>Atualizando...</span>
                </div>
              )}
            </div>

            {tarefa.status === Status.CONCLUIDO && (
              <div className="mt-3 text-xs text-green-600 bg-green-50 py-2 px-3 rounded-md border border-green-100 flex items-center">
                <FiInfo size={14} className="mr-1.5" />
                Esta tarefa foi marcada como concluída.
              </div>
            )}

            {tarefa.status === Status.CANCELADO && (
              <div className="mt-3 text-xs text-slate-600 bg-slate-50 py-2 px-3 rounded-md border border-slate-100 flex items-center">
                <FiInfo size={14} className="mr-1.5" />
                Esta tarefa foi cancelada.
              </div>
            )}

            {tarefa.status !== Status.CONCLUIDO && tarefa.status !== Status.CANCELADO && taskExpired && (
              <div className="mt-3 text-xs text-red-600 bg-red-50 py-2 px-3 rounded-md border border-red-100 flex items-center">
                <FiAlertCircle size={14} className="mr-1.5" />
                Esta tarefa está vencida. Considere atualizá-la ou marcá-la como concluída.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
