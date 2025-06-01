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
    const existingUser = await prisma.$queryRaw<{ id: number; isVerified: boolean }[]>`
      SELECT id, "isVerified" FROM "User" WHERE email = ${email}
    `;

    if (existingUser && existingUser.length > 0) {
      if (!existingUser[0].isVerified) {
        // If user exists but is not verified, just return the user ID
        res.status(200).json({ 
          message: 'Account exists but needs verification', 
          userId: existingUser[0].id,
          needsVerification: true
        });
        return;
      }
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

    // Try to send verification email
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
    }

    res.status(201).json({ 
      message: 'Account created successfully', 
      userId: user.id,
      verificationCode // For development
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
    const user = await prisma.$queryRaw<{ id: number; password: string; isVerified: boolean }[]>`
      SELECT id, password, "isVerified" FROM "User" WHERE email = ${email}
    `;

    if (!user || user.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const validPassword = await bcrypt.compare(password, user[0].password);
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (!user[0].isVerified) {
      res.status(401).json({ error: 'Please verify your email first' });
      return;
    }

    const token = jwt.sign({ userId: user[0].id }, process.env.JWT_SECRET as string, {
      expiresIn: '1d',
    });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserIdByEmail = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  try {
    const user = await prisma.$queryRaw<{ id: number; isVerified: boolean }[]>`
      SELECT id, "isVerified" FROM "User" WHERE email = ${email}
    `;

    if (!user || user.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user[0].isVerified) {
      res.status(400).json({ error: 'User is already verified' });
      return;
    }

    res.status(200).json({ userId: user[0].id });
  } catch (error) {
    console.error('Get User ID Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const resendVerificationCode = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  try {
    const user = await prisma.$queryRaw<{ id: number; isVerified: boolean; verificationCode: string | null }[]>`
      SELECT id, "isVerified", "verificationCode" FROM "User" WHERE email = ${email}
    `;

    if (!user || user.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user[0].isVerified) {
      res.status(400).json({ error: 'User is already verified' });
      return;
    }

    // Generate new verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Update user with new code
    await prisma.$executeRaw`
      UPDATE "User" 
      SET "verificationCode" = ${verificationCode}
      WHERE id = ${user[0].id}
    `;

    // Try to send verification email
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
      // Continue even if email fails
    }

    res.status(200).json({ 
      message: 'New verification code sent',
      userId: user[0].id,
      verificationCode // Send code in response for development
    });
  } catch (error) {
    console.error('Resend Verification Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};