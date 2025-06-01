import express from 'express';
import { registerUser, loginUser, verifyEmail, getUserIdByEmail } from '../controllers/authController';
import { verifyToken } from '../middleware/authMiddleware';
import prisma from '../utils/prisma';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify', verifyEmail);
router.post('/get-user-id', getUserIdByEmail);

router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await prisma.$queryRaw<{ id: number; email: string; isVerified: boolean }[]>`
      SELECT id, email, "isVerified" FROM "User" WHERE id = ${(req as any).userId}
    `;

    if (!user || user.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({ message: 'Token is valid!', user: user[0] });
  } catch (error) {
    console.error('Error fetching user in /me:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;