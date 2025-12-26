# jobpostingmatch.com - Premium Resume & Job Match Analyzer

🎯 **Upload your resume. See exactly why you're not getting interviews — and fix it.**

A production-ready web application that analyzes resumes against job postings, provides AI-powered recommendations, and generates professionally formatted, ATS-optimized resumes.

## 🌟 Features

### Core Functionality
- **📄 Resume Upload & Parsing** - Supports PDF, DOCX, DOC, and TXT formats
- **💼 LinkedIn Job Fetching** - Extract job details from LinkedIn URLs or manual input
- **🤖 AI-Powered Analysis** - Claude-powered resume-job matching with detailed scoring
- **📊 Match Scoring** - Overall, Skills, Experience, and Keyword coverage scores
- **💡 Actionable Recommendations** - Section-by-section improvement suggestions
- **✏️ Resume Optimization** - AI-generated optimized resumes tailored to specific jobs
- **🎨 Professional Templates** - 4 customizable templates (Modern, Classic, Executive, Creative)
- **🎨 Template Customization** - Customize colors and fonts
- **📥 Export to PDF/DOCX** - ATS-friendly professional documents
- **💾 Save Multiple Versions** - Manage different resume versions for different jobs
- **👤 User Authentication** - Secure JWT-based authentication
- **💳 Subscription Tiers** - Free and Premium plans

### Technical Highlights
- **Full-Stack Application** - React frontend + Node.js/Express backend
- **Database** - Firestore + Firebase Storage
- **AI Integration** - Anthropic Claude API for intelligent analysis
- **Document Processing** - Mammoth (DOCX), PDF-parse (PDF), PDFKit & DOCX libraries for generation
- **Security** - bcrypt, JWT, helmet, rate limiting
- **Responsive Design** - Mobile-first, fully responsive UI

## 🏗️ Architecture

```
jobpostingmatch.com/
├── server/                # Backend (Node.js/Express)
│   ├── index.js          # Main server entry point
│   ├── database/         # Database initialization & schema
│   ├── middleware/       # Authentication & validation
│   ├── routes/           # API endpoints
│   │   ├── auth.js       # Authentication routes
│   │   ├── resume.js     # Resume management
│   │   ├── job.js        # Job posting management
│   │   ├── analysis.js   # AI analysis endpoints
│   │   └── export.js     # PDF/DOCX generation
│   └── services/         # Business logic
│       ├── parser.js     # Document parsing
│       ├── linkedin.js   # LinkedIn job fetching
│       ├── ai-analyzer.js # Claude AI integration
│       ├── pdf-generator.js
│       └── docx-generator.js
├── src/                  # Frontend (React + Vite)
│   ├── components/       # React components
│   │   ├── Auth/         # Login/Register
│   │   ├── Dashboard/    # Main dashboard
│   │   ├── Resume/       # Resume upload & editor
│   │   ├── Job/          # Job input
│   │   ├── Analysis/     # Analysis results
│   │   └── Template/     # Template customizer
│   ├── context/          # React Context (Auth)
│   ├── utils/            # API client & helpers
│   └── main.jsx          # App entry point
├── package.json
├── vite.config.js
└── .env.example
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Anthropic API key ([get one here](https://console.anthropic.com/))

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd jobpostingmatch.com
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
```env
PORT=3001
ANTHROPIC_API_KEY=your-anthropic-api-key-here
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FRONTEND_URL=http://localhost:5173
```

4. **Run the application**
```bash
# Development mode (runs both frontend and backend)
npm run dev

# Or run separately:
npm run server  # Backend on port 3001
npm run client  # Frontend on port 5173
```

5. **Open in browser**
```
http://localhost:5173
```

## 📖 API Documentation

### Authentication

**POST** `/api/auth/register`
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**POST** `/api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**GET** `/api/auth/me` (requires auth token)

### Resumes

**POST** `/api/resumes/upload` (multipart/form-data)
- `resume` (file): PDF, DOCX, DOC, or TXT
- `name` (string): Resume name

**GET** `/api/resumes` - Get all user resumes

**GET** `/api/resumes/:id` - Get specific resume

**PUT** `/api/resumes/:id` - Update resume

**DELETE** `/api/resumes/:id` - Delete resume

### Jobs

**POST** `/api/jobs/fetch` - Fetch from LinkedIn URL
```json
{
  "url": "https://www.linkedin.com/jobs/view/..."
}
```

**POST** `/api/jobs` - Create from manual input
```json
{
  "title": "Senior Software Engineer",
  "company": "Tech Corp",
  "description": "Job description..."
}
```

### Analysis

**POST** `/api/analysis`
```json
{
  "resume_id": 1,
  "job_id": 1
}
```

**POST** `/api/analysis/optimize` - Generate optimized resume

### Export

**POST** `/api/export/pdf/:resume_id` (Premium only)

**POST** `/api/export/docx/:resume_id` (Premium only)

## 💰 Monetization

### Free Tier
- Upload resumes
- Add job postings
- View match score and high-level feedback
- **Limited**: Full recommendations, exports

### Premium Tier ($9-15/resume or $19/month)
- Full detailed recommendations
- Resume editing
- Unlimited PDF & DOCX exports
- Multiple resume versions
- Template customization

## 🎨 Templates

1. **Modern** - Clean, contemporary with purple accents
2. **Classic** - Traditional serif font, timeless
3. **Executive** - Sophisticated with gold accents
4. **Creative** - Gradient design with bold colors

All templates are:
- ✅ ATS-friendly (no images/tables)
- ✅ Professionally formatted
- ✅ Fully customizable (colors, fonts)
- ✅ Mobile-responsive previews

## 🔒 Security Features

- Password hashing (bcrypt)
- JWT authentication with 7-day expiration
- Rate limiting (100 requests per 15 minutes)
- Helmet.js security headers
- File upload validation
- CORS protection
- SQL injection prevention (prepared statements)

## 📊 Database Schema

**users**
- id, email, password, name, subscription_tier, subscription_expires_at, created_at, updated_at

**resumes**
- id, user_id, name, content, parsed_data, template_id, template_config, is_favorite, created_at, updated_at

**jobs**
- id, user_id, title, company, url, description, parsed_data, created_at

**analyses**
- id, user_id, resume_id, job_id, overall_score, skills_score, experience_score, keyword_score, analysis_data, created_at

**exports**
- id, user_id, resume_id, format, file_path, created_at

## 🧪 Testing the Application

### 1. Create an account
- Register with email/password
- Login to access dashboard

### 2. Upload a resume
- Click "Upload Resume"
- Choose a PDF, DOCX, or TXT file
- System will parse it automatically

### 3. Add a job posting
- Click "Add Job Posting"
- Paste LinkedIn URL OR job description
- System extracts requirements

### 4. Run analysis
- Select a resume and job from dashboard
- Click "Analyze Match"
- View detailed scores and recommendations

### 5. Optimize & export
- Click "Generate Optimized Resume"
- Edit if needed
- Choose template
- Export to PDF or DOCX (Premium)

## 🚢 Deployment

### Backend (Node.js)
- Deploy to: Heroku, Railway, Render, AWS, DigitalOcean
- Set environment variables
- Ensure SQLite file persistence or migrate to PostgreSQL

### Frontend (React)
- Build: `npm run build`
- Deploy to: Vercel, Netlify, AWS S3 + CloudFront
- Update `FRONTEND_URL` in backend .env

### Database Migration (SQLite → PostgreSQL)
```javascript
// Update database/init.js to use pg instead of better-sqlite3
import pg from 'pg';
const { Pool } = pg;

export const db = new Pool({
  connectionString: process.env.DATABASE_URL
});
```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | 3001 |
| `NODE_ENV` | Environment | development |
| `JWT_SECRET` | Secret for JWT tokens | (required) |
| `ANTHROPIC_API_KEY` | Claude API key | (required) |
| `DATABASE_PATH` | SQLite database path | ./data/resumepro.db |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5173 |
| `MAX_FILE_SIZE` | Max upload size (bytes) | 10485760 (10MB) |
| `UPLOAD_DIR` | Temporary file uploads | ./uploads |

## 🛠️ Tech Stack

**Frontend**
- React 18
- Vite
- Axios
- Context API

**Backend**
- Node.js
- Express
- Better-SQLite3 (or PostgreSQL)
- JWT
- bcryptjs
- Multer
- Helmet

**AI & Processing**
- Anthropic Claude API
- Mammoth (DOCX parsing)
- PDF-parse (PDF parsing)
- PDFKit (PDF generation)
- DOCX library (Word generation)

**Additional Tools**
- Puppeteer (LinkedIn scraping)
- Cheerio (HTML parsing)
- Axios (HTTP requests)

## 🎯 Success Metrics

- Resume upload → analysis completion rate
- Free → paid conversion
- Export completion rate
- Repeat usage for multiple jobs
- Average match score improvement

## 📝 License

MIT License - feel free to use for commercial purposes

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 📧 Support

For issues or questions, please open a GitHub issue.

---

**Built with ❤️ for job seekers everywhere**
