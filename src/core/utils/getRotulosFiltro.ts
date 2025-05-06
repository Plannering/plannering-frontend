export const getFilterStatusLabel = (status: string) => {
  switch (status) {
    case "pendentes":
      return "Pendentes";
    case "em_andamento":
      return "Em andamento";
    case "concluidas":
      return "Concluídas";
    default:
      return "Status";
  }
};

export const getPrioridadeLabel = (prioridade: string) => {
  switch (prioridade) {
    case "baixa":
      return "Baixa";
    case "media":
      return "Média";
    case "alta":
      return "Alta";
    case "urgente":
      return "Urgente";
    default:
      return "Prioridade";
  }
};

export const getFilterDateLabel = (filtroData: string) => {
  switch (filtroData) {
    case "hoje":
      return "Hoje";
    case "esta_semana":
      return "Esta semana";
    case "atrasadas":
      return "Atrasadas";
    case "proximos_7_dias":
      return "Próximos 7 dias";
    default:
      return "Data";
  }
};
