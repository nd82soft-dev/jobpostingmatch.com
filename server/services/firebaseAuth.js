import { db } from '../database/init.js';
import { getFirebaseAdmin } from '../lib/firebaseAdmin.js';

function getUserById(id) {
  return db.prepare(`
    SELECT id, email, name, subscription_tier, subscription_expires_at, created_at, updated_at, firebase_uid
    FROM users WHERE id = ?
  `).get(id);
}

export async function verifyFirebaseToken(token) {
  const admin = getFirebaseAdmin();
  return admin.auth().verifyIdToken(token);
}

export function getOrCreateUserFromToken(decodedToken) {
  const email = decodedToken.email;
  const firebaseUid = decodedToken.uid;
  const name = decodedToken.name || null;

  if (!email) {
    throw new Error('Email not present in Firebase token');
  }

  let user = db.prepare('SELECT * FROM users WHERE firebase_uid = ?').get(firebaseUid);

  if (!user) {
    user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  }

  if (user) {
    if (user.firebase_uid !== firebaseUid || (name && user.name !== name)) {
      db.prepare(`
        UPDATE users
        SET firebase_uid = COALESCE(firebase_uid, ?),
            name = COALESCE(?, name),
            updated_at = strftime('%s', 'now')
        WHERE id = ?
      `).run(firebaseUid, name, user.id);
    }
    return getUserById(user.id);
  }

  const result = db.prepare(`
    INSERT INTO users (email, password, name, firebase_uid)
    VALUES (?, ?, ?, ?)
  `).run(email, `firebase:${firebaseUid}`, name, firebaseUid);

  return getUserById(result.lastInsertRowid);
}
