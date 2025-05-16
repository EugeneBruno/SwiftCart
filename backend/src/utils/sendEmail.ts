import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // your Gmail address
    pass: process.env.EMAIL_PASS, // your Gmail app password
  },
});

export const sendOTPEmail = async (to: string, otp: string) => {
  const mailOptions = {
    from: `"SwiftCart" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your SwiftCart OTP Code',
    html: `
      <div style="font-family:sans-serif">
        <h2>SwiftCart Email Verification</h2>
        <p>Your OTP code is:</p>
        <h3>${otp}</h3>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
