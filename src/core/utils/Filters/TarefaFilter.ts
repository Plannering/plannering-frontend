import { Status } from "@/core/enum/status.enum";
import { Tarefa } from "@/core/types/tarefas";

/**
 * Filtra um array de tarefas com base nos critérios fornecidos
 * @param tarefas Lista de tarefas a serem filtradas
 * @param filtro Filtro de status (todas, pendentes, etc)
 * @param filtroMateria ID da matéria para filtrar
 * @param filtroPrioridade Prioridade para filtrar (urgente, alta, etc)
 * @param filtroData Filtro de data (hoje, esta_semana, etc)
 * @param searchTerm Termo de busca para título e descrição
 * @returns Array de tarefas filtradas e ordenadas
 */
export const filtrarTarefas = (
  tarefas: Tarefa[],
  filtro: string,
  filtroMateria: string,
  filtroPrioridade: string,
  filtroData: string,
  searchTerm: string,
): Tarefa[] => {
  return tarefas

    .filter((tarefa) => {
      if (filtro !== "concluidas" && tarefa.status === Status.CONCLUIDO) {
        return false;
      }

      if (filtro === "todas") return true;
      if (filtro === "pendentes") return tarefa.status === Status.PENDENTE;
      if (filtro === "em_andamento") return tarefa.status === Status.EM_ANDAMENTO;
      if (filtro === "concluidas") return tarefa.status === Status.CONCLUIDO;
      if (filtro === "canceladas") return tarefa.status === Status.CANCELADO;

      return true;
    })

    .filter((tarefa) => filtroMateria === "" || (tarefa.materiaId && tarefa.materiaId === filtroMateria))

    .filter((tarefa) => {
      if (filtroPrioridade === "") return true;
      return tarefa.prioridade === filtroPrioridade;
    })

    .filter((tarefa) => {
      if (filtroData === "") return true;

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      if (!tarefa.dataVencimento) {
        return (
          filtroData !== "atrasadas" &&
          filtroData !== "hoje" &&
          filtroData !== "esta_semana" &&
          filtroData !== "proximos_7_dias"
        );
      }

      const dataVencimento = new Date(tarefa.dataVencimento);
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
        return dataVencimento < hoje && tarefa.status !== Status.CONCLUIDO;
      }

      if (filtroData === "proximos_7_dias") {
        const proximosSete = new Date(hoje);
        proximosSete.setDate(hoje.getDate() + 7);
        return dataVencimento >= hoje && dataVencimento <= proximosSete;
      }

      return true;
    })

    .filter(
      (tarefa) =>
        searchTerm === "" ||
        tarefa.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tarefa.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false),
    )

    .filter((tarefa) => {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      if (filtroData === "atrasadas") return true;

      if (!tarefa.dataVencimento) return true;

      const dataVencimento = new Date(tarefa.dataVencimento);
      dataVencimento.setHours(0, 0, 0, 0);

      return !(dataVencimento < hoje && tarefa.status !== Status.CONCLUIDO);
    })

    .sort((a, b) => {
      const prioridadeValor: Record<"urgente" | "alta" | "media" | "baixa", number> = {
        urgente: 3,
        alta: 2,
        media: 1,
        baixa: 0,
      };

      const prioridadeA = prioridadeValor[a.prioridade.toLowerCase() as keyof typeof prioridadeValor] || 0;
      const prioridadeB = prioridadeValor[b.prioridade.toLowerCase() as keyof typeof prioridadeValor] || 0;

      if (prioridadeA !== prioridadeB) {
        return prioridadeB - prioridadeA;
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
  filtroPrioridade: string,
  filtroData: string,
  searchTerm: string,
): boolean => {
  return (
    filtro !== "todas" || filtroMateria !== "" || filtroPrioridade !== "" || filtroData !== "" || searchTerm !== ""
  );
};

export const getPaginatedItems = <T>(items: T[], currentPage: number, itemsPerPage: number): T[] => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return items.slice(startIndex, endIndex);
};

export const calculateTotalPages = (totalItems: number, itemsPerPage: number): number => {
  return Math.ceil(totalItems / itemsPerPage);
};
