import { getOrCreateUserFromToken, verifyFirebaseToken } from '../services/firebaseAuth.js';

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decodedToken = await verifyFirebaseToken(token);
    req.user = await getOrCreateUserFromToken(decodedToken);
    return next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

export function checkSubscription(req, res, next) {
  const { subscription_tier, subscription_expires_at } = req.user;

  if (subscription_tier === 'free') {
    return res.status(403).json({
      error: 'Premium subscription required',
      upgrade_required: true
    });
  }

  if (subscription_expires_at && subscription_expires_at < Date.now() / 1000) {
    return res.status(403).json({
      error: 'Subscription expired',
      subscription_expired: true
    });
  }

  next();
}
