import { Prova } from "@/core/types/provas";
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

export const ordenarProvasPorData = (provas: Prova[]): Prova[] => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return [...provas].sort((a, b) => {
    const dataA = converterDataBrasileira(a.data);
    const dataB = converterDataBrasileira(b.data);

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

const aplicarFiltroData = (prova: Prova, filtroData: string): boolean => {
  if (!filtroData || filtroData === "") return true;

  if (!prova.data) return false;

  const dataProva = converterDataBrasileira(prova.data);
  if (!dataProva) return false;

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
      return dataProva.toDateString() === hoje.toDateString();

    case "esta_semana":
      return estaNoIntervalo(dataProva, inicioSemana, fimSemana);

    case "atrasadas":
      return dataProva < hoje && prova.status !== Status.CONCLUIDO && prova.status !== Status.CANCELADO;

    case "proximos_7_dias":
      return estaNoIntervalo(dataProva, hoje, em7Dias);

    default:
      return true;
  }
};

export const filtrarProvas = (
  provas: Prova[],
  filtroStatus: string,
  filtroMateria: string,
  searchTerm: string,
  filtroData: string,
  mostrarConcluidas: boolean = false,
): Prova[] => {
  const provasFiltradas = provas.filter((prova) => {
    if (
      !mostrarConcluidas &&
      filtroStatus !== "concluidas" &&
      filtroStatus !== "canceladas" &&
      (prova.status === Status.CONCLUIDO || prova.status === Status.CANCELADO)
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

      if (prova.status !== statusFiltro) return false;
    }

    if (filtroMateria && prova.materiaId !== filtroMateria) return false;

    if (!aplicarFiltroData(prova, filtroData)) return false;

    if (searchTerm) {
      const termoBusca = searchTerm.toLowerCase();
      const tituloMatch = prova.titulo?.toLowerCase().includes(termoBusca);
      const descricaoMatch = prova.descricao?.toLowerCase().includes(termoBusca);

      if (!tituloMatch && !descricaoMatch) return false;
    }

    return true;
  });

  return ordenarProvasPorData(provasFiltradas);
};

export const hasActiveFiltersProva = (
  filtro: string,
  filtroMateria: string,
  filtroData: string,
  searchTerm: string,
): boolean => {
  return filtro !== "todas" || filtroMateria !== "" || filtroData !== "" || searchTerm !== "";
};
