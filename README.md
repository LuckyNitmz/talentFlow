# TalentFlow - Mini Hiring Platform

A comprehensive React application for managing HR operations including job postings, candidate management, and assessment creation. Built as a technical assignment demonstrating modern frontend development practices with React, TypeScript, and state management.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Core Flows](#core-flows)
- [Technical Decisions](#technical-decisions)
- [Known Issues & Limitations](#known-issues--limitations)
- [Deployment](#deployment)

## 🎯 Project Overview

TalentFlow is a frontend-only application simulating a complete hiring platform. It enables HR teams to manage three core entities:

1. **Jobs** - Create, edit, archive, and reorder job postings
2. **Candidates** - Track applicants through recruitment stages
3. **Assessments** - Build and manage job-specific evaluation forms

The application uses a simulated backend with MSW (Mock Service Worker) and local IndexedDB persistence to demonstrate real-world application patterns without requiring a server.

## ✨ Features

### 📋 Jobs Management
- **Server-like pagination & filtering** by title, status, and tags
- **Create/Edit jobs** with modal-based forms and validation
- **Archive/Unarchive** functionality with status management
- **Drag-and-drop reordering** with optimistic updates and rollback on failure
- **Deep linking** to individual jobs (`/jobs/:jobId`)
- **Job statistics** and applicant tracking

### 👥 Candidates Management
- **Virtualized list** supporting 1000+ candidates with optimal performance
- **Server-like filtering** by recruitment stage
- **Individual candidate profiles** (`/candidates/:id`) with timeline tracking
- **Kanban board** with drag-and-drop stage transitions
- **Notes system** with @mentions support
- **Timeline tracking** for all candidate activities

### 📝 Assessments
- **Assessment builder** with multiple question types:
  - Single-choice questions
  - Multi-choice questions
  - Text base question
- **Live preview pane** showing real-time form rendering
- **Conditional logic** for showing/hiding questions based on responses
- **Local persistence** of both builder state and candidate responses

## 🛠 Tech Stack

### Core Framework
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **React Router DOM** for client-side routing

### State Management
- **Redux Toolkit** for global state management
- **React Query** for server state and caching
- **React Hook Form** for form management with Zod validation

### UI Components
- **Radix UI** primitives for accessible components
- **Tailwind CSS** for utility-first styling
- **Shadcn/ui** component library for consistent design
- **Lucide React** for icons

### Data & API Simulation
- **MSW (Mock Service Worker)** for API mocking
- **Dexie** (IndexedDB wrapper) for client-side persistence
- **Artificial latency** (200-1200ms) and error rates (5-10%) for realistic testing

### Specialized Libraries
- **React Beautiful DND** for drag-and-drop functionality
- **React Window** for virtualization of large lists
- **Date-fns** for date manipulation
- **Sonner** for toast notifications

## 🏗 Architecture

```
src/
├── components/          # Reusable UI components
│   ├── KanbanBoard.tsx  # Drag-and-drop candidate management
│   ├── Navigation.tsx   # App navigation
│   └── Pagination.tsx   # Pagination component
├── data/                # Seed data files
│   ├── jobs.json        # 25 sample jobs
│   ├── candidates.json  # 1000+ sample candidates
│   └── assessments.json # Pre-built assessment templates
├── features/            # Feature-based Redux slices
│   ├── jobs/            # Jobs state management
│   ├── candidates/      # Candidates state management
│   └── assessments/     # Assessments state management
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
│   ├── database.ts      # IndexedDB operations via Dexie
│   └── utils.ts         # General utilities
├── mocks/               # MSW configuration
│   ├── handlers.ts      # API route handlers
│   └── browser.ts       # MSW setup
├── pages/               # Route components
│   ├── JobsPage.tsx
│   ├── JobDetailsPage.tsx
│   ├── CandidatesPage.tsx
│   ├── CandidateDetailsPage.tsx
│   └── AssessmentBuilderPage.tsx
└── services/            # API service layers
    ├── jobsApi.ts
    ├── candidatesApi.ts
    └── assessmentsApi.ts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16.0 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd talentFlow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open the application**
   Navigate to `http://localhost:8080` in your browser

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run build:dev    # Build in development mode
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🔄 Core Flows

### 1. Jobs Board Flow
1. Navigate to `/jobs` to view paginated job listings
2. Use search and filters to find specific jobs
3. Click "Create Job" to add new positions
4. Edit jobs inline or via detailed forms
5. Drag-and-drop to reorder job priority
6. Archive completed or cancelled positions

### 2. Candidate Management Flow
1. Navigate to `/candidates` for the virtualized candidate list
2. Search candidates by name/email or filter by stage
3. Access individual profiles via `/candidates/:id`
4. View candidate timeline and add notes with @mentions
5. Use the Kanban board to move candidates between stages
6. Track all activities in the candidate timeline

### 3. Assessment Building Flow
1. Navigate to `/assessments/:jobId` for a specific job
2. Add sections and organize questions by topic
3. Choose from 6 question types with appropriate validation
4. Set up conditional logic for dynamic forms
5. Use the live preview to test the candidate experience
6. Save and activate assessments for candidate use

## 🎯 Technical Decisions

### State Management
- **Redux Toolkit** for complex global state (jobs, candidates, assessments)
- **React Query** for server state management and caching
- **Local component state** for UI-specific interactions

### Performance Optimizations
- **React Window** for virtualizing 1000+ candidate lists
- **Memoization** with React.memo and useMemo for expensive operations
- **Code splitting** with React.lazy for route-based chunks
- **Optimistic updates** with rollback for better UX

### Form Management
- **React Hook Form** for performant form handling
- **Zod schemas** for runtime validation
- **Controlled components** for complex form interactions

### UI/UX Decisions
- **Consistent design system** using Radix UI and Tailwind
- **Accessible components** with ARIA labels and keyboard navigation
- **Responsive design** supporting mobile and desktop
- **Loading states** and error boundaries for robust UX

### Data Architecture
- **Normalized state** to prevent data duplication
- **Optimistic updates** for immediate feedback
- **Error handling** with graceful degradation
- **Type safety** throughout the application

## ⚠️ Known Issues & Limitations

### Current Limitations
1. **File upload**: Only provides placeholder functionality
2. **Real-time collaboration**: No WebSocket implementation
3. **Advanced filtering**: Limited to basic search/filter options
4. **Email notifications**: Simulated only
5. **User authentication**: Not implemented (single-user assumption)

### Browser Compatibility
- Modern browsers with IndexedDB support
- Service Worker support required for MSW
- ES2018+ JavaScript features used

### Performance Considerations
- Large datasets (1000+ candidates) may impact initial load
- MSW adds overhead in development but not production
- IndexedDB operations are asynchronous and can block UI briefly

## 🚀 Deployment

### Vercel (Recommended)
The application is configured for Vercel deployment:

1. **Connect repository** to Vercel
2. **Deploy automatically** - no additional configuration needed
3. **Environment**: Static site with client-side routing support

### Manual Deployment
```bash
npm run build
# Deploy contents of 'dist' folder to any static hosting service
```

### Environment Configuration
- No environment variables required
- All configuration is build-time
- MSW worker properly configured for production

## 📦 Seed Data
- **25 jobs** (active, archived, draft, paused)  
- **1000 candidates** randomly assigned to jobs & stages  
- **5 assessments** with 10+ questions each  

---

# Explain the modification later 