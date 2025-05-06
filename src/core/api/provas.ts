import { Prova } from "../types/provas";
import fetcher from "./fetcher";

export const criarProva = (data: Partial<Prova>) =>
  fetcher<Prova>("/provas", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const buscarProva = () =>
  fetcher<Prova>("/provas", {
    method: "GET",
  });

export const buscarProvabyId = (id: string) =>
  fetcher<Prova>(`/provas/${id}`, {
    method: "GET",
  });

export const atualizarProva = (id: string, data: Partial<Prova>) =>
  fetcher<Prova>(`/provas/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deletarProva = (id: string) =>
  fetcher<Prova>(`/provas/${id}`, {
    method: "DELETE",
  });
