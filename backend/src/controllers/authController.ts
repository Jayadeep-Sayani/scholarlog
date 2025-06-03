import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';
import jwt from 'jsonwebtoken';
import sgMail from '@sendgrid/mail';
import { Prisma, User } from '@prisma/client';

interface UserWithVerification extends User {
  verificationCode: string | null;
  isVerified: boolean;
}

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

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
      if (process.env.SENDGRID_API_KEY) {
        console.log('Attempting to send verification email to:', email);
        const msg = {
          to: email,
          from: process.env.SENDGRID_FROM_EMAIL as string,
          subject: 'Verify your ScholarLog account',
          html: `
            <h1>Welcome to ScholarLog!</h1>
            <p>Your verification code is: <strong>${verificationCode}</strong></p>
            <p>Please enter this code to verify your account.</p>
          `,
        };
        
        await sgMail.send(msg);
        console.log('Verification email sent successfully');
      } else {
        console.warn('SendGrid API key not configured. Skipping verification email.');
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
    const users = await prisma.$queryRaw<{ id: number; password: string; isVerified: boolean; verificationCode: string | null }[]>`
      SELECT id, password, "isVerified", "verificationCode" FROM "User" WHERE email = ${email}
    `;

    if (!users || users.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (!user.isVerified) {
      // Generate new verification code
      const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Update user with new verification code
      await prisma.user.update({
        where: { id: user.id },
        data: {
          verificationCode: newVerificationCode
        }
      });

      // Send new verification email
      try {
        if (process.env.SENDGRID_API_KEY) {
          console.log('Resending verification email to:', email);
          const msg = {
            to: email,
            from: process.env.SENDGRID_FROM_EMAIL as string,
            subject: 'Verify your ScholarLog account',
            html: `
              <h1>Welcome back to ScholarLog!</h1>
              <p>Your new verification code is: <strong>${newVerificationCode}</strong></p>
              <p>Please enter this code to verify your account.</p>
            `,
          };
          
          await sgMail.send(msg);
          console.log('Verification email resent successfully');
        }
      } catch (emailError) {
        console.error('Failed to resend verification email:', emailError);
      }

      res.status(200).json({ 
        requiresVerification: true,
        userId: user.id,
        message: 'New verification code sent to your email'
      });
      return;
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: '1d',
    });

    res.status(200).json({ 
      message: 'Login successful', 
      token,
      requiresVerification: false
    });
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