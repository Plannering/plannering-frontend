export type RegisterResponse = {
  id: string;
  nome: string;
  email: string;
};

export type RegisterRequest = {
  nome: string;
  email: string;
  senha: string;
};

export type LoginCredentials = {
  email: string;
  senha: string;
};

export type LoginResponse = {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};
