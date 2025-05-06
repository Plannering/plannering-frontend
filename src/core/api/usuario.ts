import { Usuario } from "../types/usuario";
import fetcher from "./fetcher";

export const buscarUsuario = () =>
  fetcher<Usuario>("/usuarios", {
    method: "GET",
  });

export const buscarUsuariobyId = (id: string) =>
  fetcher<Usuario>(`/usuarios/${id}`, {
    method: "GET",
  });
