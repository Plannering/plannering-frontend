import { Status } from "@/core/enum/status.enum";
import { Prova } from "@/core/types/provas";

/**
 * Filtra um array de provas com base nos critérios fornecidos
 * @param provas Lista de provas a serem filtradas
 * @param filtro Filtro de status (todas, pendentes, etc)
 * @param filtroMateria ID da matéria para filtrar
 * @param filtroData Filtro de data (hoje, esta_semana, etc)
 * @param searchTerm Termo de busca para título e descrição
 * @returns Array de provas filtradas e ordenadas
 */
export const filtrarProvas = (
  provas: Prova[],
  filtro: string,
  filtroMateria: string,
  filtroData: string,
  searchTerm: string,
): Prova[] => {
  return provas
    .filter((prova) => {
      if (filtro !== "concluidas" && prova.status === Status.CONCLUIDO) {
        return false;
      }

      if (filtro === "todas") return true;
      if (filtro === "pendentes") return prova.status === Status.PENDENTE;
      if (filtro === "em_andamento") return prova.status === Status.EM_ANDAMENTO;
      if (filtro === "concluidas") return prova.status === Status.CONCLUIDO;
      if (filtro === "canceladas") return prova.status === Status.CANCELADO;

      return true;
    })
    .filter((prova) => {
      return filtroMateria === "" || (prova.materiaId && prova.materiaId === filtroMateria);
    })
    .filter((prova) => {
      if (filtroData === "") return true;

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      if (!prova.data) {
        return (
          filtroData !== "atrasadas" &&
          filtroData !== "hoje" &&
          filtroData !== "esta_semana" &&
          filtroData !== "proximos_7_dias"
        );
      }

      const dataProva = new Date(prova.data);
      dataProva.setHours(0, 0, 0, 0);

      if (filtroData === "hoje") {
        return dataProva.getTime() === hoje.getTime();
      }

      if (filtroData === "esta_semana") {
        const diaSemana = hoje.getDay();
        const inicioSemana = new Date(hoje);

        inicioSemana.setDate(hoje.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));
        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(inicioSemana.getDate() + 6);
        return dataProva >= inicioSemana && dataProva <= fimSemana;
      }

      if (filtroData === "atrasadas") {
        return dataProva < hoje && prova.status !== Status.CONCLUIDO;
      }

      if (filtroData === "proximos_7_dias") {
        const proximosSete = new Date(hoje);
        proximosSete.setDate(hoje.getDate() + 7);
        return dataProva >= hoje && dataProva <= proximosSete;
      }

      return true;
    })
    .filter((prova) => {
      if (searchTerm === "") return true;

      const termLowerCase = searchTerm.toLowerCase();
      const tituloMatch = prova.titulo.toLowerCase().includes(termLowerCase);
      const descricaoMatch = prova.descricao?.toLowerCase().includes(termLowerCase) ?? false;

      return tituloMatch || descricaoMatch;
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

      if (a.data && b.data) {
        return new Date(a.data).getTime() - new Date(b.data).getTime();
      }

      if (a.data) return -1;
      if (b.data) return 1;

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
