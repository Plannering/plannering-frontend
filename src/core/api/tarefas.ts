import { Tarefa } from "../types/tarefas";
import fetcher from "./fetcher";

export const criarTarefa = (data: Partial<Tarefa>) =>
  fetcher<Tarefa>("/tarefas", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const buscarTarefa = () =>
  fetcher<Tarefa>("/tarefas", {
    method: "GET",
  });

export const buscarTarefabyId = (id: string) =>
  fetcher<Tarefa>(`/tarefas/${id}`, {
    method: "GET",
  });

export const atualizarTarefa = (id: string, data: Partial<Tarefa>) =>
  fetcher<Tarefa>(`/tarefas/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deletarTarefa = (id: string) =>
  fetcher<Tarefa>(`/tarefas/${id}`, {
    method: "DELETE",
  });
