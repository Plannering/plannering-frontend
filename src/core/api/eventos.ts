import { Evento } from "../types/eventos";
import fetcher from "./fetcher";

export const criarEvento = (data: Partial<Evento>) =>
  fetcher<Evento>("/eventos", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const buscarEvento = () =>
  fetcher<Evento>("/eventos", {
    method: "GET",
  });

export const buscarEventobyId = (id: string) =>
  fetcher<Evento>(`/eventos/${id}`, {
    method: "GET",
  });

export const atualizarEvento = (id: string, data: Partial<Evento>) =>
  fetcher<Evento>(`/eventos/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deletarEvento = (id: string) =>
  fetcher<Evento>(`/eventos/${id}`, {
    method: "DELETE",
  });
