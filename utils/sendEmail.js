const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1. Create a transporter
  const transporter = nodemailer.createTransport({
    service: "gmail", // or use `host`, `port`, and `auth` for SMTP
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2. Define the email options
  const mailOptions = {
    from: '"Trade Emma" <no-reply@tradeemma.com>',
    to: options.to,
    subject: options.subject,
    text: options.text,
  };

  // 3. Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
