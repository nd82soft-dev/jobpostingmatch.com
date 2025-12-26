import crypto from 'crypto';
import { getFirestore, getTimestamp } from './firestore.js';

function getDayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function hashValue(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export async function recordVisit({ anonId, userId }) {
  const day = getDayKey();
  const db = getFirestore();
  const Timestamp = getTimestamp();
  const metricsRef = db.collection('daily_metrics').doc(day);

  const source = userId ? `user:${userId}` : (anonId ? `anon:${anonId}` : null);
  const visitorKey = source ? hashValue(source) : null;
  const uniqueRef = visitorKey
    ? db.collection('daily_unique_visitors').doc(`${day}_${visitorKey}`)
    : null;

  await db.runTransaction(async (tx) => {
    const metricsSnap = await tx.get(metricsRef);
    const metricsData = metricsSnap.exists ? metricsSnap.data() : {};
    const updates = {
      day,
      visits: (metricsData.visits || 0) + 1,
      resumes_uploaded: metricsData.resumes_uploaded || 0,
      optimized_resumes: metricsData.optimized_resumes || 0,
      exports_pdf: metricsData.exports_pdf || 0,
      exports_docx: metricsData.exports_docx || 0
    };

    if (uniqueRef) {
      const uniqueSnap = await tx.get(uniqueRef);
      if (!uniqueSnap.exists) {
        tx.set(uniqueRef, { day, visitor_key: visitorKey, created_at: Timestamp.now() });
        updates.unique_visitors = (metricsData.unique_visitors || 0) + 1;
      } else {
        updates.unique_visitors = metricsData.unique_visitors || 0;
      }
    } else {
      updates.unique_visitors = metricsData.unique_visitors || 0;
    }

    updates.updated_at = Timestamp.now();
    tx.set(metricsRef, updates, { merge: true });
  });
}

export async function incrementMetric(metricKey) {
  const day = getDayKey();
  const db = getFirestore();
  const Timestamp = getTimestamp();
  const metricsRef = db.collection('daily_metrics').doc(day);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(metricsRef);
    const data = snap.exists ? snap.data() : {};
    const updates = {
      day,
      visits: data.visits || 0,
      resumes_uploaded: data.resumes_uploaded || 0,
      optimized_resumes: data.optimized_resumes || 0,
      exports_pdf: data.exports_pdf || 0,
      exports_docx: data.exports_docx || 0,
      unique_visitors: data.unique_visitors || 0
    };
    updates[metricKey] = (data[metricKey] || 0) + 1;
    updates.updated_at = Timestamp.now();
    tx.set(metricsRef, updates, { merge: true });
  });
}

export async function getMetricsSummary({ startDay, endDay }) {
  const db = getFirestore();
  const snapshot = await db.collection('daily_metrics')
    .where('day', '>=', startDay)
    .where('day', '<=', endDay)
    .get();

  const totals = {
    visits: 0,
    resumes_uploaded: 0,
    optimized_resumes: 0,
    exports_pdf: 0,
    exports_docx: 0,
    unique_visitors: 0
  };

  const byDay = [];
  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    totals.visits += data.visits || 0;
    totals.resumes_uploaded += data.resumes_uploaded || 0;
    totals.optimized_resumes += data.optimized_resumes || 0;
    totals.exports_pdf += data.exports_pdf || 0;
    totals.exports_docx += data.exports_docx || 0;
    totals.unique_visitors += data.unique_visitors || 0;

    byDay.push({
      day: data.day,
      visits: data.visits || 0,
      resumes_uploaded: data.resumes_uploaded || 0,
      optimized_resumes: data.optimized_resumes || 0,
      exports_pdf: data.exports_pdf || 0,
      exports_docx: data.exports_docx || 0
    });
  });

  byDay.sort((a, b) => a.day.localeCompare(b.day));

  return {
    totals,
    byDay
  };
}
