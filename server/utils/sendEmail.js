const nodemailer = require('nodemailer');
const sendEmail = async ({ to, subject, html }) => { if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your@gmail.com') return { skipped: true }; const transporter = nodemailer.createTransport({ host: process.env.EMAIL_HOST, port: Number(process.env.EMAIL_PORT || 587), secure: false, auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } }); return transporter.sendMail({ from: `Niksa Mart <${process.env.EMAIL_USER}>`, to, subject, html }); };
module.exports = { sendEmail };
