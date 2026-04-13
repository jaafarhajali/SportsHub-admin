const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Define email options
  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
    text: options.message.replace(/<[^>]*>/g, ''),
  };

  // Send email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
