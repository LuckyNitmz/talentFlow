import Dexie, { Table } from 'dexie';
import { openDB } from 'idb';

// Keep your existing interfaces (Job, Candidate, Assessment, etc.)
export interface Job {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: 'active' | 'draft' | 'archived';
  tags: string[];
  location: string;
  type: string;
  department: string;
  requirements?: string[];
  responsibilities?: string[];
  salary_range?: {
    min: number;
    max: number;
    currency: string;
  };
  experience_level?: string;
  remote_allowed?: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  order: number;
  applicant_count?: number;
  is_featured?: boolean;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  job_id: string;
  stage: 'applied' | 'screen' | 'tech' | 'offer' | 'hired' | 'rejected';
  avatar?: string;
  location: string;
  experience: string;
  skills: string[];
  resume_url?: string;
  portfolio_url?: string;
  linkedin_url?: string;
  github_url?: string;
  applied_at: string;
  updated_at: string;
  notes: CandidateNote[];
  timeline: TimelineEvent[];
  rating?: number;
  salary_expectation?: {
    min: number;
    max: number;
    currency: string;
  };
}

export interface CandidateNote {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
  is_private: boolean;
}

export interface TimelineEvent {
  id: string;
  type: string;
  message: string;
  created_at: string;
  created_by: string;
  metadata?: Record<string, any>;
}

export interface Assessment {
  id: string;
  job_id: string;
  title: string;
  description?: string;
  sections: AssessmentSection[];
  is_active: boolean;
  // REMOVED: assessment_number: number;
  created_at: string;
  created_by: string;
  updated_at: string;
}


export interface AssessmentSection {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  order: number;
  required: boolean;
}

export interface Question {
  id: string;
  type: 'single_choice' | 'multi_choice' | 'short_text' | 'long_text' | 'numeric' | 'file_upload' | 'coding';
  title: string;
  description?: string;
  required: boolean;
  options?: QuestionOption[];
  validation?: QuestionValidation;
  conditional_logic?: ConditionalLogic;
  order: number;
  points?: number;
}

export interface QuestionOption {
  id: string;
  text: string;
  value: string;
  is_correct?: boolean;
}

export interface QuestionValidation {
  min_length?: number;
  max_length?: number;
  min_value?: number;
  max_value?: number;
  pattern?: string;
  required?: boolean;
}

export interface ConditionalLogic {
  show_if: {
    question_id: string;
    operator: 'equals' | 'not_equals' | 'contains';
    value: string;
  }[];
}

//Enhanced Database class
export class TalentFlowDB extends Dexie {
  jobs!: Table<Job>;
  candidates!: Table<Candidate>;
  assessments!: Table<Assessment>;

  constructor() {
    super('TalentFlowDB');
    this.version(1).stores({
      jobs: 'id, title, status, department, created_at, order, is_featured',
      candidates: 'id, name, email, job_id, stage, applied_at, updated_at',
      assessments: 'id, job_id, title, is_active, created_at'
    });
  }
}

export const db = new TalentFlowDB();

//Enhanced Database utility functions
export const dbUtils = {
  async initializeData() {
    try {
      console.log('Initializing database...');
      
      const jobCount = await db.jobs.count();
      const candidateCount = await db.candidates.count();
      
      if (jobCount === 0) {
        await this.seedJobs();
      }
      
      if (candidateCount === 0) {
        await this.seedCandidates();
      }

      const assessmentCount = await db.assessments.count();
      if (assessmentCount === 0) {
        await this.seedAssessments(); //Add this
      }
      
      console.log('Database initialized successfully');
      await this.logStats();
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  },

  // Add this method to the dbUtils object in database.ts

async updateCandidateStageWithTimeline(
  candidateId: string,
  candidateName: string,
  previousStage: string,
  newStage: Candidate['stage'],
  previousStageTitle: string,
  newStageTitle: string
): Promise<Candidate | null> {
  try {
    const candidate = await db.candidates.get(candidateId);
    if (!candidate) {
      throw new Error('Candidate not found');
    }

    // Create timeline entry
    const timelineEntry: TimelineEvent = {
      id: `timeline-${Date.now()}`,
      type: 'stage_change',
      message: `${candidateName} moved from ${previousStageTitle} to ${newStageTitle}`,
      created_at: new Date().toISOString(),
      created_by: 'By HR',
      metadata: {
        previousStage,
        newStage,
        previousStageTitle,
        newStageTitle
      }
    };

    // Update candidate with new stage and timeline entry
    const updatedData = {
      stage: newStage,
      updated_at: new Date().toISOString(),
      timeline: [...candidate.timeline, timelineEntry]
    };

    await db.candidates.update(candidateId, updatedData);
    const updatedCandidate = await db.candidates.get(candidateId);
    
    console.log('Candidate stage updated with timeline:', candidateId);
    return updatedCandidate || null;
  } catch (error) {
    console.error('Error updating candidate stage with timeline:', error);
    throw error;
  }
},


  async seedAssessments() {
  try {
    const assessmentsModule = await import('@/data/assessments.json');
    const assessments = assessmentsModule.default;
    
    const enhancedAssessments = assessments.map((assessment: any) => ({
      ...assessment,
      created_at: assessment.created_at || new Date().toISOString(),
      updated_at: assessment.updated_at || new Date().toISOString(),
    }));
    
    await db.assessments.bulkAdd(enhancedAssessments);
    console.log(`Seeded ${enhancedAssessments.length} assessments`);
  } catch (error) {
    console.error('Failed to seed assessments:', error);
  }
},

  async seedJobs() {
    try {
      // Import jobs data from JSON
      const jobsModule = await import('@/data/jobs.json');
      const jobs = jobsModule.default;
      
      const enhancedJobs = jobs.map((job: any) => ({
        ...job,
        created_at: job.createdAt || new Date().toISOString(),
        updated_at: job.updatedAt || new Date().toISOString(),
        applicant_count: 0,
        is_featured: false,
        requirements: job.requirements || [],
        responsibilities: job.responsibilities || [],
        tags: job.tags || []
      }));
      
      await db.jobs.bulkAdd(enhancedJobs);
      console.log(`Seeded ${enhancedJobs.length} jobs`);
    } catch (error) {
      console.error('Failed to seed jobs:', error);
    }
  },

  async seedCandidates() {
    try {
      //Import candidates data from JSON
      const candidatesModule = await import('@/data/candidates.json');  
      const candidates = candidatesModule.default;
      
      const enhancedCandidates = candidates.map((candidate: any) => ({
        ...candidate,
        job_id: candidate.jobId || candidate.job_id,
        applied_at: candidate.appliedAt || candidate.applied_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        notes: candidate.notes?.map((note: any) => ({
          ...note,
          created_at: note.createdAt || note.created_at,
          created_by: note.createdBy || note.created_by
        })) || [],
        timeline: candidate.timeline?.map((event: any) => ({
          ...event,
          created_at: event.createdAt || event.created_at,
          created_by: event.createdBy || event.created_by
        })) || [],
        skills: candidate.skills || []
      }));
      
      await db.candidates.bulkAdd(enhancedCandidates);
      console.log(`Seeded ${enhancedCandidates.length} candidates`);
    } catch (error) {
      console.error('Failed to seed candidates:', error);
    }
  },

  // CRUD Operations for Jobs
  async createJob(jobData: Partial<Job>): Promise<Job> {
    const newJob: Job = {
      id: `job-${Date.now()}`,
      title: jobData.title || '',
      slug: jobData.slug || jobData.title?.toLowerCase().replace(/\s+/g, '-') || '',
      description: jobData.description || '',
      status: jobData.status || 'draft',
      tags: jobData.tags || [],
      location: jobData.location || '',
      type: jobData.type || 'Full-time',
      department: jobData.department || '',
      requirements: jobData.requirements || [],
      responsibilities: jobData.responsibilities || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'current-user@company.com',
      order: await db.jobs.count() + 1,
      applicant_count: 0,
      is_featured: false,
      ...jobData
    };

    await db.jobs.add(newJob);
    console.log('Job created:', newJob.id);
    return newJob;
  },

  async updateJob(id: string, updates: Partial<Job>): Promise<Job | null> {
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    await db.jobs.update(id, updatedData);
    const updatedJob = await db.jobs.get(id);
    console.log('Job updated:', id);
    return updatedJob || null;
  },

  async deleteJob(id: string): Promise<boolean> {
    await db.jobs.delete(id);
    console.log('Job deleted:', id);
    return true;
  },

  async getJob(id: string): Promise<Job | null> {
    const job = await db.jobs.get(id);
    return job || null;
  },

  async getAllJobs(filters: {
    search?: string;
    status?: string;
    department?: string;
  } = {}): Promise<Job[]> {
    let query = db.jobs.toCollection();

    if (filters.search) {
      query = query.filter(job => 
        job.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
        job.description.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

    if (filters.status && filters.status !== 'all') {
      query = query.filter(job => job.status === filters.status);
    }

    if (filters.department) {
      query = query.filter(job => job.department === filters.department);
    }

    return await query.sortBy('order');
  },

  // CRUD Operations for Candidates
  async createCandidate(candidateData: Partial<Candidate>): Promise<Candidate> {
    const newCandidate: Candidate = {
      id: `candidate-${Date.now()}`,
      name: candidateData.name || '',
      email: candidateData.email || '',
      phone: candidateData.phone || '',
      job_id: candidateData.job_id || '',
      stage: candidateData.stage || 'applied',
      location: candidateData.location || '',
      experience: candidateData.experience || '',
      skills: candidateData.skills || [],
      applied_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      notes: [],
      timeline: [{
        id: `timeline-${Date.now()}`,
        type: 'applied',
        message: `${candidateData.name} Applied for position ${candidateData.stage}`,
        created_at: new Date().toISOString(),
        created_by: 'system'
      }],
      ...candidateData
    };

    await db.candidates.add(newCandidate);
    console.log('Candidate created:', newCandidate.id);
    return newCandidate;
  },

  async updateCandidate(id: string, updates: Partial<Candidate>): Promise<Candidate | null> {
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    await db.candidates.update(id, updatedData);
    const updatedCandidate = await db.candidates.get(id);
    console.log('Candidate updated:', id);
    return updatedCandidate || null;
  },

  async deleteCandidate(id: string): Promise<boolean> {
    await db.candidates.delete(id);
    console.log('Candidate deleted:', id);
    return true;
  },

  async getCandidate(id: string): Promise<Candidate | null> {
    const candidate = await db.candidates.get(id);
    return candidate || null;
  },

  async getAllCandidates(filters: {
    search?: string;
    stage?: string;
    job_id?: string;
  } = {}): Promise<Candidate[]> {
    let query = db.candidates.toCollection();

    if (filters.search) {
      query = query.filter(candidate => 
        candidate.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
        candidate.email.toLowerCase().includes(filters.search!.toLowerCase()) ||
        candidate.skills.some(skill => skill.toLowerCase().includes(filters.search!.toLowerCase()))
      );
    }

    if (filters.stage && filters.stage !== 'all') {
      query = query.filter(candidate => candidate.stage === filters.stage);
    }

    if (filters.job_id) {
      query = query.filter(candidate => candidate.job_id === filters.job_id);
    }

    return await query.sortBy('applied_at');
  },

  async addCandidateNote(candidateId: string, noteData: {
    content: string;
    is_private: boolean;
    created_by: string;
  }): Promise<CandidateNote> {
    const candidate = await db.candidates.get(candidateId);
    if (!candidate) throw new Error('Candidate not found');

    const newNote: CandidateNote = {
      id: `note-${Date.now()}`,
      content: noteData.content,
      created_at: new Date().toISOString(),
      created_by: noteData.created_by,
      is_private: noteData.is_private
    };

    candidate.notes.push(newNote);
    await db.candidates.update(candidateId, { notes: candidate.notes });

    console.log('Note added to candidate:', candidateId);
    return newNote;
  },

// FIXED: Use put() instead of add() for upsert behavior
async createAssessment(assessmentData: Omit<Assessment, 'created_at' | 'updated_at'>): Promise<Assessment> {
  try {
    // CRITICAL: Validate job_id is present
    if (!assessmentData.job_id) {
      throw new Error('job_id is required when creating assessment');
    }

    const now = new Date().toISOString();
    const assessment: Assessment = {
      ...assessmentData,
      job_id: assessmentData.job_id,
      created_at:  now, // Preserve existing created_at if updating
      updated_at: now,
    };
    
    console.log('Saving assessment to IndexedDB via Dexie:', assessment);
    
    // FIXED: Use put() instead of add() - this handles both create and update
    await db.assessments.put(assessment);
    
    console.log('Assessment saved with job_id:', assessment.job_id);
    return assessment;
  } catch (error) {
    console.error('Error creating assessment:', error);
    throw error;
  }
},

// FIXED: Simplified update method
async updateAssessment(id: string, updates: Partial<Assessment>): Promise<Assessment | null> {
  try {
    //Get existing record first
    const existing = await db.assessments.get(id);
    if (!existing) {
      console.log('Assessment not found for update:', id);
      return null;
    }
    
    const updated: Assessment = {
      ...existing,
      ...updates,
      job_id: existing.job_id, //Preserve original job_id
      created_at: existing.created_at, //Preserve original created_at
      updated_at: new Date().toISOString(),
    };
    
    console.log('💾 Updating assessment with job_id:', updated.job_id);
    
    // Use put() for upsert
    await db.assessments.put(updated);
    
    console.log('Assessment updated with job_id preserved:', updated.job_id);
    return updated;
  } catch (error) {
    console.error('Error updating assessment:', error);
    throw error;
  }
},


//Keep existing methods as they already use Dexie
async deleteAssessment(id: string): Promise<boolean> {
  await db.assessments.delete(id);
  console.log('Assessment deleted:', id);
  return true;
},

async getAssessment(id: string): Promise<Assessment | null> {
  const assessment = await db.assessments.get(id);
  return assessment || null;
},

// CHANGED: Get single assessment by job ID (main method)
async getAssessmentByJobId(jobId: string): Promise<Assessment | null> {
  const assessments = await db.assessments
    .where('job_id')
    .equals(jobId)
    .toArray();
  return assessments[0] || null; // Return first (and only) assessment
},

async getAllAssessments(): Promise<Assessment[]> {
  return await db.assessments.orderBy('created_at').toArray();
},


//REMOVED: getAssessmentsByJobId - no longer needed since single assessment only
// Old method that returned multiple assessments is no longer needed

// DEPRECATED: Keep for backward compatibility but mark as deprecated
async getAssessmentByJobIdAndNumber(jobId: string, assessmentNumber: number): Promise<Assessment | null> {
  console.warn('getAssessmentByJobIdAndNumber is deprecated. Use getAssessmentByJobId instead.');
  // Since we only have one assessment per job now, ignore the number
  return this.getAssessmentByJobId(jobId);
},

//NEW: Get assessments with job details (useful for admin views)
async getAssessmentsWithJobDetails(): Promise<(Assessment & { job?: any })[]> {
  const assessments = await this.getAllAssessments();
  const assessmentsWithJobs = await Promise.all(
    assessments.map(async (assessment) => {
      const job = await this.getJob(assessment.job_id);
      return { ...assessment, job };
    })
  );
  return assessmentsWithJobs;
},

// NEW: Check if job has assessment
async jobHasAssessment(jobId: string): Promise<boolean> {
  const assessment = await this.getAssessmentByJobId(jobId);
  return assessment !== null;
},

// NEW: Get jobs without assessments
async getJobsWithoutAssessments(): Promise<Job[]> {
  const allJobs = await this.getAllJobs();
  const jobsWithoutAssessments = [];
  
  for (const job of allJobs) {
    const hasAssessment = await this.jobHasAssessment(job.id);
    if (!hasAssessment) {
      jobsWithoutAssessments.push(job);
    }
  }
  
  return jobsWithoutAssessments;
},

// Utility functions
async clearAllData() {
  await db.transaction('rw', [db.jobs, db.candidates, db.assessments], () => {
    db.jobs.clear();
    db.candidates.clear();
    db.assessments.clear();
  });
  console.log('All data cleared');
},

async getStats() {
  const [jobCount, candidateCount, assessmentCount] = await Promise.all([
    db.jobs.count(),
    db.candidates.count(),
    db.assessments.count()
  ]);

  // NEW: Calculate jobs with/without assessments
  const jobsWithAssessments = await this.getAllAssessments();
  const jobsWithoutAssessments = await this.getJobsWithoutAssessments();

  return {
    jobs: jobCount,
    candidates: candidateCount,
    assessments: assessmentCount,
    jobsWithAssessments: jobsWithAssessments.length,
    jobsWithoutAssessments: jobsWithoutAssessments.length,
    assessmentCoverage: jobCount > 0 ? Math.round((jobsWithAssessments.length / jobCount) * 100) : 0
  };
},

async logStats() {
  const stats = await this.getStats();
  console.log('Database Stats:', stats);
},
}



