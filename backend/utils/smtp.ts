import { SMTPClient } from "emailjs";

const client = new SMTPClient({
  user: process.env.SMTP_USER,
  password: process.env.SMTP_PASSWORD,
  host: process.env.SMTP_HOST,
  ssl: true,
});

export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html: string,
) => {
  await client.sendAsync({
    from: `${process.env.SMTP_FROM} <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    attachment: [
      {
        data: `<html>${html}</html>`,
        alternative: true,
      },
    ],
  });
};
