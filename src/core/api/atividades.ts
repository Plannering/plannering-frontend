import { Atividade } from "../types/atividades";
import fetcher from "./fetcher";

export const criarAtividade = (data: Partial<Atividade>) =>
  fetcher<Atividade>("/atividades", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const buscarAtividade = () =>
  fetcher<Atividade>("/atividades", {
    method: "GET",
  });

export const buscarAtividadebyId = (id: string) =>
  fetcher<Atividade>(`/atividades/${id}`, {
    method: "GET",
  });

export const atualizarAtividade = (id: string, data: Partial<Atividade>) =>
  fetcher<Atividade>(`/atividades/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deletarAtividade = (id: string) =>
  fetcher<Atividade>(`/atividades/${id}`, {
    method: "DELETE",
  });
