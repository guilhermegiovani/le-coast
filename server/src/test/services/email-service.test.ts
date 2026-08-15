import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { emailConfig } from '../../config/email.js';
import { sendPasswordResetEmail } from '../../services/email-service.js';

// Cria o mock antes do carregamento do módulo do Resend.
const resendSendMock = vi.hoisted(() => vi.fn());

// Simula o SDK do Resend para impedir
// qualquer envio real de e-mail durante os testes.
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: resendSendMock,
    },
  })),
}));

describe('sendPasswordResetEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Simula um envio bem-sucedido pelo provedor.
    resendSendMock.mockResolvedValue({
      data: {
        id: 'email-id',
      },
      error: null,
    });
  });

  // Garante que o e-mail seja enviado para
  // o endereço informado utilizando o remetente configurado.
  it('deve enviar o e-mail para o destinatário correto', async () => {
    await sendPasswordResetEmail(
      'guilherme@example.com',
      'reset-token',
    );

    expect(resendSendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: emailConfig.from,
        to: 'guilherme@example.com',
        subject: 'Redefinição de senha - Le Coast',
      }),
    );
  });

  // Garante que o link de recuperação contenha
  // o token recebido pela função.
  it('deve incluir o token no link de redefinição', async () => {
    await sendPasswordResetEmail(
      'guilherme@example.com',
      'reset-token',
    );

    const call = resendSendMock.mock.calls[0]?.[0];

    expect(call?.html).toContain(
      `${emailConfig.passwordResetUrl}?token=reset-token`,
    );
  });

  // Garante que caracteres especiais do token
  // sejam codificados antes de serem adicionados à URL.
  it('deve codificar o token antes de montar o link', async () => {
    await sendPasswordResetEmail(
      'guilherme@example.com',
      'token/com+caracteres=especiais',
    );

    const call = resendSendMock.mock.calls[0]?.[0];

    expect(call?.html).toContain(
      `${emailConfig.passwordResetUrl}?token=${encodeURIComponent(
        'token/com+caracteres=especiais',
      )}`,
    );
  });

  // Garante que uma falha retornada pelo Resend
  // seja propagada como erro da aplicação.
  it('deve lançar erro quando o envio falhar', async () => {
    resendSendMock.mockResolvedValue({
      data: null,
      error: {
        message: 'Falha no envio',
      },
    });

    await expect(
      sendPasswordResetEmail(
        'guilherme@example.com',
        'reset-token',
      ),
    ).rejects.toThrow(
      'Não foi possível enviar o e-mail de recuperação.',
    );
  });
});