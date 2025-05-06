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
  FiCheck,
  FiInfo,
  FiChevronDown,
  FiChevronUp,
  FiChevronRight,
  FiMessageSquare,
  FiFileText,
} from "react-icons/fi";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import apiFetch from "@/core/api/fetcher";
import { Status } from "@/core/enum/status.enum";
import { ModalDelete } from "@/core/components/Modal/ModalDelet";

// Componentes UI
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Materia {
  id: string;
  nome: string;
  professor: string;
  descricao: string;
  cor: string;
  diasDaSemana?: string[];
  createdAt?: string;
  updatedAt?: string;
  tarefas?: Tarefa[];
}

interface Tarefa {
  id: string;
  titulo: string;
  dataVencimento: string;
  status: Status;
  prioridade: string;
}

export default function VisualizarMateria() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [materia, setMateria] = useState<Materia | null>(null);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTarefas, setIsLoadingTarefas] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expandirDescricao, setExpandirDescricao] = useState(false);
  const [expandirTarefas, setExpandirTarefas] = useState(true);
  // Adicione estes estados junto com os outros estados no início do componente:

  const [expandirAtividades, setExpandirAtividades] = useState(false);
  const [expandirProvas, setExpandirProvas] = useState(false);

  // Buscar dados da matéria
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

  // Buscar tarefas relacionadas à matéria
  useEffect(() => {
    const fetchTarefas = async () => {
      if (!id) return;

      try {
        setIsLoadingTarefas(true);
        const data = await apiFetch<Materia>(`materias/${id}`);

        // Verificar se a resposta contém um array de tarefas
        if (data && data.tarefas) {
          setTarefas(data.tarefas);
        } else {
          setTarefas([]);
        }
      } catch (err) {
        console.error("Erro ao buscar tarefas da matéria:", err);
        setTarefas([]);
      } finally {
        setIsLoadingTarefas(false);
      }
    };

    fetchTarefas();
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

  // Formatação de data mais amigável
  const formatDateFriendly = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd 'de' MMMM, yyyy", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  // Renderização do status da tarefa
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
            <FiClock size={10} /> Em andamento
          </Badge>
        );
      case Status.CONCLUIDO:
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 py-0.5 px-1.5 gap-1 text-[10px]"
          >
            <FiCheck size={10} /> Concluída
          </Badge>
        );
      default:
        return null;
    }
  };

  // Exibir estado de carregamento
  if (isLoading) {
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

  // Exibir mensagem de erro
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

  return (
    <div className="container mx-auto px-3 sm:px-5 py-4 sm:py-8 animate-in fade-in duration-300">
      {/* Barra superior com navegação e ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <Link
          href="/admin/materias"
          className="flex items-center text-sky-600 hover:text-sky-700 font-medium transition text-sm"
        >
          <FiArrowLeft className="mr-1.5" size={16} /> Voltar para matérias
        </Link>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg transition text-xs font-medium gap-1.5"
          >
            <FiTrash2 size={14} /> Excluir
          </button>
        </div>
      </div>

      {/* Card principal da matéria */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
        {/* Cabeçalho com estilo personalizado usando a cor da matéria */}
        <div
          className="py-4 px-4 sm:px-6 border-b border-slate-100 flex flex-col gap-2"
          style={{
            borderLeft: `4px solid ${materia.cor}`,
            backgroundImage: `linear-gradient(to right, ${materia.cor}08, white)`,
          }}
        >
          <div className="flex justify-between items-start gap-3">
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full" style={{ backgroundColor: materia.cor }}></div>
              {materia.nome}
            </h1>
          </div>

          <div className="flex flex-wrap gap-2 items-center text-xs text-slate-500">
            {materia.createdAt && (
              <span className="flex items-center gap-1">
                <FiInfo size={12} /> Criada em {formatDateFriendly(materia.createdAt)}
              </span>
            )}

            {materia.updatedAt && materia.createdAt !== materia.updatedAt && (
              <span className="flex items-center gap-1 ml-2">
                <FiEdit3 size={12} /> Atualizada em {formatDateFriendly(materia.updatedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Corpo principal - Informações da matéria */}
        <div className="p-4 sm:p-6">
          {/* Grid de informações */}
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

          {/* Seções de Tarefas, Atividades e Provas */}
          <div className="space-y-5">
            {/* Cabeçalho da seção */}
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-slate-700 flex items-center">
                <FiFileText size={14} className="mr-1.5 text-slate-400" />
                Itens relacionados à matéria
              </h2>
            </div>

            {/* === Seção de Tarefas === */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div
                className="flex items-center justify-between p-3 cursor-pointer border-b border-slate-100 hover:bg-slate-50 transition-colors"
                onClick={() => setExpandirTarefas(!expandirTarefas)}
              >
                <h3 className="text-sm font-medium text-slate-700 flex items-center">
                  <FiList size={14} className="mr-1.5 text-blue-500" />
                  Tarefas (
                  {
                    tarefas.filter(
                      (t) => !t.titulo.toLowerCase().includes("prova") && !t.titulo.toLowerCase().includes("atividade"),
                    ).length
                  }
                  )
                </h3>
                <button className="text-slate-400 hover:text-slate-700 transition">
                  {expandirTarefas ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                </button>
              </div>

              {expandirTarefas && (
                <div>
                  {isLoadingTarefas ? (
                    <div className="p-4 animate-pulse space-y-3">
                      <div className="h-4 bg-slate-200 rounded w-full"></div>
                      <div className="h-4 bg-slate-200 rounded w-full"></div>
                      <div className="h-4 bg-slate-200 rounded w-full"></div>
                    </div>
                  ) : tarefas.filter(
                      (t) => !t.titulo.toLowerCase().includes("prova") && !t.titulo.toLowerCase().includes("atividade"),
                    ).length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-slate-500 text-sm">Nenhuma tarefa encontrada</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {tarefas
                        .filter(
                          (t) =>
                            !t.titulo.toLowerCase().includes("prova") && !t.titulo.toLowerCase().includes("atividade"),
                        )
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
                            </div>
                          </li>
                        ))}
                    </ul>
                  )}

                  {tarefas.filter(
                    (t) => !t.titulo.toLowerCase().includes("prova") && !t.titulo.toLowerCase().includes("atividade"),
                  ).length > 5 && (
                    <div className="p-3 border-t border-slate-100 text-center">
                      <Button
                        onClick={() => router.push(`/admin/tarefas?materiaId=${id}&tipo=tarefa`)}
                        className="w-full text-xs"
                        variant="ghost"
                      >
                        Ver todas as{" "}
                        {
                          tarefas.filter(
                            (t) =>
                              !t.titulo.toLowerCase().includes("prova") &&
                              !t.titulo.toLowerCase().includes("atividade"),
                          ).length
                        }{" "}
                        tarefas <FiChevronRight size={14} className="ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* === Seção de Atividades === */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div
                className="flex items-center justify-between p-3 cursor-pointer border-b border-slate-100 hover:bg-slate-50 transition-colors"
                onClick={() => setExpandirAtividades(!expandirAtividades)}
              >
                <h3 className="text-sm font-medium text-slate-700 flex items-center">
                  <FiFileText size={14} className="mr-1.5 text-green-500" />
                  Atividades ({tarefas.filter((t) => t.titulo.toLowerCase().includes("atividade")).length})
                </h3>
                <button className="text-slate-400 hover:text-slate-700 transition">
                  {expandirAtividades ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                </button>
              </div>

              {expandirAtividades && (
                <div>
                  {isLoadingTarefas ? (
                    <div className="p-4 animate-pulse space-y-3">
                      <div className="h-4 bg-slate-200 rounded w-full"></div>
                      <div className="h-4 bg-slate-200 rounded w-full"></div>
                      <div className="h-4 bg-slate-200 rounded w-full"></div>
                    </div>
                  ) : tarefas.filter((t) => t.titulo.toLowerCase().includes("atividade")).length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-slate-500 text-sm">Nenhuma atividade encontrada</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {tarefas
                        .filter((t) => t.titulo.toLowerCase().includes("atividade"))
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
                            </div>
                          </li>
                        ))}
                    </ul>
                  )}

                  {tarefas.filter((t) => t.titulo.toLowerCase().includes("atividade")).length > 5 && (
                    <div className="p-3 border-t border-slate-100 text-center">
                      <Button
                        onClick={() => router.push(`/admin/tarefas?materiaId=${id}&tipo=atividade`)}
                        className="w-full text-xs"
                        variant="ghost"
                      >
                        Ver todas as {tarefas.filter((t) => t.titulo.toLowerCase().includes("atividade")).length}{" "}
                        atividades <FiChevronRight size={14} className="ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* === Seção de Provas === */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div
                className="flex items-center justify-between p-3 cursor-pointer border-b border-slate-100 hover:bg-slate-50 transition-colors"
                onClick={() => setExpandirProvas(!expandirProvas)}
              >
                <h3 className="text-sm font-medium text-slate-700 flex items-center">
                  <FiFileText size={14} className="mr-1.5 text-red-500" />
                  Provas ({tarefas.filter((t) => t.titulo.toLowerCase().includes("prova")).length})
                </h3>
                <button className="text-slate-400 hover:text-slate-700 transition">
                  {expandirProvas ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                </button>
              </div>

              {expandirProvas && (
                <div>
                  {isLoadingTarefas ? (
                    <div className="p-4 animate-pulse space-y-3">
                      <div className="h-4 bg-slate-200 rounded w-full"></div>
                      <div className="h-4 bg-slate-200 rounded w-full"></div>
                      <div className="h-4 bg-slate-200 rounded w-full"></div>
                    </div>
                  ) : tarefas.filter((t) => t.titulo.toLowerCase().includes("prova")).length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-slate-500 text-sm">Nenhuma prova encontrada</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {tarefas
                        .filter((t) => t.titulo.toLowerCase().includes("prova"))
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
                            </div>
                          </li>
                        ))}
                    </ul>
                  )}

                  {tarefas.filter((t) => t.titulo.toLowerCase().includes("prova")).length > 5 && (
                    <div className="p-3 border-t border-slate-100 text-center">
                      <Button
                        onClick={() => router.push(`/admin/tarefas?materiaId=${id}&tipo=prova`)}
                        className="w-full text-xs"
                        variant="ghost"
                      >
                        Ver todas as {tarefas.filter((t) => t.titulo.toLowerCase().includes("prova")).length} provas{" "}
                        <FiChevronRight size={14} className="ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Modal de confirmação de exclusão */}
      <ModalDelete
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        itemName={materia?.nome}
        itemType="matéria"
        dependencyCount={tarefas?.length || 0}
        dependencyType="tarefas"
        onViewDetails={
          tarefas?.length
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

// Componente que faltava na importação
const FiPlus = ({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`feather feather-plus ${className}`}
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);
