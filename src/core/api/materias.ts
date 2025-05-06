import { Materia } from "../types/materias";
import fetcher from "./fetcher";

export const criarMateria = (data: Partial<Materia>) =>
  fetcher<Materia>("/materias", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const buscarMateria = () =>
  fetcher<Materia>("/materias", {
    method: "GET",
  });

export const buscarMateriabyId = (id: string) =>
  fetcher<Materia>(`/materias/${id}`, {
    method: "GET",
  });

export const atualizarMateria = (id: string, data: Partial<Materia>) =>
  fetcher<Materia>(`/materias/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deletarMateria = (id: string) =>
  fetcher<Materia>(`/materias/${id}`, {
    method: "DELETE",
  });
