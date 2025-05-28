import express from 'express';
import { registerUser, loginUser } from '../controllers/authController';
import { verifyToken } from '../middleware/authMiddleware';
import prisma from '../utils/prisma';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);


router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: (req as any).userId },
      select: { id: true, email: true }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'Token is valid!', user });
  } catch (error) {
    console.error('Error fetching user in /me:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;