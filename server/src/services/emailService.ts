import nodemailer from 'nodemailer';

function createTransporter(empresa: 'Servired' | 'Multired') {
  const user = empresa === 'Multired' ? process.env.SMTP_USER_MULTIRED : process.env.SMTP_USER;
  const pass = empresa === 'Multired' ? process.env.SMTP_PASS_MULTIRED : process.env.SMTP_PASS;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user, pass }
  });
}

interface SendExcelEmailOptions {
  empresa: 'Servired' | 'Multired';
  filename: string;
  buffer: Buffer;
  periodo: string;
}

const RECIPIENTS: Record<string, string[]> = {
  Servired: ['aplicaciones@gruposervired.com.co', 'cctvyumbo@gmail.com'],
  Multired: ['aplicaciones@gruposervired.com.co', 'telecomunicaciones@grupomultired.com.co']
};

export const sendExcelEmail = async (options: SendExcelEmailOptions): Promise<void> => {
  const { empresa, filename, buffer, periodo } = options;

  const from = empresa === 'Multired' ? process.env.SMTP_USER_MULTIRED : process.env.SMTP_USER;
  const to = RECIPIENTS[empresa];

  if (!from) {
    throw new Error(`No hay configurado un correo SMTP para ${empresa}. Verifica las variables SMTP en .env`);
  }

  const transporter = createTransporter(empresa);

  await transporter.sendMail({
    from,
    to,
    subject: `Reporte Horas Extras - ${empresa} - ${periodo}`,
    html: `
      <p>Cordial saludo,</p>
      <p>Se adjunta el reporte de horas extras de <strong>${empresa}</strong> correspondiente al período <strong>${periodo}</strong>.</p>
      <p>Att,<br/>Sistema de Control de Nómina</p>
    `,
    attachments: [
      {
        filename,
        content: buffer,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    ]
  });
};
