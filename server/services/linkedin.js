import axios from 'axios';
import * as cheerio from 'cheerio';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Fetch job posting from LinkedIn URL
export async function fetchLinkedInJob(url) {
  try {
    // LinkedIn requires user agent and may block automated requests
    // This is a simplified version - production would need more robust handling
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);

    // Extract job details from LinkedIn page structure
    const title = $('h1.top-card-layout__title').text().trim() ||
                  $('h1').first().text().trim();

    const company = $('a.topcard__org-name-link').text().trim() ||
                    $('.topcard__flavor--black-link').first().text().trim();

    const description = $('.description__text').text().trim() ||
                        $('.show-more-less-html__markup').text().trim() ||
                        $('div[class*="description"]').text().trim();

    if (!description) {
      throw new Error('Could not extract job description from URL');
    }

    // Parse the job description using AI
    const parsed = await parseJobDescription(description);

    return {
      title: title || 'Job Posting',
      company,
      description,
      parsed
    };
  } catch (error) {
    console.error('LinkedIn fetch error:', error);

    // Fallback: If direct scraping fails, try to get basic content
    if (error.response?.status === 403 || error.response?.status === 429) {
      throw new Error('LinkedIn access blocked. Please paste the job description manually.');
    }

    throw new Error('Failed to fetch LinkedIn job posting');
  }
}

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
