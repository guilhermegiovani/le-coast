import jwt from 'jsonwebtoken';
import {
  describe,
  expect,
  it,
} from 'vitest';

import { authConfig } from '../../config/auth.js';
import { generateAccessToken } from '../../lib/jwt.js';

// Agrupa os testes relacionados à geração do token de acesso.
describe('generateAccessToken', () => {
  // Garante que um token JWT válido seja gerado.
  it('deve gerar um token válido', () => {
    const token = generateAccessToken({
      id: 1,
      role: 'CUSTOMER',
    });

    const decoded = jwt.verify(
      token,
      authConfig.jwt.secret,
    );

    expect(decoded).toMatchObject({
      role: 'CUSTOMER',
      sub: '1',
    });
  });

  // Garante que o identificador do usuário seja armazenado no subject.
  it('deve armazenar o id do usuário no subject do token', () => {
    const token = generateAccessToken({
      id: 42,
      role: 'CUSTOMER',
    });

    const decoded = jwt.verify(
      token,
      authConfig.jwt.secret,
    );

    expect(decoded).toMatchObject({
      sub: '42',
    });
  });

  // Garante que o papel do usuário seja incluído no payload.
  it('deve incluir a role do usuário no token', () => {
    const token = generateAccessToken({
      id: 1,
      role: 'ADMIN',
    });

    const decoded = jwt.verify(
      token,
      authConfig.jwt.secret,
    );

    expect(decoded).toMatchObject({
      role: 'ADMIN',
    });
  });

  // Garante que o token possua data de expiração.
  it('deve gerar um token com expiração', () => {
    const token = generateAccessToken({
      id: 1,
      role: 'CUSTOMER',
    });

    const decoded = jwt.verify(
      token,
      authConfig.jwt.secret,
    );

    expect(decoded).toHaveProperty('exp');
  });
});