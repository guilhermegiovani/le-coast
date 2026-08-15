import 'dotenv/config';

// Define o formato das configurações utilizadas
// pelo serviço de envio de e-mails.
type EmailConfig = {
  from: string;
  passwordResetUrl: string;
  resendApiKey: string;
};

const resendApiKey = process.env.RESEND_API_KEY;
const passwordResetUrl = process.env.PASSWORD_RESET_URL;
const emailFrom = process.env.EMAIL_FROM;

if (!resendApiKey) {
  throw new Error(
    'A variável de ambiente RESEND_API_KEY não foi definida.',
  );
}

if (!passwordResetUrl) {
  throw new Error(
    'A variável de ambiente PASSWORD_RESET_URL não foi definida.',
  );
}

if (!emailFrom) {
  throw new Error(
    'A variável de ambiente EMAIL_FROM não foi definida.',
  );
}

// Centraliza as configurações de e-mail para evitar
// acessar process.env diretamente em vários pontos da aplicação.
export const emailConfig: EmailConfig = {
  from: emailFrom,
  passwordResetUrl,
  resendApiKey,
};