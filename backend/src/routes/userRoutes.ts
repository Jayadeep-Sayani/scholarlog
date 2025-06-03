import express from 'express';
import prisma from '../utils/prisma';
import { verifyToken, AuthRequest } from '../middleware/authMiddleware';

const router = express.Router();

// Update user settings
router.post('/settings', verifyToken, async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const { gpaScale } = req.body;
    
    // Validate gpaScale value
    if (gpaScale !== 4.0 && gpaScale !== 9.0) {
      res.status(400).json({ error: 'Invalid GPA scale value. Must be 4.0 or 9.0.' });
    }
    
    // Update user settings
    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: { gpaScale },
      select: { id: true, email: true, gpaScale: true }
    });
    
    res.status(200).json({
      message: 'Settings updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user settings
router.get('/settings', verifyToken, async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, gpaScale: true }
    });
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;