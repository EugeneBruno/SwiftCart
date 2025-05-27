// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const registerUser = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      username,
      phone,
      address,
      email,
      password
    } = req.body;

    if (!firstName || !lastName || !username || !phone || !address || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check each field individually for clarity
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ message: 'Email already in use.' });
    }

    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      return res.status(409).json({ message: 'Username already in use.' });
    }

    const existingPhone = await prisma.user.findUnique({ where: { phone } });
    if (existingPhone) {
      return res.status(409).json({ message: 'Phone number already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        username,
        phone,
        address,
        email,
        password: hashedPassword,
        otp,
        otpExpiresAt,
        isVerified: false
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'SwiftCart OTP Verification',
      html: `<p>Hi ${firstName}, your OTP is <strong>${otp}</strong>. It expires in 10 minutes.</p>`
    });

    return res.status(201).json({ message: 'OTP sent to email.', user: { email } });

  } catch (error: any) {
    console.error('Registration Error:', error);
    return res.status(500).json({ message: 'Something went wrong during registration.' });
  }
};


export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.otp !== otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    await prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        otp: null,
        otpExpiresAt: null
      }
    });

    // ✅ Send welcome email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to SwiftCart 🎉',
      html: `<h3>Welcome, ${user.firstName}!</h3><p>Your account is now verified. Happy shopping at SwiftCart!</p>`
    });

    return res.status(200).json({ message: 'OTP verified successfully. You can now log in.' });
  } catch (error) {
    console.error('OTP Verification Error:', error);
    return res.status(500).json({ message: 'Something went wrong during OTP verification.' });
  }
};

export const resendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Account is already verified.' });
    }

    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { otp, otpExpiresAt }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'SwiftCart OTP Resend',
      text: `Your new SwiftCart OTP is: ${otp}`
    });

    return res.status(200).json({ message: 'OTP resent successfully.' });
  } catch (error) {
    console.error('Resend OTP Error:', error);
    return res.status(500).json({ message: 'Something went wrong while resending OTP.' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body; // 'identifier' can be email or username

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Email/Username and password are required.' });
    }

    // Check if it's an email (contains '@'), else treat as username
    const user = identifier.includes('@')
      ? await prisma.user.findUnique({ where: { email: identifier } })
      : await prisma.user.findUnique({ where: { username: identifier } });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your account first.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secretkey', {
      expiresIn: '1h',
    });

    return res.json({
      token,
      message: 'Login successful.',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Something went wrong during login.' });
  }
};

