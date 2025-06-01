import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { Prisma, User } from '@prisma/client';

interface UserWithVerification extends User {
  verificationCode: string | null;
  isVerified: boolean;
}

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with verification code
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        gpaScale: 9.0,
        verificationCode: verificationCode,
        isVerified: false
      } as Prisma.UserCreateInput,
    });

    // Try to send verification email, but don't fail if email sending fails
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Verify your ScholarLog account',
          html: `
            <h1>Welcome to ScholarLog!</h1>
            <p>Your verification code is: <strong>${verificationCode}</strong></p>
            <p>Please enter this code to verify your account.</p>
          `,
        });
      } else {
        console.warn('Email credentials not configured. Skipping verification email.');
      }
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue with registration even if email fails
    }

    res.status(201).json({ 
      message: 'Account created successfully', 
      userId: user.id,
      verificationCode: verificationCode // Send code in response for development
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  const { userId, code } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    }) as UserWithVerification;

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.verificationCode !== code) {
      res.status(400).json({ error: 'Invalid verification code' });
      return;
    }

    // Update user as verified
    await prisma.user.update({
      where: { id: userId },
      data: {
        isVerified: true,
        verificationCode: null
      } as Prisma.UserUpdateInput,
    });

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: '1d',
    });

    res.status(200).json({ 
      message: 'Email verified successfully',
      token 
    });
  } catch (error) {
    console.error('Verification Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ 
      where: { email },
    }) as UserWithVerification;
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (!user.isVerified) {
      res.status(401).json({ error: 'Please verify your email first' });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: '1d',
    });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};