import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Analyze how well a resume matches a job posting
export async function analyzeResumeMatch(resumeContent, resumeData, jobDescription, jobData) {
  try {
    const prompt = `You are an expert resume analyzer and career coach. Analyze how well this resume matches the job posting.

RESUME:
${resumeContent}

JOB POSTING:
${jobDescription}

Provide a comprehensive analysis in JSON format:
{
  "overallScore": 0-100,
  "skillsScore": 0-100,
  "experienceScore": 0-100,
  "keywordScore": 0-100,
  "summary": "2-3 sentence overall assessment",
  "strengths": ["strength 1", "strength 2", ...],
  "gaps": ["gap 1", "gap 2", ...],
  "recommendations": [
    {
      "section": "Professional Summary|Skills|Experience|Keywords",
      "priority": "high|medium|low",
      "issue": "What's wrong or missing",
      "why": "Why this matters for this specific job",
      "suggestion": "Specific actionable advice",
      "example": "Concrete before/after example if applicable"
    }
  ],
  "missingSkills": ["skill1", "skill2", ...],
  "weakSkills": ["skill1", "skill2", ...],
  "atsIssues": ["issue1", "issue2", ...],
  "keywordGaps": [
    {
      "keyword": "important keyword from job",
      "reason": "why it matters",
      "where": "where to add it (summary/experience/skills)"
    }
  ],
  "experienceAlignment": {
    "score": 0-100,
    "analysis": "How well experience matches job requirements",
    "improvements": ["specific improvement 1", ...]
  },
  "optimizationPriorities": [
    "1. Most important change",
    "2. Second priority",
    "3. Third priority"
  ]
}

Be specific, actionable, and focused on this particular job posting. Only return valid JSON.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    });

    const content = message.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return analysis;
    }

    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('AI analysis error:', error);
    throw error;
  }
}

// Generate an optimized resume based on analysis
export async function generateOptimizedResume(resumeContent, resumeData, jobDescription, jobData, existingAnalysis) {
  try {
    const analysisContext = existingAnalysis
      ? `\n\nPREVIOUS ANALYSIS:\n${JSON.stringify(existingAnalysis, null, 2)}`
      : '';

    const prompt = `You are an expert resume writer. Create an optimized version of this resume specifically tailored for this job posting.

ORIGINAL RESUME:
${resumeContent}

JOB POSTING:
${jobDescription}${analysisContext}

Create an optimized resume that:
1. Incorporates key keywords from the job posting naturally
2. Highlights relevant experience and skills
3. Adjusts the professional summary to match the role
4. Uses action verbs and quantifiable achievements
5. Is ATS-friendly
6. Maintains truthfulness (don't add fake experience)

Return a JSON object:
{
  "name": "Candidate Name",
  "title": "Professional title aligned with job",
  "email": "email@example.com",
  "phone": "phone number",
  "location": "location",
  "summary": "Optimized professional summary (3-4 lines, tailored to job)",
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "period": "Jan 2020 - Present",
      "bullets": [
        "Achievement-focused bullet with metrics",
        "Another bullet using keywords from job posting",
        ...
      ]
    }
  ],
  "skills": ["skill1", "skill2", ...],
  "education": [
    {
      "degree": "Degree Name",
      "school": "School Name",
      "year": "2020",
      "details": "Additional details if relevant"
    }
  ],
  "changes": [
    "Summary of change 1",
    "Summary of change 2",
    ...
  ]
}

Only return valid JSON.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    });

    const content = message.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Failed to parse optimized resume');
  } catch (error) {
    console.error('Resume optimization error:', error);
    throw error;
  }
}
