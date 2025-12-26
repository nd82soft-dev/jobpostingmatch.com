import dotenv from 'dotenv';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { getFirestore, getTimestamp } from '../services/firestore.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlitePath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/resumepro.db');
const sqlite = new Database(sqlitePath, { readonly: true });
const db = getFirestore();
const Timestamp = getTimestamp();

function toTimestamp(seconds) {
  if (!seconds) return Timestamp.now();
  return Timestamp.fromMillis(Number(seconds) * 1000);
}

function buildParsedText(parsedData) {
  const experience = (parsedData?.experience || []).map((exp) => {
    return [exp.title, exp.company, exp.description].filter(Boolean).join(' - ');
  }).filter(Boolean);

  const education = (parsedData?.education || []).map((edu) => {
    return [edu.degree, edu.details].filter(Boolean).join(' - ');
  }).filter(Boolean);

  return {
    summary: parsedData?.summary || '',
    experience,
    skills: parsedData?.skills || [],
    education
  };
}

async function migrate() {
  const users = sqlite.prepare('SELECT * FROM users').all();
  const userIdMap = new Map();

  for (const user of users) {
    if (!user.firebase_uid) continue;
    const docRef = db.collection('users').doc(user.firebase_uid);
    await docRef.set({
      email: user.email,
      name: user.name || null,
      subscription_tier: user.subscription_tier || 'free',
      subscription_expires_at: user.subscription_expires_at || null,
      createdAt: toTimestamp(user.created_at),
      updatedAt: toTimestamp(user.updated_at || user.created_at)
    }, { merge: true });
    userIdMap.set(user.id, user.firebase_uid);
  }

  const resumes = sqlite.prepare('SELECT * FROM resumes').all();
  for (const resume of resumes) {
    const uid = userIdMap.get(resume.user_id);
    if (!uid) continue;
    const resumeId = `legacy_${resume.id}`;
    const parsedData = resume.parsed_data ? JSON.parse(resume.parsed_data) : {};
    const templateConfig = resume.template_config ? JSON.parse(resume.template_config) : {};
    await db.collection('resumes').doc(resumeId).set({
      userId: uid,
      name: resume.name || 'My Resume',
      storagePath: null,
      originalFormat: null,
      parsedText: buildParsedText(parsedData),
      template_id: resume.template_id || 'premium_professional',
      template_config: templateConfig,
      is_favorite: resume.is_favorite || 0,
      createdAt: toTimestamp(resume.created_at),
      updatedAt: toTimestamp(resume.updated_at || resume.created_at)
    }, { merge: true });
  }

  const jobs = sqlite.prepare('SELECT * FROM jobs').all();
  for (const job of jobs) {
    const uid = userIdMap.get(job.user_id);
    if (!uid) continue;
    const jobId = `legacy_${job.id}`;
    const parsedData = job.parsed_data ? JSON.parse(job.parsed_data) : {};
    await db.collection('jobs').doc(jobId).set({
      userId: uid,
      title: job.title,
      company: job.company || null,
      description: job.description,
      parsed_data: parsedData,
      createdAt: toTimestamp(job.created_at)
    }, { merge: true });
  }

  const analyses = sqlite.prepare('SELECT * FROM analyses').all();
  for (const analysis of analyses) {
    const uid = userIdMap.get(analysis.user_id);
    if (!uid) continue;
    const analysisId = `legacy_${analysis.id}`;
    const analysisData = analysis.analysis_data ? JSON.parse(analysis.analysis_data) : {};
    await db.collection('analyses').doc(analysisId).set({
      userId: uid,
      resumeId: `legacy_${analysis.resume_id}`,
      jobId: `legacy_${analysis.job_id}`,
      overall_score: analysis.overall_score,
      skills_score: analysis.skills_score,
      experience_score: analysis.experience_score,
      keyword_score: analysis.keyword_score,
      analysis_data: analysisData,
      created_at: toTimestamp(analysis.created_at)
    }, { merge: true });
  }

  const exportsRows = sqlite.prepare('SELECT * FROM exports').all();
  for (const exportRow of exportsRows) {
    const uid = userIdMap.get(exportRow.user_id);
    if (!uid) continue;
    await db.collection('exports').add({
      userId: uid,
      resumeId: `legacy_${exportRow.resume_id}`,
      format: exportRow.format,
      created_at: toTimestamp(exportRow.created_at)
    });
  }

  const metrics = sqlite.prepare('SELECT * FROM daily_metrics').all();
  for (const metric of metrics) {
    const uniques = sqlite.prepare(`
      SELECT COUNT(*) AS total FROM daily_unique_visitors WHERE day = ?
    `).get(metric.day);
    await db.collection('daily_metrics').doc(metric.day).set({
      day: metric.day,
      visits: metric.visits || 0,
      resumes_uploaded: metric.resumes_uploaded || 0,
      optimized_resumes: metric.optimized_resumes || 0,
      exports_pdf: metric.exports_pdf || 0,
      exports_docx: metric.exports_docx || 0,
      unique_visitors: uniques?.total || 0
    }, { merge: true });
  }

  const uniqueVisitors = sqlite.prepare('SELECT * FROM daily_unique_visitors').all();
  for (const visitor of uniqueVisitors) {
    await db.collection('daily_unique_visitors')
      .doc(`${visitor.day}_${visitor.visitor_key}`)
      .set({
        day: visitor.day,
        visitor_key: visitor.visitor_key
      }, { merge: true });
  }

  const summary = {
    users: users.length,
    resumes: resumes.length,
    jobs: jobs.length,
    analyses: analyses.length,
    exports: exportsRows.length,
    daily_metrics: metrics.length,
    daily_unique_visitors: uniqueVisitors.length
  };

  console.log('Migration completed:', summary);
}

migrate().catch((error) => {
  console.error('Migration failed:', error?.message || error);
  process.exit(1);
});
