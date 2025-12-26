import dotenv from 'dotenv';
import { getFirestore, getTimestamp } from '../services/firestore.js';

dotenv.config();

const email = process.argv[2] || process.env.ADMIN_EMAIL;
const name = process.argv[3] || null;

if (!email) {
  console.error('Admin email is required.');
  process.exit(1);
}

async function run() {
  const db = getFirestore();
  const Timestamp = getTimestamp();

  const existing = await db.collection('users').where('email', '==', email).limit(1).get();
  if (!existing.empty) {
    const doc = existing.docs[0];
    await doc.ref.set({
      subscription_tier: 'premium',
      subscription_expires_at: null,
      updatedAt: Timestamp.now()
    }, { merge: true });
    console.log('Admin user already existed. Upgraded to premium.');
    return;
  }

  const createdAt = Timestamp.now();
  await db.collection('users').add({
    email,
    name,
    subscription_tier: 'premium',
    subscription_expires_at: null,
    createdAt,
    updatedAt: createdAt
  });

  console.log('Admin user created in Firestore.');
}

run().catch((error) => {
  console.error('Failed to create admin user:', error?.message || error);
  process.exit(1);
});
