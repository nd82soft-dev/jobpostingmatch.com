import { getFirebaseAdmin } from '../lib/firebaseAdmin.js';

export function getFirestore() {
  return getFirebaseAdmin().firestore();
}

export function getStorageBucket() {
  const admin = getFirebaseAdmin();
  const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
  if (!bucketName) {
    throw new Error('Missing FIREBASE_STORAGE_BUCKET in environment');
  }
  return admin.storage().bucket(bucketName);
}

export function getTimestamp() {
  return getFirebaseAdmin().firestore.Timestamp;
}
