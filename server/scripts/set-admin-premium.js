import dotenv from 'dotenv';
import { getFirestore, getTimestamp } from '../services/firestore.js';
import { getFirebaseAdmin } from '../lib/firebaseAdmin.js';

dotenv.config();

const emailArg = process.argv[2];
const adminEmail = emailArg || process.env.ADMIN_EMAIL;

if (!adminEmail) {
  console.error('ADMIN_EMAIL is required (env or argument).');
  process.exit(1);
}

async function run() {
  const db = getFirestore();
  const Timestamp = getTimestamp();

  const snap = await db.collection('users').where('email', '==', adminEmail).get();
  const updates = [];
  const batch = db.batch();

  snap.docs.forEach((doc) => {
    batch.set(doc.ref, {
      subscription_tier: 'premium',
      subscription_expires_at: null,
      updatedAt: Timestamp.now()
    }, { merge: true });
    updates.push(doc.ref.id);
  });

  try {
    const admin = getFirebaseAdmin();
    const userRecord = await admin.auth().getUserByEmail(adminEmail);
    if (userRecord?.uid) {
      const uidRef = db.collection('users').doc(userRecord.uid);
      batch.set(uidRef, {
        email: adminEmail,
        subscription_tier: 'premium',
        subscription_expires_at: null,
        updatedAt: Timestamp.now()
      }, { merge: true });
      updates.push(userRecord.uid);
    }
  } catch (error) {
    // Ignore lookup failures; email-based update still applies.
  }

  if (!updates.length) {
    console.log('No matching user found for admin email.');
    return;
  }

  await batch.commit();
  console.log(`Updated admin user(s) to premium: ${updates.join(', ')}`);
}

run().catch((error) => {
  console.error('Failed to update admin user:', error?.message || error);
  process.exit(1);
});
