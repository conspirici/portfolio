# Mansoor Syed — Portfolio

A modern, high-performance personal portfolio and CMS built with Next.js and FastAPI.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React, Tailwind CSS, Framer Motion
- **Backend:** FastAPI, PostgreSQL (Neon), SQLAlchemy, Firebase Admin
- **Storage:** Cloudflare R2
- **Authentication:** Firebase Auth

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL database

### Installation

1. Install frontend dependencies:
\`\`\`bash
cd portfolio
npm install
\`\`\`

2. Install backend dependencies:
\`\`\`bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
pip install -r requirements.txt
\`\`\`

3. Configure Environment Variables:
Copy `.env.example` to `.env` in both the `portfolio` and `backend` directories and fill in your keys.

### Running Locally

Start the backend API:
\`\`\`bash
cd backend
uvicorn app.main:app --reload
\`\`\`

Start the frontend:
\`\`\`bash
cd portfolio
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the site.
