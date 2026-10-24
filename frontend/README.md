# DocuRisk AI — Frontend Application

> **Next.js 16 Web Application**  
> An enterprise-grade, high-performance legal engineering user interface for contract ingestion, risk inspection, and version diff redlining.

---

## 🏗️ Architecture & Features

- **Framework**: Next.js 16 (App Router + Turbopack)
- **Language**: TypeScript (Strict typing enabled)
- **Styling**: Tailwind CSS v4 (Slate & Teal design system)
- **Icons**: Lucide React
- **Service Layer**: Decoupled service abstraction (`src/services/documentService.ts`) with seamless mock-to-API fallback.

### Pages & Routes
- `/` — Centralized Compliance & Risk Audit Dashboard
- `/upload` — Interactive Document Ingestion & Pipeline Simulation
- `/documents/[id]` — Detailed Risk Analysis & Evidence Inspector
- `/compare` — Clause-by-Clause Contract Version Diff Redline

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧪 Quality & Build Commands

```bash
# Typecheck without emitting files
npx tsc --noEmit

# Run ESLint checks
npm run lint

# Generate production build
npm run build

# Start production server
npm run start
```
