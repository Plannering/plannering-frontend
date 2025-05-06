import { Status } from "@/core/enum/status.enum";

type Atividade = {
  id: string;
  titulo: string;
  descricao?: string;
  dataVencimento?: string | Date;
  peso?: number;
  nota?: number;
  status: Status;
  dataCriacao: string;
  dataAtualizacao: string;
  usuarioId: string;
  materiaId?: string;
  materia?: { id: string; nome: string; cor: string };
};

/**
 * Filtra um array de atividades com base nos critérios fornecidos
 * @param atividades Lista de atividades a serem filtradas
 * @param filtro Filtro de status (todas, pendentes, etc)
 * @param filtroMateria ID da matéria para filtrar
 * @param filtroData Filtro de data (hoje, esta_semana, etc)
 * @param searchTerm Termo de busca para título e descrição
 * @returns Array de atividades filtradas e ordenadas
 */
export const filtrarAtividades = (
  atividades: Atividade[],
  filtro: string,
  filtroMateria: string,
  filtroData: string,
  searchTerm: string,
): Atividade[] => {
  return atividades

    .filter((atividade) => {
      if (filtro !== "concluidas" && atividade.status === Status.CONCLUIDO) {
        return false;
      }

      if (filtro === "todas") return true;
      if (filtro === "pendentes") return atividade.status === Status.PENDENTE;
      if (filtro === "em_andamento") return atividade.status === Status.EM_ANDAMENTO;
      if (filtro === "concluidas") return atividade.status === Status.CONCLUIDO;
      if (filtro === "canceladas") return atividade.status === Status.CANCELADO;

      return true;
    })

    .filter((atividade) => filtroMateria === "" || (atividade.materiaId && atividade.materiaId === filtroMateria))

    .filter((atividade) => {
      if (filtroData === "") return true;

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      if (!atividade.dataVencimento) {
        return (
          filtroData !== "atrasadas" &&
          filtroData !== "hoje" &&
          filtroData !== "esta_semana" &&
          filtroData !== "proximos_7_dias"
        );
      }

      const dataVencimento = new Date(atividade.dataVencimento);
      dataVencimento.setHours(0, 0, 0, 0);

      if (filtroData === "hoje") {
        return dataVencimento.getTime() === hoje.getTime();
      }

      if (filtroData === "esta_semana") {
        const diaSemana = hoje.getDay();
        const inicioSemana = new Date(hoje);

        inicioSemana.setDate(hoje.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));
        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(inicioSemana.getDate() + 6);
        return dataVencimento >= inicioSemana && dataVencimento <= fimSemana;
      }

      if (filtroData === "atrasadas") {
        return dataVencimento < hoje && atividade.status !== Status.CONCLUIDO;
      }

      if (filtroData === "proximos_7_dias") {
        const proximosSete = new Date(hoje);
        proximosSete.setDate(hoje.getDate() + 7);
        return dataVencimento >= hoje && dataVencimento <= proximosSete;
      }

      return true;
    })

    .filter(
      (atividade) =>
        searchTerm === "" ||
        atividade.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (atividade.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false),
    )

    .filter((atividade) => {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      if (filtroData === "atrasadas") return true;

      if (!atividade.dataVencimento) return true;

      const dataVencimento = new Date(atividade.dataVencimento);
      dataVencimento.setHours(0, 0, 0, 0);

      return !(dataVencimento < hoje && atividade.status !== Status.CONCLUIDO);
    })

    .sort((a, b) => {
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

      if (a.peso !== undefined && b.peso !== undefined && a.peso !== b.peso) {
        return b.peso - a.peso;
      }

      if (a.dataVencimento && b.dataVencimento) {
        return new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime();
      }

      if (a.dataVencimento) return -1;
      if (b.dataVencimento) return 1;

      return 0;
    });
};

export const hasActiveFilters = (
  filtro: string,
  filtroMateria: string,
  filtroData: string,
  searchTerm: string,
): boolean => {
  return filtro !== "todas" || filtroMateria !== "" || filtroData !== "" || searchTerm !== "";
};

export const getPaginatedItems = <T>(items: T[], currentPage: number, itemsPerPage: number): T[] => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return items.slice(startIndex, endIndex);
};

export const calculateTotalPages = (totalItems: number, itemsPerPage: number): number => {
  return Math.ceil(totalItems / itemsPerPage);
};
