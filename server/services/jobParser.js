import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Parse job description using AI
export async function parseJobDescription(description) {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `Analyze this job description and extract key information in JSON format:

${description}

Return a JSON object with:
{
  "requiredSkills": ["skill1", "skill2", ...],
  "preferredSkills": ["skill1", "skill2", ...],
  "responsibilities": ["resp1", "resp2", ...],
  "qualifications": ["qual1", "qual2", ...],
  "keywords": ["keyword1", "keyword2", ...],
  "experienceLevel": "entry|mid|senior|executive",
  "yearsExperience": "X-Y years"
}

Only return valid JSON, no additional text.`
      }]
    });

    const content = message.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback parsing
    return fallbackJobParsing(description);
  } catch (error) {
    console.error('AI parsing error:', error);
    return fallbackJobParsing(description);
  }
}

// Fallback job parsing without AI
function fallbackJobParsing(description) {
  const lowerDesc = description.toLowerCase();

  // Extract skills using common patterns
  const skillPatterns = [
    /(?:experience with|proficiency in|knowledge of|skilled in)\s+([^.]+)/gi,
    /(?:skills?:\s*)([^.\n]+)/gi
  ];

  const skills = new Set();
  skillPatterns.forEach(pattern => {
    const matches = description.matchAll(pattern);
    for (const match of matches) {
      match[1].split(/[,;]/).forEach(skill => {
        const cleaned = skill.trim();
        if (cleaned.length > 2 && cleaned.length < 50) {
          skills.add(cleaned);
        }
      });
    }
  });

  // Determine experience level
  let experienceLevel = 'mid';
  if (lowerDesc.includes('senior') || lowerDesc.includes('lead')) {
    experienceLevel = 'senior';
  } else if (lowerDesc.includes('entry') || lowerDesc.includes('junior')) {
    experienceLevel = 'entry';
  } else if (lowerDesc.includes('executive') || lowerDesc.includes('director')) {
    experienceLevel = 'executive';
  }

  // Extract years of experience
  const yearsMatch = description.match(/(\d+)[\+\-\s]*(?:to|\-)?\s*(\d+)?\s*(?:years?|yrs?)/i);
  let yearsExperience = '';
  if (yearsMatch) {
    yearsExperience = yearsMatch[2]
      ? `${yearsMatch[1]}-${yearsMatch[2]} years`
      : `${yearsMatch[1]}+ years`;
  }

  return {
    requiredSkills: Array.from(skills).slice(0, 10),
    preferredSkills: [],
    responsibilities: [],
    qualifications: [],
    keywords: Array.from(skills),
    experienceLevel,
    yearsExperience
  };
}
