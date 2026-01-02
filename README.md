# AnkiFlow

> Intelligent Reading Workbench - Transform your reading workflow with AI-powered research tools.

AnkiFlow is a sophisticated reading workbench that combines RSS feeds, PDF documents, and AI assistance to help you capture, synthesize, and retain knowledge more effectively.

## 🎯 Core Features

- **Mixed-Source RAG**: Search across local knowledge base and web simultaneously
- **Persistent Staging Area**: Save articles for later synthesis across sessions
- **Anchor-Based Citations**: Generate takeaways with precise source references
- **Bidirectional Links**: Navigate between articles and synthesized notes

## 📁 Project Structure

```
AnkiFlow/
├── frontend/          # Next.js 15 + React + TypeScript + Tailwind
├── backend/           # FastAPI + SQLAlchemy + PostgreSQL + pgvector
├── doc/               # Documentation and UI references
├── specs/             # Requirements, design, and tasks
├── docker-compose.yml # Development services (PostgreSQL + pgvector)
└── .env.example       # Environment variables template
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Conda (Anaconda or Miniconda)
- Docker & Docker Compose

### 1. Clone and Configure

```bash
git clone https://github.com/your-username/AnkiFlow.git
cd AnkiFlow

# Copy environment template
cp .env.example .env
# Edit .env with your API keys and settings
```

### 2. Start Database

```bash
# Start PostgreSQL with pgvector
docker-compose up -d

# Verify it's running
docker-compose ps
```

### 3. Setup Backend (with Conda)

```bash
# Create and activate conda environment
conda create -n ankiflow python=3.11 -y
conda activate ankiflow

# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run database migrations (reads .env from root or backend/)
alembic upgrade head

# Start development server (reads .env from root or backend/)
uvicorn app.main:app --reload --port 8000
```

> **Note**: 
> - The conda environment is named `ankiflow`
> - Always activate the conda environment before working on the backend: `conda activate ankiflow`
> - The `.env` file can be placed in either the project root or the `backend/` directory
> - The application will automatically detect and load it from either location

### 4. Setup Frontend

```bash
# Open a new terminal (keep backend running)
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 5. Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- API Docs: http://localhost:8000/api/docs

## 🔄 Daily Development Workflow

```bash
# 1. Start database (if not already running)
docker-compose up -d

# 2. Start backend
conda activate ankiflow
cd backend
uvicorn app.main:app --reload --port 8000

# 3. Start frontend (in a new terminal)
cd frontend
npm run dev
```

## 🛠️ Development

### API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health check |
| `GET /api/sources` | List RSS/PDF sources |
| `POST /api/sources` | Add new source |
| `GET /api/documents` | List documents |
| `POST /api/staging` | Add to staging |
| `POST /api/takeaways` | Generate takeaway |
| `POST /api/search` | Hybrid RAG search |
| `POST /api/chat` | AI chat (streaming) |

### Tech Stack

**Frontend**
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4

**Backend**
- FastAPI
- SQLAlchemy 2.0
- PostgreSQL 16 + pgvector
- Alembic (migrations)
- Pydantic v2

**AI/ML**
- OpenAI API (embeddings + chat)
- Serper API (web search)

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.
