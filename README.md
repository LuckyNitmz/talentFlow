# TALENTFLOW – A Mini Hiring Platform

A React-based application that allows an HR team to manage jobs, candidates, and assessments.  
This project was implemented as part of the **React Technical Assignment**.

---

## ✨ Features

### 1. Jobs
- Create, edit, archive, unarchive jobs  
- Validation (title required, unique slug)  
- Drag-and-drop reordering with optimistic UI updates + rollback on failure  
- Filter & paginate (server-like simulation)  
- Deep links: `/jobs/:jobId`

### 2. Candidates
- Virtualized list (scales to 1000+ seeded candidates)  
- Search (name/email) + stage filters  
- Candidate profile route with full timeline: `/candidates/:id`  
- Kanban board for stage transitions (drag-and-drop)  
- Add notes with **@mentions**

### 3. Assessments
- Assessment builder per job  
- Question types: single choice, multi-choice, short/long text, numeric with range, file upload (stub)  
- Live preview of the assessment form  
- Candidate response storage with validation & conditional logic  
- All data persisted locally (IndexedDB)

---

## 🗂 Data & API Simulation

- **MSW/MirageJS** simulates REST APIs with artificial latency (200–1200ms) & error rate (5–10%)  
- Persistence via **IndexedDB (Dexie)**  
- On refresh, state restores from IndexedDB  

**Endpoints simulated:**
- `GET /jobs`, `POST /jobs`, `PATCH /jobs/:id`, `PATCH /jobs/:id/reorder`  
- `GET /candidates`, `POST /candidates`, `PATCH /candidates/:id`  
- `GET /candidates/:id/timeline`  
- `GET /assessments/:jobId`, `PUT /assessments/:jobId`, `POST /assessments/:jobId/submit`

---

## 📦 Seed Data
- **25 jobs** (active, archived, draft, paused)  
- **1000 candidates** randomly assigned to jobs & stages  
- **3+ assessments** with 10+ questions each  

---

## 🚀 Getting Started

### Local Development
```sh
# Clone the repo
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Run dev server
npm run dev


# Explain the modification later 