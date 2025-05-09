import { Tarefa } from "@/core/types/tarefas";
import { Status } from "@/core/enum/status.enum";

const estaNoIntervalo = (data: Date, inicioIntervalo: Date, fimIntervalo: Date): boolean => {
  return data >= inicioIntervalo && data <= fimIntervalo;
};

const converterDataBrasileira = (dataString: string | null | undefined): Date | null => {
  if (!dataString) return null;

  const partes = dataString.split("/");
  if (partes.length !== 3) return null;

  const dia = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10) - 1;
  const ano = parseInt(partes[2], 10);

  return new Date(ano, mes, dia);
};

export const ordenarTarefasPorData = (tarefas: Tarefa[]): Tarefa[] => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return [...tarefas].sort((a, b) => {
    const dataA = converterDataBrasileira(a.dataVencimento);
    const dataB = converterDataBrasileira(b.dataVencimento);

    if (!dataA) return 1;
    if (!dataB) return -1;

    const aVencida = dataA < hoje;
    const bVencida = dataB < hoje;

    if (aVencida && !bVencida) return 1;
    if (!aVencida && bVencida) return -1;

    if (aVencida && bVencida) {
      return dataB.getTime() - dataA.getTime();
    }

    return dataA.getTime() - dataB.getTime();
  });
};

const aplicarFiltroData = (tarefa: Tarefa, filtroData: string): boolean => {
  if (!filtroData || filtroData === "") return true;

  if (!tarefa.dataVencimento) return false;

  const dataVencimento = converterDataBrasileira(tarefa.dataVencimento);
  if (!dataVencimento) return false;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);

  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() - hoje.getDay());
  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(inicioSemana.getDate() + 6);

  const em7Dias = new Date(hoje);
  em7Dias.setDate(hoje.getDate() + 7);

  switch (filtroData) {
    case "hoje":
      return dataVencimento.toDateString() === hoje.toDateString();

    case "esta_semana":
      return estaNoIntervalo(dataVencimento, inicioSemana, fimSemana);

    case "atrasadas":
      return dataVencimento < hoje && tarefa.status !== Status.CONCLUIDO && tarefa.status !== Status.CANCELADO;

    case "proximos_7_dias":
      return estaNoIntervalo(dataVencimento, hoje, em7Dias);

    default:
      return true;
  }
};
export const filtrarTarefas = (
  tarefas: Tarefa[],
  filtroStatus: string,
  filtroMateria: string,
  filtroPrioridade: string,
  filtroData: string,
  searchTerm: string,
  mostrarConcluidas: boolean = false,
): Tarefa[] => {
  const tarefasFiltradas = tarefas.filter((tarefa) => {
    if (
      !mostrarConcluidas &&
      filtroStatus !== "concluidas" &&
      filtroStatus !== "canceladas" &&
      (tarefa.status === Status.CONCLUIDO || tarefa.status === Status.CANCELADO)
    ) {
      return false;
    }

    if (filtroStatus !== "todas") {
      let statusFiltro = "";
      switch (filtroStatus) {
        case "pendentes":
          statusFiltro = Status.PENDENTE;
          break;
        case "em_andamento":
          statusFiltro = Status.EM_ANDAMENTO;
          break;
        case "concluidas":
          statusFiltro = Status.CONCLUIDO;
          break;
        case "canceladas":
          statusFiltro = Status.CANCELADO;
          break;
      }

      if (tarefa.status !== statusFiltro) return false;
    }

    if (filtroMateria && tarefa.materiaId !== filtroMateria) return false;

    if (filtroPrioridade && tarefa.prioridade !== filtroPrioridade) return false;

    if (!aplicarFiltroData(tarefa, filtroData)) return false;

    if (searchTerm) {
      const termoBusca = searchTerm.toLowerCase();
      const tituloMatch = tarefa.titulo?.toLowerCase().includes(termoBusca);
      const descricaoMatch = tarefa.descricao?.toLowerCase().includes(termoBusca);

      if (!tituloMatch && !descricaoMatch) return false;
    }

    return true;
  });

  return ordenarTarefasPorData(tarefasFiltradas);
};

export const hasActiveFiltersTarefa = (
  filtro: string,
  filtroMateria: string,
  filtroPrioridade: string,
  filtroData: string,
  searchTerm: string,
): boolean => {
  return (
    filtro !== "todas" || filtroMateria !== "" || filtroPrioridade !== "" || filtroData !== "" || searchTerm !== ""
  );
};
