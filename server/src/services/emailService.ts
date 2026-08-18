import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

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

  const from = process.env.SMTP_USER;
  const to = RECIPIENTS[empresa];

  if (!from) {
    throw new Error('No hay configurado un correo SMTP. Verifica la variable SMTP_USER en .env');
  }

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
