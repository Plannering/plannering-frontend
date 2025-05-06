import { Status } from "../enum/status.enum";

export type Prova = {
  id: string;
  titulo: string;
  descricao?: string;
  data: string;
  local?: string;
  nota?: number;
  status: Status;
  dataCriacao: string;
  dataAtualizacao: string;
  usuarioId: string;
  materiaId?: string;
};

export type CriarProvaDTO = {
  titulo: string;
  descricao?: string;
  data: string;
  local?: string;
  nota?: number;
  status?: Status;
  usuarioId: string;
  materiaId?: string;
};
