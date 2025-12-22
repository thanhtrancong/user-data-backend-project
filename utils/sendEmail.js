/* FILE: UTILS/SENDEMAIL.JS */
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Tạo Transporter (Cấu hình server gửi mail)
  // Thay thế bằng thông tin từ Mailtrap hoặc Gmail App Password của bạn
  const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "d436ef15ef05f9", // Copy từ Mailtrap
      pass: "****7e91"  // Copy từ Mailtrap
    },
  });

  // 2. Cấu hình nội dung email
  const message = {
    from: 'VLSC Shop <noreply@vlsc.edu.vn>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3. Gửi
  await transporter.sendMail(message);
};

module.exports = sendEmail;
