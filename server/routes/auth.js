import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getOrCreateUserFromToken, verifyFirebaseToken } from '../services/firebaseAuth.js';

const router = express.Router();

async function handleFirebaseAuth(req, res) {
  try {
    const { idToken } = req.body || {};
    if (!idToken) {
      return res.status(400).json({ error: 'Firebase ID token required' });
    }

    const decodedToken = await verifyFirebaseToken(idToken);
    const user = await getOrCreateUserFromToken(decodedToken);
    return res.json({ user });
  } catch (error) {
    console.error('Firebase auth error:', error);
    return res.status(401).json({ error: 'Invalid Firebase token' });
  }
}

// Register (Firebase)
router.post('/register', handleFirebaseAuth);

// Login (Firebase)
router.post('/login', handleFirebaseAuth);

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;
