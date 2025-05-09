/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft,
  FiEdit3,
  FiTrash2,
  FiCheck,
  FiX,
  FiFileText,
  FiCalendar,
  FiBook,
  FiAlertCircle,
  FiAlertTriangle,
  FiClock,
  FiActivity,
  FiInfo,
  FiCheckCircle,
  FiFlag,
  FiChevronDown,
  FiChevronUp,
  FiCornerRightDown,
  FiLayers,
  FiTag,
  FiLoader,
} from "react-icons/fi";
import { format, isToday, isTomorrow, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

import apiFetch from "@/core/api/fetcher";
import { buscarAtividadebyId } from "@/core/api/atividades";
import { Status } from "@/core/enum/status.enum";
import { Prioridade } from "@/core/enum/prioridades.enum";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Materia {
  id: string;
  nome: string;
  cor: string;
}

interface Atividade {
  id: string;
  titulo: string;
  descricao?: string;
  dataVencimento?: string;
  nota?: number;
  status: Status;
  prioridade?: string;
  materiaId?: string;
  materia?: Materia;
  usuarioId: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function VisualizarAtividade() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [atividade, setAtividade] = useState<Atividade | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusChanging, setStatusChanging] = useState(false);
  const [expandirDescricao, setExpandirDescricao] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchAtividade = async () => {
      try {
        setIsLoading(true);
        const data = await buscarAtividadebyId(id);

        // Ajustando o formato dos dados
        setAtividade({
          ...data,
          dataVencimento: data.dataVencimento ? data.dataVencimento.toString() : undefined,
          createdAt: data.dataCriacao,
          updatedAt: data.dataAtualizacao,
        });

        if (data.materiaId && !data.materiaId) {
          try {
            const materiaData = await apiFetch<Materia>(`materias/${data.materiaId}`);
            setAtividade((prev) => (prev ? { ...prev, materia: materiaData } : null));
          } catch (materiaErr) {
            console.error("Erro ao buscar matéria:", materiaErr);
          }
        }

        setError(null);
      } catch (err) {
        console.error("Erro ao buscar atividade:", err);
        setError("Não foi possível carregar os detalhes da atividade.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchAtividade();
    }
  }, [id]);

  const handleDelete = async () => {
    if (!atividade) return;

    try {
      setShowDeleteConfirm(false);
      await apiFetch(`atividades/${id}`, {
        method: "DELETE",
      });
      router.push("/admin/atividades");
    } catch (err) {
      console.error("Erro ao excluir atividade:", err);
      setError("Não foi possível excluir a atividade.");
    }
  };

  const handleStatusChange = async (newStatus: Status) => {
    if (!atividade) return;

    try {
      setStatusChanging(true);

      const atividadeAtualizada = {
        status: newStatus,
      };

      await apiFetch(`atividades/${id}`, {
        method: "PATCH",
        body: JSON.stringify(atividadeAtualizada),
      });

      setAtividade({
        ...atividade,
        status: newStatus,
      });
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      alert("Não foi possível atualizar o status da atividade. Por favor, tente novamente.");
    } finally {
      setStatusChanging(false);
    }
  };

  const converterDataBrasileira = (dataString?: string | null): Date | null => {
    if (!dataString) return null;

    // Verifica primeiro se é uma data em formato ISO
    if (dataString.includes("-") || dataString.includes("T")) {
      return new Date(dataString);
    }

    // Caso contrário, assume formato dd/mm/yyyy
    const partes = dataString.split("/");
    if (partes.length !== 3) return null;

    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1; // Meses em JS são 0-indexed
    const ano = parseInt(partes[2], 10);

    return new Date(ano, mes, dia);
  };

  const getDateStatus = (dataString?: string | null) => {
    if (!dataString) return "ok";

    const data = converterDataBrasileira(dataString);
    if (!data) return "ok";

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (data < hoje) {
      return "expired";
    }

    const diffDays = differenceInDays(data, hoje);
    if (diffDays <= 3) {
      return "soon";
    }

    return "ok";
  };

  const formatRelativeDate = (dataString?: string | null) => {
    if (!dataString) return "Data não definida";

    const data = converterDataBrasileira(dataString);
    if (!data) return dataString;

    if (isToday(data)) {
      return "Hoje";
    } else if (isTomorrow(data)) {
      return "Amanhã";
    } else {
      return format(data, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    }
  };

  const isAtividadeExpired = (atividade: Atividade) => {
    return (
      atividade.status !== Status.CONCLUIDO &&
      atividade.status !== Status.CANCELADO &&
      getDateStatus(atividade.dataVencimento) === "expired"
    );
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

  const renderPrioridadeBadge = (prioridade?: string) => {
    if (!prioridade) return null;

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
            href="/admin/atividades"
            className="flex items-center text-sky-600 hover:text-sky-700 font-medium transition text-sm"
          >
            <FiArrowLeft className="mr-1.5" size={16} /> Voltar para atividades
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

  if (error || !atividade) {
    return (
      <div className="container mx-auto px-3 sm:px-5 py-4 sm:py-8 animate-in fade-in duration-300">
        <div className="mb-5">
          <Link
            href="/admin/atividades"
            className="flex items-center text-sky-600 hover:text-sky-700 font-medium transition text-sm"
          >
            <FiArrowLeft className="mr-1.5" size={16} /> Voltar para atividades
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-center">
            <FiAlertCircle className="text-red-500 mr-2 flex-shrink-0" size={20} />
            <p className="text-red-700 text-sm">{error || "Atividade não encontrada"}</p>
          </div>
        </div>
      </div>
    );
  }

  const atividadeExpired = isAtividadeExpired(atividade);
  const materiaColor = atividade.materia?.cor || "#3b82f6";
  const dateStatus = getDateStatus(atividade.dataVencimento);

  return (
    <div className="container mx-auto px-3 sm:px-5 py-4 sm:py-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <Link
          href="/admin/atividades"
          className="flex items-center text-sky-600 hover:text-sky-700 font-medium transition text-sm"
        >
          <FiArrowLeft className="mr-1.5" size={16} /> Voltar para atividades
        </Link>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Link
            href={`/admin/atividades/editar/${id}`}
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
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Excluir atividade</h3>
            <p className="text-slate-600 text-sm mb-4">
              Tem certeza que deseja excluir esta atividade? Esta ação não pode ser desfeita.
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
              <h1 className="text-lg sm:text-xl font-bold text-slate-800 mb-1">{atividade.titulo}</h1>

              <div className="flex flex-wrap gap-2 items-center mb-1">
                {renderStatusBadge(atividade.status)}
                {renderPrioridadeBadge(atividade.prioridade)}
              </div>

              <div className="flex flex-wrap gap-2 items-center text-xs text-slate-500 mt-2">
                {atividade.createdAt && (
                  <span className="flex items-center gap-1">
                    <FiInfo size={12} /> Criada em{" "}
                    {format(new Date(atividade.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                )}

                {atividade.updatedAt && atividade.createdAt !== atividade.updatedAt && (
                  <span className="flex items-center gap-1">
                    <FiActivity size={12} /> Atualizada em{" "}
                    {format(new Date(atividade.updatedAt), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="p-4 sm:p-6">
          {/* Cards de informações importantes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {/* Card de data de entrega */}
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
                  Data de Entrega
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
                    {formatRelativeDate(atividade.dataVencimento)}
                  </div>

                  <div className="text-xs mt-1">
                    {dateStatus === "expired" && (
                      <span className="inline-flex items-center text-red-600 gap-1">
                        <FiAlertCircle size={12} /> Atividade vencida
                      </span>
                    )}
                    {dateStatus === "soon" && (
                      <span className="inline-flex items-center text-amber-600 gap-1">
                        <FiClock size={12} /> Entrega em breve
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
                    {atividade.materia?.nome || "Matéria não definida"}
                  </div>
                </div>

                <div className="text-xs mt-1 text-slate-500 flex items-center gap-1">
                  <FiTag size={12} /> Disciplina da atividade
                </div>
              </div>
            </div>

            {/* Card de nota */}
            <div className="rounded-lg overflow-hidden border border-slate-200 bg-gradient-to-r from-slate-50 to-white">
              <div className="p-4">
                <h3 className="text-xs font-medium text-slate-500 mb-1 flex items-center">
                  <FiFileText size={14} className="mr-1.5" />
                  Nota
                </h3>

                <div className="mt-1.5">
                  <div className="font-semibold text-base text-slate-700">
                    {atividade.nota !== undefined && atividade.nota !== null ? (
                      `${atividade.nota.toFixed(1)} / 10`
                    ) : (
                      <span className="text-slate-500 italic font-normal">Não atribuída</span>
                    )}
                  </div>

                  <div className="text-xs mt-1 text-slate-500 flex items-center gap-1">
                    <FiLayers size={12} /> Avaliação da atividade
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Descrição da atividade */}
          <div className="mb-6">
            <h2 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
              <FiCornerRightDown size={14} className="mr-1.5 text-slate-400" />
              Descrição da atividade
            </h2>

            <div
              className={`
              bg-slate-50 rounded-lg p-4 text-slate-700 border border-slate-200
              ${
                !expandirDescricao && atividade.descricao && atividade.descricao.length > 150
                  ? "max-h-40 overflow-hidden relative"
                  : ""
              }
            `}
            >
              {atividade.descricao ? (
                <div className="whitespace-pre-line text-sm">{atividade.descricao}</div>
              ) : (
                <div className="text-slate-400 italic text-sm">Nenhuma descrição fornecida</div>
              )}

              {!expandirDescricao && atividade.descricao && atividade.descricao.length > 150 && (
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

              {expandirDescricao && atividade.descricao && atividade.descricao.length > 150 && (
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
                disabled={statusChanging || atividade.status === Status.PENDENTE}
                className={`
                  flex items-center rounded-lg px-3 py-2 transition text-xs font-medium gap-1.5
                  ${
                    atividade.status === Status.PENDENTE
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
                disabled={statusChanging || atividade.status === Status.EM_ANDAMENTO}
                className={`
                  flex items-center rounded-lg px-3 py-2 transition text-xs font-medium gap-1.5
                  ${
                    atividade.status === Status.EM_ANDAMENTO
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
                disabled={statusChanging || atividade.status === Status.CONCLUIDO}
                className={`
                  flex items-center rounded-lg px-3 py-2 transition text-xs font-medium gap-1.5
                  ${
                    atividade.status === Status.CONCLUIDO
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
                disabled={statusChanging || atividade.status === Status.CANCELADO}
                className={`
                  flex items-center rounded-lg px-3 py-2 transition text-xs font-medium gap-1.5
                  ${
                    atividade.status === Status.CANCELADO
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

            {atividade.status === Status.CONCLUIDO && (
              <div className="mt-3 text-xs text-green-600 bg-green-50 py-2 px-3 rounded-md border border-green-100 flex items-center">
                <FiInfo size={14} className="mr-1.5" />
                Esta atividade foi marcada como concluída.
              </div>
            )}

            {atividade.status === Status.CANCELADO && (
              <div className="mt-3 text-xs text-slate-600 bg-slate-50 py-2 px-3 rounded-md border border-slate-100 flex items-center">
                <FiInfo size={14} className="mr-1.5" />
                Esta atividade foi cancelada.
              </div>
            )}

            {atividade.status !== Status.CONCLUIDO && atividade.status !== Status.CANCELADO && atividadeExpired && (
              <div className="mt-3 text-xs text-red-600 bg-red-50 py-2 px-3 rounded-md border border-red-100 flex items-center">
                <FiAlertCircle size={14} className="mr-1.5" />
                Esta atividade está com o prazo vencido. Considere atualizá-la ou marcá-la como concluída.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
