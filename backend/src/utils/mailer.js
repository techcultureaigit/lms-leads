import nodemailer from "nodemailer";

let transporter;

function getTransporter() {
  const host = process.env.SMTP_HOST_EZ || process.env.SMTP_HOST;
  const user = process.env.EMAIL_USER_EZ || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS_EZ || process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    throw new Error(
      "SMTP is not configured. Set SMTP_HOST_EZ, SMTP_PORT_EZ, EMAIL_USER_EZ, EMAIL_PASS_EZ, and MAIL_FROM.",
    );
  }
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT_EZ || process.env.SMTP_PORT || 587);
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    });
  }
  return transporter;
}

export async function sendMail({ to, subject, html, text }) {
  const from = process.env.MAIL_FROM || process.env.EMAIL_USER_EZ || process.env.SMTP_USER;
  const transport = getTransporter();
  await transport.sendMail({
    from,
    to,
    subject: subject || "(no subject)",
    html: html || "",
    text: text || "",
  });
}
