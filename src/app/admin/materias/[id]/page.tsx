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
  FiList,
  FiAlertCircle,
  FiClock,
  FiInfo,
  FiChevronDown,
  FiChevronUp,
  FiChevronRight,
  FiMessageSquare,
  FiFileText,
  FiBookOpen,
  FiLayers,
  FiActivity,
  FiFlag,
  FiCheckCircle,
  FiExternalLink,
  FiPlus,
  FiAward,
  FiLoader,
} from "react-icons/fi";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import apiFetch from "@/core/api/fetcher";
import { Status } from "@/core/enum/status.enum";
import { ModalDelete } from "@/core/components/Modal/ModalDelet";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Tarefa {
  id: string;
  titulo: string;
  dataVencimento: string;
  status: Status;
  prioridade: string;
  materiaId?: string;
}

interface Atividade {
  id: string;
  titulo: string;
  dataEntrega?: string;
  dataVencimento?: string;
  nota?: number;
  status: Status;
  materiaId?: string;
}

interface Prova {
  id: string;
  titulo: string;
  dataProva?: string;
  valor?: number;
  nota?: number;
  status: Status;
  materiaId?: string;
}

interface Materia {
  id: string;
  nome: string;
  descricao: string;
  cor: string;
  dataCriacao?: string;
  dataAtualizacao?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function VisualizarMateria() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [materia, setMateria] = useState<Materia | null>(null);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [provas, setProvas] = useState<Prova[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTarefas, setIsLoadingTarefas] = useState(true);
  const [isLoadingAtividades, setIsLoadingAtividades] = useState(true);
  const [isLoadingProvas, setIsLoadingProvas] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expandirDescricao, setExpandirDescricao] = useState(false);
  const [expandirTarefas, setExpandirTarefas] = useState(true);
  const [expandirAtividades, setExpandirAtividades] = useState(true);
  const [expandirProvas, setExpandirProvas] = useState(true);

  // Estatísticas
  const [stats, setStats] = useState({
    tarefasPendentes: 0,
    tarefasEmAndamento: 0,
    tarefasConcluidas: 0,
    tarefasCanceladas: 0,
    atividadesPendentes: 0,
    atividadesEmAndamento: 0,
    atividadesConcluidas: 0,
    atividadesCanceladas: 0,
    provasPendentes: 0,
    provasEmAndamento: 0,
    provasConcluidas: 0,
    provasCanceladas: 0,
    total: 0,
  });

  // Buscar detalhes da matéria
  useEffect(() => {
    const fetchMateria = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const data = await apiFetch<Materia>(`materias/${id}`);
        setMateria(data);
        setError(null);
      } catch (err) {
        console.error("Erro ao buscar matéria:", err);
        setError("Não foi possível carregar os detalhes da matéria.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMateria();
  }, [id]);

  // Buscar tarefas
  useEffect(() => {
    const fetchTarefas = async () => {
      if (!id) return;

      try {
        setIsLoadingTarefas(true);
        // Busca todas as tarefas
        const allTarefas = await apiFetch<Tarefa[]>(`tarefas`);

        // Filtra apenas tarefas da matéria atual
        const tarefasDaMateria = allTarefas.filter((t) => t.materiaId === id);
        setTarefas(tarefasDaMateria);

        // Calcular estatísticas
        const pendentes = tarefasDaMateria.filter((t) => t.status === Status.PENDENTE).length;
        const emAndamento = tarefasDaMateria.filter((t) => t.status === Status.EM_ANDAMENTO).length;
        const concluidas = tarefasDaMateria.filter((t) => t.status === Status.CONCLUIDO).length;
        const canceladas = tarefasDaMateria.filter((t) => t.status === Status.CANCELADO).length;

        setStats((prev) => ({
          ...prev,
          tarefasPendentes: pendentes,
          tarefasEmAndamento: emAndamento,
          tarefasConcluidas: concluidas,
          tarefasCanceladas: canceladas,
          total: prev.total + tarefasDaMateria.length,
        }));
      } catch (err) {
        console.error("Erro ao buscar tarefas:", err);
        setTarefas([]);
      } finally {
        setIsLoadingTarefas(false);
      }
    };

    fetchTarefas();
  }, [id]);

  // Buscar atividades
  useEffect(() => {
    const fetchAtividades = async () => {
      if (!id) return;

      try {
        setIsLoadingAtividades(true);
        // Busca todas as atividades
        const allAtividades = await apiFetch<Atividade[]>(`atividades`);

        // Filtra apenas atividades da matéria atual
        const atividadesDaMateria = allAtividades.filter((a) => a.materiaId === id);
        setAtividades(atividadesDaMateria);

        // Calcular estatísticas
        const pendentes = atividadesDaMateria.filter((a) => a.status === Status.PENDENTE).length;
        const emAndamento = atividadesDaMateria.filter((a) => a.status === Status.EM_ANDAMENTO).length;
        const concluidas = atividadesDaMateria.filter((a) => a.status === Status.CONCLUIDO).length;
        const canceladas = atividadesDaMateria.filter((a) => a.status === Status.CANCELADO).length;

        setStats((prev) => ({
          ...prev,
          atividadesPendentes: pendentes,
          atividadesEmAndamento: emAndamento,
          atividadesConcluidas: concluidas,
          atividadesCanceladas: canceladas,
          total: prev.total + atividadesDaMateria.length,
        }));
      } catch (err) {
        console.error("Erro ao buscar atividades:", err);
        setAtividades([]);
      } finally {
        setIsLoadingAtividades(false);
      }
    };

    fetchAtividades();
  }, [id]);

  // Buscar provas
  useEffect(() => {
    const fetchProvas = async () => {
      if (!id) return;

      try {
        setIsLoadingProvas(true);
        // Busca todas as provas
        const allProvas = await apiFetch<Prova[]>(`provas`);

        // Filtra apenas provas da matéria atual
        const provasDaMateria = allProvas.filter((p) => p.materiaId === id);
        setProvas(provasDaMateria);

        // Calcular estatísticas
        const pendentes = provasDaMateria.filter((p) => p.status === Status.PENDENTE).length;
        const emAndamento = provasDaMateria.filter((p) => p.status === Status.EM_ANDAMENTO).length;
        const concluidas = provasDaMateria.filter((p) => p.status === Status.CONCLUIDO).length;
        const canceladas = provasDaMateria.filter((p) => p.status === Status.CANCELADO).length;

        setStats((prev) => ({
          ...prev,
          provasPendentes: pendentes,
          provasEmAndamento: emAndamento,
          provasConcluidas: concluidas,
          provasCanceladas: canceladas,
          total: prev.total + provasDaMateria.length,
        }));
      } catch (err) {
        console.error("Erro ao buscar provas:", err);
        setProvas([]);
      } finally {
        setIsLoadingProvas(false);
      }
    };

    fetchProvas();
  }, [id]);

  const handleDelete = async () => {
    try {
      setShowDeleteConfirm(false);

      await apiFetch(`materias/${id}`, {
        method: "DELETE",
      });
      router.push("/admin/materias");
    } catch (err) {
      console.error("Erro ao excluir matéria:", err);
      alert("Erro ao excluir a matéria. Por favor, tente novamente.");
    }
  };

  const formatDateFriendly = (dateString?: string) => {
    if (!dateString) return "Data não definida";

    try {
      const date = new Date(dateString);
      return format(date, "dd 'de' MMMM, yyyy", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  const renderStatusBadge = (status: Status) => {
    switch (status) {
      case Status.PENDENTE:
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200 py-0.5 px-1.5 gap-1 text-[10px]"
          >
            <FiClock size={10} /> Pendente
          </Badge>
        );
      case Status.EM_ANDAMENTO:
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 py-0.5 px-1.5 gap-1 text-[10px]">
            <FiLoader size={10} /> Em andamento
          </Badge>
        );
      case Status.CONCLUIDO:
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 py-0.5 px-1.5 gap-1 text-[10px]"
          >
            <FiCheckCircle size={10} /> Concluída
          </Badge>
        );
      case Status.CANCELADO:
        return (
          <Badge
            variant="outline"
            className="bg-slate-50 text-slate-700 border-slate-200 py-0.5 px-1.5 gap-1 text-[10px]"
          >
            <FiFlag size={10} /> Cancelada
          </Badge>
        );
      default:
        return null;
    }
  };

  const getTotalItensPendentes = () => {
    return stats.tarefasPendentes + stats.atividadesPendentes + stats.provasPendentes;
  };

  if (isLoading || isLoadingTarefas || isLoadingAtividades || isLoadingProvas) {
    return (
      <div className="container mx-auto px-3 sm:px-5 py-4 sm:py-8 animate-in fade-in duration-300">
        <div className="mb-5">
          <Link
            href="/admin/materias"
            className="flex items-center text-sky-600 hover:text-sky-700 font-medium transition text-sm"
          >
            <FiArrowLeft className="mr-1.5" size={16} /> Voltar para matérias
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 sm:p-8 text-center border border-slate-100">
          <div className="animate-pulse space-y-4">
            <div className="h-7 bg-slate-200 rounded-md w-2/3 mx-auto"></div>
            <div className="h-4 bg-slate-200 rounded-md w-1/2 mx-auto"></div>
            <div className="h-20 bg-slate-200 rounded-md w-full mx-auto mt-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="h-12 bg-slate-200 rounded-md"></div>
              <div className="h-12 bg-slate-200 rounded-md"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !materia) {
    return (
      <div className="container mx-auto px-3 sm:px-5 py-4 sm:py-8 animate-in fade-in duration-300">
        <div className="mb-5">
          <Link
            href="/admin/materias"
            className="flex items-center text-sky-600 hover:text-sky-700 font-medium transition text-sm"
          >
            <FiArrowLeft className="mr-1.5" size={16} /> Voltar para matérias
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-center">
            <FiAlertCircle className="text-red-500 mr-2 flex-shrink-0" size={20} />
            <p className="text-red-700 text-sm">{error || "Matéria não encontrada"}</p>
          </div>
        </div>
      </div>
    );
  }

  const totalItens = tarefas.length + atividades.length + provas.length;

  return (
    <div className="container mx-auto px-3 sm:px-5 py-4 sm:py-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <Link
          href="/admin/materias"
          className="flex items-center text-sky-600 hover:text-sky-700 font-medium transition text-sm"
        >
          <FiArrowLeft className="mr-1.5" size={16} /> Voltar para matérias
        </Link>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Link
            href={`/admin/materias/editar/${id}`}
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

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
        {/* Cabeçalho com estilo baseado na cor da matéria */}
        <div
          className="py-4 px-4 sm:px-6 border-b border-slate-100"
          style={{
            borderLeft: `4px solid ${materia.cor}`,
            backgroundImage: `linear-gradient(to right, ${materia.cor}10, white)`,
          }}
        >
          <div className="flex justify-between items-start gap-3 flex-wrap sm:flex-nowrap">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full" style={{ backgroundColor: materia.cor }}></div>
                {materia.nome}
              </h1>

              <div className="flex flex-wrap gap-2 items-center text-xs text-slate-500 mt-2">
                {(materia.createdAt || materia.dataCriacao) && (
                  <span className="flex items-center gap-1">
                    <FiInfo size={12} /> Criada em {formatDateFriendly(materia.createdAt || materia.dataCriacao)}
                  </span>
                )}

                {((materia.updatedAt && materia.createdAt !== materia.updatedAt) ||
                  (materia.dataAtualizacao && materia.dataCriacao !== materia.dataAtualizacao)) && (
                  <span className="flex items-center gap-1">
                    <FiActivity size={12} /> Atualizada em{" "}
                    {formatDateFriendly(materia.updatedAt || materia.dataAtualizacao)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="p-4 sm:p-6">
          {/* Card de estatísticas completo */}
          <div className="mb-6">
            <div
              className="rounded-lg overflow-hidden border border-slate-200 bg-gradient-to-r from-slate-50 to-white"
              style={{ borderLeft: `3px solid ${materia.cor}` }}
            >
              <div className="p-4">
                <h3 className="text-xs font-medium text-slate-500 mb-3 flex items-center">
                  <FiLayers size={14} className="mr-1.5" />
                  Estatísticas de Itens
                </h3>

                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-slate-700 font-medium flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: materia.cor }}></div>
                        Tarefas: {tarefas.length}
                      </span>
                      <div className="text-xs text-slate-500 flex flex-wrap gap-2">
                        <span className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                          <FiClock size={10} /> {stats.tarefasPendentes} pendentes
                        </span>
                        <span className="flex items-center gap-1 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                          <FiLoader size={10} /> {stats.tarefasEmAndamento} em andamento
                        </span>
                        <span className="flex items-center gap-1 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                          <FiCheckCircle size={10} /> {stats.tarefasConcluidas} concluídas
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-slate-700 font-medium flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        Atividades: {atividades.length}
                      </span>
                      <div className="text-xs text-slate-500 flex flex-wrap gap-2">
                        <span className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                          <FiClock size={10} /> {stats.atividadesPendentes} pendentes
                        </span>
                        <span className="flex items-center gap-1 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                          <FiLoader size={10} /> {stats.atividadesEmAndamento} em andamento
                        </span>
                        <span className="flex items-center gap-1 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                          <FiCheckCircle size={10} /> {stats.atividadesConcluidas} concluídas
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-slate-700 font-medium flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        Provas: {provas.length}
                      </span>
                      <div className="text-xs text-slate-500 flex flex-wrap gap-2">
                        <span className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                          <FiClock size={10} /> {stats.provasPendentes} pendentes
                        </span>
                        <span className="flex items-center gap-1 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                          <FiLoader size={10} /> {stats.provasEmAndamento} em andamento
                        </span>
                        <span className="flex items-center gap-1 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                          <FiCheckCircle size={10} /> {stats.provasConcluidas} concluídas
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Total de itens: {totalItens}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-md flex items-center gap-1">
                          <FiClock size={12} /> {getTotalItensPendentes()} pendentes
                        </span>
                        <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-md flex items-center gap-1">
                          <FiCheckCircle size={12} />{" "}
                          {stats.tarefasConcluidas + stats.atividadesConcluidas + stats.provasConcluidas} concluídos
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Descrição da matéria */}
          <div className="mb-6">
            <h2 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
              <FiMessageSquare size={14} className="mr-1.5 text-slate-400" />
              Descrição da matéria
            </h2>

            <div
              className={`
                bg-slate-50 rounded-lg p-4 text-slate-700 border border-slate-200
                ${
                  !expandirDescricao && materia.descricao && materia.descricao.length > 200
                    ? "max-h-32 overflow-hidden relative"
                    : ""
                }
              `}
            >
              {materia.descricao ? (
                <div className="whitespace-pre-line text-sm">{materia.descricao}</div>
              ) : (
                <div className="text-slate-400 italic text-sm">Nenhuma descrição fornecida</div>
              )}

              {!expandirDescricao && materia.descricao && materia.descricao.length > 200 && (
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

              {expandirDescricao && materia.descricao && materia.descricao.length > 200 && (
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

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-slate-700 flex items-center">
                <FiBookOpen size={14} className="mr-1.5 text-slate-400" />
                Itens relacionados à matéria
              </h2>
            </div>

            {/* Tarefas relacionadas */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
              <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 transition-colors"
                style={{
                  borderLeft: `3px solid ${materia.cor}`,
                  borderBottom: "1px solid #e5e7eb",
                }}
                onClick={() => setExpandirTarefas(!expandirTarefas)}
              >
                <h3 className="text-sm font-medium text-slate-700 flex items-center">
                  <FiList size={14} className="mr-1.5" style={{ color: materia.cor }} />
                  Tarefas ({tarefas.length})
                </h3>
                <button className="text-slate-400 hover:text-slate-700 transition">
                  {expandirTarefas ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                </button>
              </div>

              {expandirTarefas && (
                <div>
                  {tarefas.length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-slate-500 text-sm">Nenhuma tarefa encontrada</p>

                      <Button
                        onClick={() => router.push(`/admin/tarefas/nova?materiaId=${id}`)}
                        className="mt-2 w-auto text-xs"
                        variant="outline"
                        size="sm"
                      >
                        <FiPlus size={12} className="mr-1" /> Criar nova tarefa
                      </Button>
                    </div>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {tarefas
                        .sort((a, b) => {
                          if (!a.dataVencimento) return 1;
                          if (!b.dataVencimento) return -1;
                          return new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime();
                        })
                        .slice(0, 5)
                        .map((tarefa) => (
                          <li
                            key={tarefa.id}
                            className="p-3 hover:bg-slate-50 transition-colors cursor-pointer"
                            onClick={() => router.push(`/admin/tarefas/${tarefa.id}`)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-start gap-2">
                                <div
                                  className="w-2 h-2 rounded-full mt-1.5"
                                  style={{ backgroundColor: materia.cor }}
                                ></div>
                                <div>
                                  <h3 className="font-medium text-sm text-slate-700 mb-0.5 line-clamp-1">
                                    {tarefa.titulo}
                                  </h3>
                                  <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span className="flex items-center gap-1">
                                      <FiCalendar size={10} /> {formatDateFriendly(tarefa.dataVencimento)}
                                    </span>
                                    {renderStatusBadge(tarefa.status as Status)}
                                  </div>
                                </div>
                              </div>
                              <FiExternalLink size={14} className="text-slate-400 mt-1" />
                            </div>
                          </li>
                        ))}
                    </ul>
                  )}

                  {tarefas.length > 5 && (
                    <div className="p-3 border-t border-slate-100 text-center">
                      <Button
                        onClick={() => router.push(`/admin/tarefas?materiaId=${id}`)}
                        className="w-full text-xs"
                        variant="ghost"
                      >
                        Ver todas as {tarefas.length} tarefas <FiChevronRight size={14} className="ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Atividades relacionadas */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
              <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 transition-colors"
                style={{
                  borderLeft: "3px solid #10b981",
                  borderBottom: "1px solid #e5e7eb",
                }}
                onClick={() => setExpandirAtividades(!expandirAtividades)}
              >
                <h3 className="text-sm font-medium text-slate-700 flex items-center">
                  <FiFileText size={14} className="mr-1.5 text-green-500" />
                  Atividades ({atividades.length})
                </h3>
                <button className="text-slate-400 hover:text-slate-700 transition">
                  {expandirAtividades ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                </button>
              </div>

              {expandirAtividades && (
                <div>
                  {atividades.length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-slate-500 text-sm">Nenhuma atividade encontrada</p>

                      <Button
                        onClick={() => router.push(`/admin/atividades/nova?materiaId=${id}`)}
                        className="mt-2 w-auto text-xs"
                        variant="outline"
                        size="sm"
                      >
                        <FiPlus size={12} className="mr-1" /> Criar nova atividade
                      </Button>
                    </div>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {atividades
                        .sort((a, b) => {
                          const dateA = a.dataEntrega || a.dataVencimento;
                          const dateB = b.dataEntrega || b.dataVencimento;
                          if (!dateA) return 1;
                          if (!dateB) return -1;
                          return new Date(dateA).getTime() - new Date(dateB).getTime();
                        })
                        .slice(0, 5)
                        .map((atividade) => (
                          <li
                            key={atividade.id}
                            className="p-3 hover:bg-slate-50 transition-colors cursor-pointer"
                            onClick={() => router.push(`/admin/atividades/${atividade.id}`)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-start gap-2">
                                <div className="w-2 h-2 rounded-full mt-1.5 bg-green-500"></div>
                                <div>
                                  <h3 className="font-medium text-sm text-slate-700 mb-0.5 line-clamp-1">
                                    {atividade.titulo}
                                  </h3>
                                  <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span className="flex items-center gap-1">
                                      <FiCalendar size={10} />{" "}
                                      {formatDateFriendly(atividade.dataEntrega || atividade.dataVencimento)}
                                    </span>
                                    {atividade.nota !== undefined && (
                                      <span className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                                        <FiAward size={10} /> Nota: {atividade.nota}
                                      </span>
                                    )}
                                    {renderStatusBadge(atividade.status as Status)}
                                  </div>
                                </div>
                              </div>
                              <FiExternalLink size={14} className="text-slate-400 mt-1" />
                            </div>
                          </li>
                        ))}
                    </ul>
                  )}

                  {atividades.length > 5 && (
                    <div className="p-3 border-t border-slate-100 text-center">
                      <Button
                        onClick={() => router.push(`/admin/atividades?materiaId=${id}`)}
                        className="w-full text-xs"
                        variant="ghost"
                      >
                        Ver todas as {atividades.length} atividades <FiChevronRight size={14} className="ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Provas relacionadas */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
              <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 transition-colors"
                style={{
                  borderLeft: "3px solid #ef4444",
                  borderBottom: "1px solid #e5e7eb",
                }}
                onClick={() => setExpandirProvas(!expandirProvas)}
              >
                <h3 className="text-sm font-medium text-slate-700 flex items-center">
                  <FiAward size={14} className="mr-1.5 text-red-500" />
                  Provas ({provas.length})
                </h3>
                <button className="text-slate-400 hover:text-slate-700 transition">
                  {expandirProvas ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                </button>
              </div>

              {expandirProvas && (
                <div>
                  {provas.length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-slate-500 text-sm">Nenhuma prova encontrada</p>

                      <Button
                        onClick={() => router.push(`/admin/provas/nova?materiaId=${id}`)}
                        className="mt-2 w-auto text-xs"
                        variant="outline"
                        size="sm"
                      >
                        <FiPlus size={12} className="mr-1" /> Criar nova prova
                      </Button>
                    </div>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {provas
                        .sort((a, b) => {
                          if (!a.dataProva) return 1;
                          if (!b.dataProva) return -1;
                          return new Date(a.dataProva).getTime() - new Date(b.dataProva).getTime();
                        })
                        .slice(0, 5)
                        .map((prova) => (
                          <li
                            key={prova.id}
                            className="p-3 hover:bg-slate-50 transition-colors cursor-pointer"
                            onClick={() => router.push(`/admin/provas/${prova.id}`)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-start gap-2">
                                <div className="w-2 h-2 rounded-full mt-1.5 bg-red-500"></div>
                                <div>
                                  <h3 className="font-medium text-sm text-slate-700 mb-0.5 line-clamp-1">
                                    {prova.titulo}
                                  </h3>
                                  <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span className="flex items-center gap-1">
                                      <FiCalendar size={10} /> {formatDateFriendly(prova.dataProva)}
                                    </span>
                                    {prova.valor && (
                                      <span className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                                        <FiAward size={10} /> {prova.valor} pts
                                      </span>
                                    )}
                                    {prova.nota !== undefined && (
                                      <span className="flex items-center gap-1 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                                        <FiAward size={10} /> Nota: {prova.nota}
                                      </span>
                                    )}
                                    {renderStatusBadge(prova.status as Status)}
                                  </div>
                                </div>
                              </div>
                              <FiExternalLink size={14} className="text-slate-400 mt-1" />
                            </div>
                          </li>
                        ))}
                    </ul>
                  )}

                  {provas.length > 5 && (
                    <div className="p-3 border-t border-slate-100 text-center">
                      <Button
                        onClick={() => router.push(`/admin/provas?materiaId=${id}`)}
                        className="w-full text-xs"
                        variant="ghost"
                      >
                        Ver todas as {provas.length} provas <FiChevronRight size={14} className="ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ModalDelete
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        itemName={materia?.nome}
        itemType="matéria"
        dependencyCount={totalItens}
        dependencyType="itens relacionados"
        onViewDetails={
          totalItens > 0
            ? () => {
                setShowDeleteConfirm(false);
                setExpandirTarefas(true);
                setExpandirAtividades(true);
                setExpandirProvas(true);
              }
            : undefined
        }
      />
    </div>
  );
}
