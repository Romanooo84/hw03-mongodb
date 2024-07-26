const nodemailer = require("nodemailer");
require('dotenv').config()
const gUser = process.env.GMAIL_USER
const gPass = process.env.GMAIL_PASS

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: gUser,
    pass: gPass,
  },
});


const sendEmail =async(email, subject, html)=>   {
  const info = await transporter.sendMail({
    from: '"Roman" <goitmytest@gmail.com>', 
    to: email, 
    subject, 
    html
  });

  console.log("Message sent: %s", info.messageId);
}

module.exports = {
  sendEmail
}