export type RegisterUserInput = {
  email: string;
  name: string;
  password: string;
};

export type RegisterUserResult = {
  email: string;
  id: number;
  name: string;
  role: 'CUSTOMER' | 'ADMIN';
};

export type LoginUserInput = {
  email: string;
  password: string;
};

export type LoginUserResult = {
  accessToken: string;
  refreshToken: string;
  user: {
    email: string;
    id: number;
    name: string;
    role: 'CUSTOMER' | 'ADMIN';
  };
};