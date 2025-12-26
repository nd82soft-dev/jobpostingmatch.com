import { getFirebaseAdmin } from '../lib/firebaseAdmin.js';
import { getFirestore, getTimestamp } from './firestore.js';

export async function verifyFirebaseToken(token) {
  const admin = getFirebaseAdmin();
  return admin.auth().verifyIdToken(token);
}

export async function getOrCreateUserFromToken(decodedToken) {
  const db = getFirestore();
  const Timestamp = getTimestamp();
  const email = decodedToken.email;
  const firebaseUid = decodedToken.uid;
  const name = decodedToken.name || null;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!email) {
    throw new Error('Email not present in Firebase token');
  }

  const userRef = db.collection('users').doc(firebaseUid);
  const userSnap = await userRef.get();

  if (userSnap.exists) {
    const data = userSnap.data();
    const updates = {};
    if (data?.email !== email) updates.email = email;
    if (name && data?.name !== name) updates.name = name;
    if (adminEmail && email === adminEmail && data?.subscription_tier !== 'premium') {
      updates.subscription_tier = 'premium';
      updates.subscription_expires_at = null;
    }
    if (Object.keys(updates).length) {
      updates.updatedAt = Timestamp.now();
      await userRef.set(updates, { merge: true });
    }
    return {
      id: firebaseUid,
      uid: firebaseUid,
      email: data?.email || email,
      name: data?.name || name,
      subscription_tier: (adminEmail && email === adminEmail)
        ? 'premium'
        : (data?.subscription_tier || 'free'),
      subscription_expires_at: data?.subscription_expires_at || null,
      created_at: data?.createdAt?.seconds || null,
      updated_at: data?.updatedAt?.seconds || null
    };
  }

  const emailSnap = await db.collection('users').where('email', '==', email).limit(1).get();
  if (!emailSnap.empty) {
    const legacyDoc = emailSnap.docs[0];
    const legacyData = legacyDoc.data();
    await userRef.set({
      ...legacyData,
      email,
      name: name || legacyData.name || null,
      createdAt: legacyData.createdAt || Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    await legacyDoc.ref.delete();
    return {
      id: firebaseUid,
      uid: firebaseUid,
      email,
      name: name || legacyData.name || null,
      subscription_tier: legacyData.subscription_tier || 'free',
      subscription_expires_at: legacyData.subscription_expires_at || null,
      created_at: legacyData.createdAt?.seconds || null,
      updated_at: Timestamp.now().seconds
    };
  }

  const createdAt = Timestamp.now();
  const isAdmin = adminEmail && email === adminEmail;
  await userRef.set({
    email,
    name,
    subscription_tier: isAdmin ? 'premium' : 'free',
    subscription_expires_at: null,
    createdAt,
    updatedAt: createdAt
  });

  return {
    id: firebaseUid,
    uid: firebaseUid,
    email,
    name,
    subscription_tier: isAdmin ? 'premium' : 'free',
    subscription_expires_at: null,
    created_at: createdAt.seconds,
    updated_at: createdAt.seconds
  };
}
