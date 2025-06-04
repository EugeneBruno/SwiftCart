import { transporter } from '../config/nodemailer';

export const sendOTPEmail = async (to: string, otp: string) => {
  await transporter.sendMail({
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
  });
};

export const sendOrderConfirmationEmail = async (
  to: string,
  username: string,
  items: { name: string; price: number; quantity: number }[],
  address: string
) => {
  const orderList = items.map(
    item => `<li>${item.name} — ₦${item.price} x ${item.quantity}</li>`
  ).join('');

  const html = `
    <div style="font-family:sans-serif">
      <h2>Thanks for shopping with SwiftCart, ${username}!</h2>
      <p>Your order has been successfully placed with the following items:</p>
      <ul>${orderList}</ul>
      <p>Your package(s) will be shipped to <strong>${address}</strong> within 3-4 working days.</p>
      <p>We appreciate your business!</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"SwiftCart" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your SwiftCart Order Confirmation',
    html,
  });
};
