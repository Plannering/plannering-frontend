export const getUser =
  typeof window !== "undefined"
    ? (() => {
        try {
          const user = JSON.parse(localStorage.getItem("user") || '{"name": "Usuário", "email": "", id: ""}');
          return {
            name: user.nome || user.name || "Usuário",
            email: user.email || "",
            id: user.id || "",
          };
        } catch (error) {
          console.error("Erro ao obter dados do usuário:", error);
          return { name: "Usuário", email: "", id: "" };
        }
      })()
    : { name: "Usuário", email: "", id: "" };
