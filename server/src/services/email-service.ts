import { Resend } from 'resend';

import { emailConfig } from '../config/email.js';

// Cria uma instância reutilizável do cliente do Resend.
// A chave fica centralizada em emailConfig e nunca
// é exposta para o frontend.
const resend = new Resend(
  emailConfig.resendApiKey,
);

// Envia ao usuário o link necessário para
// redefinir a senha da conta.
export async function sendPasswordResetEmail(
  email: string,
  token: string,
) {
  // Monta a URL que levará o usuário para a tela
  // de redefinição de senha no frontend.
  //
  // encodeURIComponent evita que caracteres especiais
  // do token quebrem a URL ou alterem seus parâmetros.
  const resetUrl =
    `${emailConfig.passwordResetUrl}` +
    `?token=${encodeURIComponent(token)}`;

  // O serviço de e-mail recebe o token apenas para
  // montar o link. O valor continua não sendo persistido
  // em texto puro no banco.
  const { error } = await resend.emails.send({
    from: emailConfig.from,
    to: email,
    subject: 'Redefinição de senha - Le Coast',
    html: `
      <h1>Redefinição de senha</h1>

      <p>
        Recebemos uma solicitação para redefinir
        a senha da sua conta Le Coast.
      </p>

      <p>
        <a href="${resetUrl}">
          Redefinir minha senha
        </a>
      </p>

      <p>
        Se você não solicitou essa alteração,
        ignore este e-mail.
      </p>
    `,
  });

  // O Resend pode retornar uma falha de envio
  // mesmo sem lançar uma exceção.
  if (error) {
    throw new Error(
      'Não foi possível enviar o e-mail de recuperação.',
    );
  }
}