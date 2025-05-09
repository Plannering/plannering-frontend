import { Atividade } from "@/core/types/atividades";
import { Status } from "@/core/enum/status.enum";

const estaNoIntervalo = (data: Date, inicioIntervalo: Date, fimIntervalo: Date): boolean => {
  return data >= inicioIntervalo && data <= fimIntervalo;
};

const converterDataBrasileira = (data: string | Date | null | undefined): Date | null => {
  if (!data) return null;

  if (data instanceof Date) return data;

  const partes = data.split("/");
  if (partes.length !== 3) return null;

  const dia = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10) - 1;
  const ano = parseInt(partes[2], 10);

  return new Date(ano, mes, dia);
};

export const ordenarAtividadesPorData = (atividades: Atividade[]): Atividade[] => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return [...atividades].sort((a, b) => {
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

const aplicarFiltroData = (atividade: Atividade, filtroData: string): boolean => {
  if (!filtroData || filtroData === "") return true;

  if (!atividade.dataVencimento) return false;

  const dataEntrega = converterDataBrasileira(atividade.dataVencimento);
  if (!dataEntrega) return false;

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
      return dataEntrega.toDateString() === hoje.toDateString();

    case "esta_semana":
      return estaNoIntervalo(dataEntrega, inicioSemana, fimSemana);

    case "atrasadas":
      return dataEntrega < hoje && atividade.status !== Status.CONCLUIDO && atividade.status !== Status.CANCELADO;

    case "proximos_7_dias":
      return estaNoIntervalo(dataEntrega, hoje, em7Dias);

    default:
      return true;
  }
};

export const filtrarAtividades = (
  atividades: Atividade[],
  filtroStatus: string,
  filtroMateria: string,
  searchTerm: string,
  filtroData: string,
  mostrarConcluidas: boolean = false,
): Atividade[] => {
  const atividadesFiltradas = atividades.filter((atividade) => {
    if (
      !mostrarConcluidas &&
      filtroStatus !== "concluidas" &&
      filtroStatus !== "canceladas" &&
      (atividade.status === Status.CONCLUIDO || atividade.status === Status.CANCELADO)
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

      if (atividade.status !== statusFiltro) return false;
    }

    if (filtroMateria && atividade.materiaId !== filtroMateria) return false;

    if (!aplicarFiltroData(atividade, filtroData)) return false;

    if (searchTerm) {
      const termoBusca = searchTerm.toLowerCase();
      const tituloMatch = atividade.titulo?.toLowerCase().includes(termoBusca);
      const descricaoMatch = atividade.descricao?.toLowerCase().includes(termoBusca);

      if (!tituloMatch && !descricaoMatch) return false;
    }

    return true;
  });

  return ordenarAtividadesPorData(atividadesFiltradas);
};

export const hasActiveFiltersAtividade = (
  filtro: string,
  filtroMateria: string,
  filtroData: string,
  searchTerm: string,
): boolean => {
  return filtro !== "todas" || filtroMateria !== "" || filtroData !== "" || searchTerm !== "";
};
