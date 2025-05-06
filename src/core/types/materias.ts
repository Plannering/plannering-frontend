export type Materia = {
  id: string;
  nome: string;
  descricao?: string;
  cor?: string;
  dataCriacao: string;
  dataAtualizacao: string;
  usuarioId: string;
};

export type CriarMateriaDTO = {
  nome: string;
  descricao?: string;
  cor?: string;
  usuarioId: string;
};
