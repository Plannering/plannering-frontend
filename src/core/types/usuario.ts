export type Usuario = {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  senha: string;
  dataCriacao: string;
  dataAtualizacao: string;
};

export type CriarUsuarioDTO = {
  nome: string;
  email: string;
  telefone?: string;
  senha: string;
};
