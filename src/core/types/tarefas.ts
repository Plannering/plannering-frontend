import { Prioridade } from "../enum/prioridades.enum";
import { Status } from "../enum/status.enum";

export type Tarefa = {
  id: string;
  titulo: string;
  descricao?: string;
  dataVencimento?: string;
  prioridade: Prioridade;
  status: Status;
  dataCriacao: string;
  dataAtualizacao: string;
  usuarioId: string;
  materiaId?: string;
};

export type CriarTarefaDTO = {
  titulo: string;
  descricao?: string;
  dataVencimento?: string;
  prioridade?: Prioridade;
  status?: Status;
  usuarioId: string;
  materiaId?: string;
};
