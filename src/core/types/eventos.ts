export type Evento = {
  id: string;
  titulo: string;
  descricao?: string;
  dataInicio: string;
  dataFim?: string;
  diaInteiro: boolean;
  local?: string;
  cor?: string;
  dataCriacao: string;
  dataAtualizacao: string;
  usuarioId: string;
};

export type CriarEventoDTO = {
  titulo: string;
  descricao?: string;
  dataInicio: string;
  dataFim?: string;
  diaInteiro?: boolean;
  local?: string;
  cor?: string;
  usuarioId: string;
};
