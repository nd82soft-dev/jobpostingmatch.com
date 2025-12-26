import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const SYSTEM_PROMPT = `You are a senior technical recruiter and LinkedIn sourcing specialist.

Your job is to optimize LinkedIn profiles so recruiters can FIND candidates
using LinkedIn search, filters, and relevance ranking.

You do NOT write resumes.
You DO optimize for:
- Recruiter keyword searches
- Headline relevance
- Early-profile skimmability
- LinkedIn search weighting (headline, About, experience)

Rules:
- Never fabricate experience
- Never exaggerate seniority
- Optimize wording, structure, and keyword placement only
- Prioritize clarity and search relevance over flowery language
- Assume recruiters skim profiles in under 10 seconds

Output must be concise, structured, and copy-ready for LinkedIn.`;

const TITLE_NORMALIZATION = [
  { pattern: /application support/i, replacement: 'Product Support' },
  { pattern: /systems analyst/i, replacement: 'Technical Analyst' },
  { pattern: /it specialist/i, replacement: 'Technical Support Engineer' }
];

const KEYWORD_CANDIDATES = [
  'saas',
  'enterprise',
  'b2b',
  'b2b2c',
  'customer-facing',
  'product support',
  'technical escalation',
  'troubleshooting',
  'validation',
  'deployment',
  'integration',
  'root cause analysis',
  'rca',
  'windows server',
  'linux',
  'aws',
  'azure',
  'sql',
  'api'
];

function normalizeJobTitle(jobTitle) {
  if (!jobTitle) return '';
  let normalized = jobTitle.trim();
  TITLE_NORMALIZATION.forEach((rule) => {
    if (rule.pattern.test(normalized)) {
      normalized = normalized.replace(rule.pattern, rule.replacement);
    }
  });
  return normalized;
}

function extractKeywords(jobTitle, jobDescription) {
  const text = `${jobTitle || ''} ${jobDescription || ''}`.toLowerCase();
  const keywords = [];
  KEYWORD_CANDIDATES.forEach((keyword) => {
    if (text.includes(keyword.toLowerCase())) {
      keywords.push(keyword);
    }
  });
  if (jobTitle) {
    keywords.unshift(jobTitle.trim());
  }
  return Array.from(new Set(keywords)).slice(0, 18);
}

function findWeakKeywords({ headline, about, experience, skills }, keywords) {
  const sections = [headline, about, experience, skills].map((value) => (value || '').toLowerCase());
  return keywords.filter((keyword) => {
    const needle = keyword.toLowerCase();
    const hits = sections.reduce((count, section) => (section.includes(needle) ? count + 1 : count), 0);
    return hits < 2;
  });
}

function buildUserPrompt(data) {
  const normalizedTitle = normalizeJobTitle(data.job_title || '');
  const keywords = extractKeywords(normalizedTitle, data.job_description || '');
  const weakKeywords = findWeakKeywords(data, keywords);
  const keywordHint = weakKeywords.length
    ? `\n\nIMPORTANT KEYWORDS (weak coverage): ${weakKeywords.join(', ')}`
    : '';

  const jobDescription = `${data.job_description || ''}${keywordHint}`.trim();

  return `Optimize the following LinkedIn profile for recruiter discoverability.

TARGET ROLE:
${normalizedTitle || data.job_title || ''}
${jobDescription}

CURRENT LINKEDIN PROFILE:

HEADLINE:
${data.headline || ''}

ABOUT SECTION:
${data.about || ''}

EXPERIENCE:
${data.experience || ''}

SKILLS:
${data.skills || ''}

LOCATION:
${data.location || ''}

TASKS:

1. Calculate a Recruiter Visibility Score (0-100)
2. Rewrite the LinkedIn Headline for maximum recruiter search relevance
3. Rewrite the About section for keyword density and skimmability
4. Rewrite the first 2 lines of each experience entry to surface keywords
5. Identify missing recruiter search keywords
6. Explain why recruiters will find this profile more easily after optimization

CONSTRAINTS:
- Keep headline under 220 characters
- About section must be readable on mobile
- Keywords must appear naturally
- Do not invent tools, companies, or responsibilities
- Optimize for LinkedIn search, not ATS

Return output in clearly labeled sections.`;
}

export async function optimizeLinkedInProfile(payload) {
  const prompt = buildUserPrompt(payload);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }]
  });

  return message.content[0].text;
}
