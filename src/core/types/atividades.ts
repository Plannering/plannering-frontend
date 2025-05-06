import { Status } from "../enum/status.enum";

export type Atividade = {
  id: string;
  titulo: string;
  descricao?: string;
  dataVencimento?: Date;
  peso?: number;
  nota?: number;
  status: Status;
  dataCriacao: string;
  dataAtualizacao: string;
  usuarioId: string;
  materiaId?: string;
};

export type CriarAtividadeDTO = {
  titulo: string;
  descricao?: string;
  dataVencimento?: Date;
  peso?: number;
  nota?: number;
  status?: Status;
  usuarioId: string;
  materiaId?: string;
};
