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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await prisma.user.create({
      data: {
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
      subject: 'Verify your SwiftCart account',
      text: `Your OTP for SwiftCart is: ${otp}`
    });

    return res.status(201).json({
      message: 'User registered successfully. OTP sent.',
      user
    });
  } catch (error) {
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

    return res.status(200).json({ message: 'Account verified successfully.' });
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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.isVerified) {
      return res.status(401).json({ message: 'Invalid credentials or unverified account.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secretkey', {
      expiresIn: '1h'
    });

    return res.json({ token, message: 'Login successful.' });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Something went wrong during login.' });
  }
};
