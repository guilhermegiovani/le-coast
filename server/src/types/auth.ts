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