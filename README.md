##StudyBud

## Overview

StudyBud is an AI-powered learning workspace that helps students learn from their own study material.

Upload notes, PDFs, presentations, images, or other study resources and turn them into structured explanations, concepts, takeaways and quizzes.

> Don't just summarize. Learn it.

## Problem Statement

Students have study material scattered across PDFs, notes, presentations and images. Getting a summary is easy, but actually understanding, revising and testing yourself from that material is still difficult.

## Solution

StudyBud turns your own study material into an interactive learning space.

Students can choose how they want to learn, explore concepts, ask questions through Ask Bud, and generate quizzes from the same source material.

## Features

- AI-powered learning workspace
- PDF, DOCX, PPTX, XLSX, TXT and Markdown support
- Image understanding
- Multiple source learning
- Explain, Quiz, Summarize, Research and Ask modes
- Exam-ready and step-by-step learning strategies
- Source-grounded explanations
- Ask Bud for follow-up questions
- AI-generated quizzes
- Responsive desktop and mobile UI

## Tech Stack

Frontend:
- Next.js 14
- React
- TypeScript
- Tailwind CSS

Backend:
- Next.js API Routes
- Node.js

AI:
- OpenAI API
- OpenAI Responses API

Deployment:
- Vercel

Other:
- GitHub
- Codex
- Google Stitch

## Codex / OpenAI Usage

Codex was used throughout the hackathon for development, UI implementation, debugging, testing, API integration and deployment preparation.

OpenAI powers the main learning features including source analysis, learning content, quizzes, image understanding and Ask Bud.

## Demo

### Live Demo

https://study-bud-rose.vercel.app/

### Demo Video

https://drive.google.com/file/d/12zU9hlF3-eIVhAnqX2rN58LH9XfArQFX/view?usp=sharing

### Screenshots

https://drive.google.com/drive/folders/1msoTELr4Re8v9MstI1StT6PFlHEgoYAL?usp=sharing

## How to Run Locally

```bash
git clone https://github.com/gautham210/StudyBud.git
cd StudyBud
npm install

Create .env.local:

OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
AI_PROVIDER=openai

Run:

npm run dev

Open:

http://localhost:3000
Additional Notes

StudyBud was built as a hackathon project focused on making AI learning more useful than simple summarization.

Current limitations include no persistent cloud study accounts and no direct YouTube transcript ingestion.
