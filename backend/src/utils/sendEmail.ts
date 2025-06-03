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

export const sendOrderConfirmationEmail = async (
  to: string,
  name: string,
  address: string,
  items: { name: string; quantity: number; price: number }[]
) => {
  const orderSummary = items
    .map(
      (item) =>
        `<li>${item.name} x${item.quantity} — ₦${(item.quantity * item.price).toLocaleString()}</li>`
    )
    .join('');

  const mailOptions = {
    from: `"SwiftCart" <${process.env.EMAIL_USER}>`,
    to,
    subject: '🧾 Order Confirmation - SwiftCart',
    html: `
      <div style="font-family: sans-serif;">
        <h2>Thanks for shopping with SwiftCart, ${name}!</h2>
        <p>You’ve successfully placed an order with the following items:</p>
        <ul>${orderSummary}</ul>
        <p>Your package(s) will be shipped to: <strong>${address}</strong> within the next 3–4 working days.</p>
        <p>We appreciate your trust in SwiftCart ❤️</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
