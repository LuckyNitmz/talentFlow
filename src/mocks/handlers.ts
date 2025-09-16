// import { http, HttpResponse } from 'msw';
// import { db, dbUtils, Candidate } from '../lib/database';
// import { Assessment } from '../lib/database';

// export const handlers = [

//   http.patch('/api/jobs/reorder', async ({ request }) => {
//     console.log('🔍 MSW: Intercepted PATCH /api/jobs/reorder');
//     try {
//       const { jobIds } = await request.json() as { jobIds: string[] };
//       console.log('🔄 Reordering jobs:', jobIds);
      
//       let min = Number.MAX_SAFE_INTEGER;
//       for (let i = 0; i < jobIds.length; i++) {
//         const existingJob = await db.jobs.get(jobIds[i]);
//         const oldOrder = existingJob ? existingJob.order : 0;
//         min = Math.min(oldOrder, min);
//       }
      
//       for (let i = 0; i < jobIds.length; i++) {
//         await dbUtils.updateJob(jobIds[i], { order: min + i });
//       }
      
//       console.log('✅ Jobs reordered in IndexedDB');
//       return HttpResponse.json({ success: true, data: jobIds });
//     } catch (error) {
//       console.error('❌ Job reorder error:', error);
//       return HttpResponse.json({ success: false, error: 'Failed to reorder jobs' }, { status: 500 });
//     }
//   }),

//   /* ---------------------- JOBS ---------------------- */
//   http.get('/api/jobs', async ({ request }) => {
//     console.log('🔍 MSW: Intercepted GET /api/jobs');
    
//     const url = new URL(request.url);
//     const search = url.searchParams.get('search') ?? '';
//     const status = url.searchParams.get('status');
//     const page = parseInt(url.searchParams.get('page') ?? '1', 10);
//     const pageSize = parseInt(url.searchParams.get('pageSize') ?? '10', 10);

//     try {
//       // ✅ Query IndexedDB using dbUtils
//       const allJobs = await dbUtils.getAllJobs({
//         search: search || undefined,
//         status: status && status !== 'all' ? status : undefined
//       });
      
//       // Apply pagination
//       const totalItems = allJobs.length;
//       const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
//       const start = (page - 1) * pageSize;
//       const paginatedJobs = allJobs.slice(start, start + pageSize);

//       const responseData = {
//         success: true,
//         data: {
//           jobs: paginatedJobs,
//           pagination: {
//             current_page: page,
//             page_size: pageSize,
//             total_items: totalItems,
//             total_pages: totalPages,
//             has_next: page < totalPages,
//             has_prev: page > 1,
//           },
//         },
//         timestamp: new Date().toISOString(),
//       };

//       console.log('✅ MSW: Returning', paginatedJobs.length, 'jobs from IndexedDB');
//       return HttpResponse.json(responseData, { status: 200 });
//     } catch (error) {
//       console.error('❌ MSW Jobs Error:', error);
//       return HttpResponse.json({ success: false, error: 'Database error' }, { status: 500 });
//     }
//   }),

//   // ✅ GET single job
//   http.get('/api/jobs/:id', async ({ params }) => {
//     console.log('🔍 MSW: Intercepted GET /api/jobs/' + params.id);
    
//     try {
//       const job = await dbUtils.getJob(params.id as string);
      
//       if (!job) {
//         return HttpResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
//       }

//       return HttpResponse.json({ success: true, data: job });
//     } catch (error) {
//       return HttpResponse.json({ success: false, error: 'Database error' }, { status: 500 });
//     }
//   }),

//   // ✅ CREATE job - FIXED
//   http.post('/api/jobs', async ({ request }) => {
//     console.log('🔍 MSW: Intercepted POST /api/jobs');
    
//     try {
//       const jobData = await request.json() as any;
//       console.log('📝 Creating job with data:', jobData);
      
//       // ✅ Use dbUtils to create job in IndexedDB
//       const newJob = await dbUtils.createJob({
//         ...jobData,
//         id: `job-${Date.now()}`, // ✅ Generate unique ID
//       });
      
//       console.log('✅ Job created in IndexedDB:', newJob.id);
//       return HttpResponse.json({ success: true, data: newJob }, { status: 201 });
//     } catch (error) {
//       console.error('❌ Job creation error:', error);
//       return HttpResponse.json({ success: false, error: 'Failed to create job' }, { status: 500 });
//     }
//   }),

//   // ✅ UPDATE job - FIXED  
//   http.patch('/api/jobs/:id', async ({ request, params }) => {
//     console.log('🔍 MSW: Intercepted PATCH /api/jobs/' + params.id);
    
//     try {
//       const updates = await request.json() as any;
//       console.log('📝 Updating job with:', updates);
      
//       // ✅ Use dbUtils to update job in IndexedDB
//       const updatedJob = await dbUtils.updateJob(params.id as string, updates);
      
//       if (!updatedJob) {
//         return HttpResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
//       }

//       console.log('✅ Job updated in IndexedDB:', updatedJob.id);
//       return HttpResponse.json({ success: true, data: updatedJob });
//     } catch (error) {
//       console.error('❌ Job update error:', error);
//       return HttpResponse.json({ success: false, error: 'Failed to update job' }, { status: 500 });
//     }
//   }),

//   // ✅ DELETE job - FIXED
//   http.delete('/api/jobs/:id', async ({ params }) => {
//     console.log('🔍 MSW: Intercepted DELETE /api/jobs/' + params.id);
    
//     try {
//       // ✅ Use dbUtils to delete from IndexedDB
//       await dbUtils.deleteJob(params.id as string);
      
//       console.log('✅ Job deleted from IndexedDB:', params.id);
//       return HttpResponse.json({ success: true, message: 'Job deleted' });
//     } catch (error) {
//       console.error('❌ Job deletion error:', error);
//       return HttpResponse.json({ success: false, error: 'Failed to delete job' }, { status: 500 });
//     }
//   }),


//   /* ------------------ CANDIDATES ------------------ */
//   http.get('/api/candidates', async ({ request }) => {
//     console.log('🔍 MSW: Intercepted GET /api/candidates');
    
//     const url = new URL(request.url);
//     const search = url.searchParams.get('search') ?? '';
//     const stage = url.searchParams.get('stage') ?? 'all';
//     const job_id = url.searchParams.get('job_id') ?? '';
//     const page = parseInt(url.searchParams.get('page') ?? '1', 10);
//     const pageSize = parseInt(url.searchParams.get('pageSize') ?? '10', 10);

//     try {
//       const allCandidates = await dbUtils.getAllCandidates({
//         search: search || undefined,
//         stage: stage !== 'all' ? stage : undefined,
//         job_id: job_id || undefined
//       });
      
//       const totalItems = allCandidates.length;
//       const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
//       const start = (page - 1) * pageSize;
//       const paginatedCandidates = allCandidates.slice(start, start + pageSize);

//       const responseData = {
//         success: true,
//         data: {
//           candidates: paginatedCandidates,
//           pagination: {
//             current_page: page,
//             page_size: pageSize,
//             total_items: totalItems,
//             total_pages: totalPages,
//             has_next: page < totalPages,
//             has_prev: page > 1,
//           },
//         },
//         timestamp: new Date().toISOString(),
//       };

//       console.log('✅ MSW: Returning', paginatedCandidates.length, 'candidates');
//       return HttpResponse.json(responseData, { status: 200 });
//     } catch (error) {
//       console.error('❌ MSW Candidates Error:', error);
//       return HttpResponse.json({ success: false, error: 'Database error' }, { status: 500 });
//     }
//   }),

//   // ✅ Other candidate endpoints...
//   http.get('/api/candidates/:id', async ({ params }) => {
//     try {
//       const candidate = await dbUtils.getCandidate(params.id as string);
//       if (!candidate) {
//         return HttpResponse.json({ success: false, error: 'Candidate not found' }, { status: 404 });
//       }
//       return HttpResponse.json({ success: true, data: candidate });
//     } catch (error) {
//       return HttpResponse.json({ success: false, error: 'Database error' }, { status: 500 });
//     }
//   }),

//   // ✅ ADD: Type-safe PATCH handler for updating candidates
//   http.patch('/api/candidates/:id', async ({ request, params }) => {
//     console.log('🔍 MSW: Intercepted PATCH /api/candidates/' + params.id);
    
//     try {
//       // ✅ Type-safe way to handle request body
//       const updates = await request.json() as Partial<Candidate>;
//       console.log('📝 Updating candidate with:', updates);
      
//       // Validate that we have a valid update object
//       if (!updates || typeof updates !== 'object') {
//         return HttpResponse.json({
//           success: false,
//           error: 'Invalid update payload'
//         }, { status: 400 });
//       }
      
//       // Use dbUtils to update candidate in IndexedDB
//       const updatedCandidate = await dbUtils.updateCandidate(params.id as string, updates);
      
//       if (!updatedCandidate) {
//         return HttpResponse.json({
//           success: false,
//           error: 'Candidate not found'
//         }, { status: 404 });
//       }

//       console.log('✅ Candidate updated in IndexedDB:', updatedCandidate.id);
//       return HttpResponse.json({ success: true, data: updatedCandidate });
//     } catch (error) {
//       console.error('❌ Candidate update error:', error);
//       return HttpResponse.json({
//         success: false,
//         error: 'Failed to update candidate'
//       }, { status: 500 });
//     }
//   }),

//   http.post('/api/candidates/:id/notes', async ({ params, request }) => {
//   const candidateId = params.id
//   if (!candidateId) {
//     return HttpResponse.json(
//       { success: false, error: 'Candidate ID is missing' },
//       { status: 400 }
//     );
//   }
//   const id = candidateId  as string;
//   const { content, is_private } = (await request.json()) as { content: string; is_private: boolean };

//   console.log(`MSW: Adding note for candidate ${id}`, { content, is_private });

//   // Use the pre-made function to persist the note in IndexedDB
//   const newNote = await dbUtils.addCandidateNote(id, {
//     content,
//     is_private,
//     created_by: 'hr@Company',
//   });

//   return HttpResponse.json(
//     {
//       success: true,
//       data: newNote,
//     },
//     { status: 201 }
//   );
// }),

// // Add this handler to the handlers array in handlers.ts

// // ✅ NEW: Update candidate stage with timeline
// http.patch('/api/candidates/:id/stage', async ({ request, params }) => {
//   console.log('🔍 MSW: Intercepted PATCH /api/candidates/' + params.id + '/stage');
//   try {
//     const {
//       candidateName,
//       previousStage,
//       newStage,
//       previousStageTitle,
//       newStageTitle
//     } = await request.json() as {
//       candidateName: string;
//       previousStage: string;
//       newStage: string;
//       previousStageTitle: string;
//       newStageTitle: string;
//     };

//     console.log('📝 Updating candidate stage with timeline:', {
//       candidateId: params.id,
//       candidateName,
//       previousStage,
//       newStage,
//       previousStageTitle,
//       newStageTitle
//     });

//     // Use the new dbUtils method
//     const updatedCandidate = await dbUtils.updateCandidateStageWithTimeline(
//       params.id as string,
//       candidateName,
//       previousStage,
//       newStage as Candidate['stage'],
//       previousStageTitle,
//       newStageTitle
//     );

//     if (!updatedCandidate) {
//       return HttpResponse.json({
//         success: false,
//         error: 'Candidate not found'
//       }, { status: 404 });
//     }

//     console.log('✅ Candidate stage updated with timeline in IndexedDB:', updatedCandidate.id);
//     return HttpResponse.json({ success: true, data: updatedCandidate });
//   } catch (error) {
//     console.error('❌ Candidate stage update with timeline error:', error);
//     return HttpResponse.json({
//       success: false,
//       error: 'Failed to update candidate stage with timeline'
//     }, { status: 500 });
//   }
// }),



// /* ------------------ ASSESSMENTS ------------------ */
// // ✅ GET assessment by job ID - UPDATED for single assessment
// http.get('/api/assessments/:jobId', async ({ params }) => {
//   console.log('🔍 MSW: Intercepted GET /api/assessments/' + params.jobId);
  
//   try {
//     // ✅ CHANGED: Get single assessment for job (no assessment_number)
//     const assessment = await dbUtils.getAssessmentByJobId(params.jobId as string);
//     console.log('📋 Assessment found:', assessment ? 'Yes' : 'No');
    
//     return HttpResponse.json({ success: true, data: assessment });
//   } catch (error) {
//     console.error('❌ Assessment fetch error:', error);
//     return HttpResponse.json({ success: false, error: 'Database error' }, { status: 500 });
//   }
// }),

// http.put('/api/assessments/:jobId', async ({ request, params }) => {
//   console.log('🔍 MSW: Intercepted PUT /api/assessments/' + params.jobId);
  
//   try {
//     const assessmentData = await request.json() as Record<string, any>;
//     console.log('📝 Saving assessment with jobId:', params.jobId);
//     console.log('📝 Assessment data:', assessmentData);
    
//     // ✅ Check if assessment exists for this job
//     const existingAssessment = await dbUtils.getAssessmentByJobId(params.jobId as string);
    
//     let assessment;
    
//     if (existingAssessment) {
//       // ✅ UPDATE: Use existing assessment's ID and preserve created_at
//       console.log('📝 Updating existing assessment:', existingAssessment.id);
      
//       const updateData = {
//         ...assessmentData,
//         job_id: params.jobId as string, // Ensure job_id matches URL param
//         id: existingAssessment.id, // ✅ Use existing ID
//         created_at: existingAssessment.created_at, // ✅ Preserve created_at
//       };
      
//       assessment = await dbUtils.updateAssessment(existingAssessment.id, updateData);
//       console.log('✅ Assessment updated in IndexedDB with job_id:', assessment?.job_id);
//     } else {
//       // ✅ CREATE: Generate new assessment
//       console.log('📝 Creating new assessment for job:', params.jobId);
      
//       const createData: Omit<Assessment, 'created_at' | 'updated_at'> = {
//         id: assessmentData.id || `assessment-${params.jobId}-${Date.now()}`,
//         job_id: params.jobId as string,
//         title: assessmentData.title || `Assessment for Job ${params.jobId}`,
//         description: assessmentData.description || '',
//         sections: Array.isArray(assessmentData.sections) ? assessmentData.sections : [],
//         is_active: typeof assessmentData.is_active === 'boolean' ? assessmentData.is_active : true,
//         created_by: assessmentData.created_by || 'current-user@company.com'
//       };
      
//       assessment = await dbUtils.createAssessment(createData);
//       console.log('✅ Assessment created in IndexedDB with job_id:', assessment?.job_id);
//     }
    
//     return HttpResponse.json({ success: true, data: assessment });
//   } catch (error) {
//     console.error('❌ Assessment save error:', error);
//     return HttpResponse.json({ success: false, error: 'Failed to save assessment' }, { status: 500 });
//   }
// }),



// // ✅ DELETE assessment - UPDATED for single assessment
// http.delete('/api/assessments/:jobId', async ({ params }) => {
//   console.log('🔍 MSW: Intercepted DELETE /api/assessments/' + params.jobId);
  
//   try {
//     const existingAssessment = await dbUtils.getAssessmentByJobId(params.jobId as string);
    
//     if (existingAssessment) {
//       await dbUtils.deleteAssessment(existingAssessment.id);
//       console.log('✅ Assessment deleted from IndexedDB');
//     }
    
//     return HttpResponse.json({ success: true, message: 'Assessment deleted' });
//   } catch (error) {
//     console.error('❌ Assessment deletion error:', error);
//     return HttpResponse.json({ success: false, error: 'Failed to delete assessment' }, { status: 500 });
//   }
// }),
// ];

import { http, HttpResponse } from 'msw';
import { db, dbUtils, Candidate } from '../lib/database';
import { Assessment } from '../lib/database';

export const handlers = [

  http.patch('/api/jobs/reorder', async ({ request }) => {
    // artificial latency: 200 - 1200 ms
    await new Promise(res => setTimeout(res, Math.floor(Math.random() * 1000) + 200));

    console.log('🔍 MSW: Intercepted PATCH /api/jobs/reorder');
    try {
      const { jobIds } = await request.json() as { jobIds: string[] };
      console.log('🔄 Reordering jobs:', jobIds);
      
      let min = Number.MAX_SAFE_INTEGER;
      for (let i = 0; i < jobIds.length; i++) {
        const existingJob = await db.jobs.get(jobIds[i]);
        const oldOrder = existingJob ? existingJob.order : 0;
        min = Math.min(oldOrder, min);
      }
      
      for (let i = 0; i < jobIds.length; i++) {
        await dbUtils.updateJob(jobIds[i], { order: min + i });
      }
      
      console.log('✅ Jobs reordered in IndexedDB');
      return HttpResponse.json({ success: true, data: jobIds });
    } catch (error) {
      console.error('❌ Job reorder error:', error);
      return HttpResponse.json({ success: false, error: 'Failed to reorder jobs' }, { status: 500 });
    }
  }),

  /* ---------------------- JOBS ---------------------- */
  http.get('/api/jobs', async ({ request }) => {
    // artificial latency: 200 - 1200 ms
    await new Promise(res => setTimeout(res, Math.floor(Math.random() * 1000) + 200));

    console.log('🔍 MSW: Intercepted GET /api/jobs');
    
    const url = new URL(request.url);
    const search = url.searchParams.get('search') ?? '';
    const status = url.searchParams.get('status');
    const page = parseInt(url.searchParams.get('page') ?? '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') ?? '10', 10);

    try {
      // ✅ Query IndexedDB using dbUtils
      const allJobs = await dbUtils.getAllJobs({
        search: search || undefined,
        status: status && status !== 'all' ? status : undefined
      });
      
      // Apply pagination
      const totalItems = allJobs.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
      const start = (page - 1) * pageSize;
      const paginatedJobs = allJobs.slice(start, start + pageSize);

      const responseData = {
        success: true,
        data: {
          jobs: paginatedJobs,
          pagination: {
            current_page: page,
            page_size: pageSize,
            total_items: totalItems,
            total_pages: totalPages,
            has_next: page < totalPages,
            has_prev: page > 1,
          },
        },
        timestamp: new Date().toISOString(),
      };

      console.log('✅ MSW: Returning', paginatedJobs.length, 'jobs from IndexedDB');
      return HttpResponse.json(responseData, { status: 200 });
    } catch (error) {
      console.error('❌ MSW Jobs Error:', error);
      return HttpResponse.json({ success: false, error: 'Database error' }, { status: 500 });
    }
  }),

  // ✅ GET single job
  http.get('/api/jobs/:id', async ({ params }) => {
    // artificial latency: 200 - 1200 ms
    await new Promise(res => setTimeout(res, Math.floor(Math.random() * 1000) + 200));

    console.log('🔍 MSW: Intercepted GET /api/jobs/' + params.id);
    
    try {
      const job = await dbUtils.getJob(params.id as string);
      
      if (!job) {
        return HttpResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
      }

      return HttpResponse.json({ success: true, data: job });
    } catch (error) {
      return HttpResponse.json({ success: false, error: 'Database error' }, { status: 500 });
    }
  }),

  // ✅ CREATE job - FIXED
  http.post('/api/jobs', async ({ request }) => {
    // artificial latency: 200 - 1200 ms
    await new Promise(res => setTimeout(res, Math.floor(Math.random() * 1000) + 200));

    console.log('🔍 MSW: Intercepted POST /api/jobs');
    
    try {
      const jobData = await request.json() as any;
      console.log('📝 Creating job with data:', jobData);
      
      // ✅ Use dbUtils to create job in IndexedDB
      const newJob = await dbUtils.createJob({
        ...jobData,
        id: `job-${Date.now()}`, // ✅ Generate unique ID
      });
      
      console.log('✅ Job created in IndexedDB:', newJob.id);
      return HttpResponse.json({ success: true, data: newJob }, { status: 201 });
    } catch (error) {
      console.error('❌ Job creation error:', error);
      return HttpResponse.json({ success: false, error: 'Failed to create job' }, { status: 500 });
    }
  }),

  // ✅ UPDATE job - FIXED  
  http.patch('/api/jobs/:id', async ({ request, params }) => {
    // artificial latency: 200 - 1200 ms
    await new Promise(res => setTimeout(res, Math.floor(Math.random() * 1000) + 200));

    console.log('🔍 MSW: Intercepted PATCH /api/jobs/' + params.id);
    
    try {
      const updates = await request.json() as any;
      console.log('📝 Updating job with:', updates);
      
      // ✅ Use dbUtils to update job in IndexedDB
      const updatedJob = await dbUtils.updateJob(params.id as string, updates);
      
      if (!updatedJob) {
        return HttpResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
      }

      console.log('✅ Job updated in IndexedDB:', updatedJob.id);
      return HttpResponse.json({ success: true, data: updatedJob });
    } catch (error) {
      console.error('❌ Job update error:', error);
      return HttpResponse.json({ success: false, error: 'Failed to update job' }, { status: 500 });
    }
  }),

  // ✅ DELETE job - FIXED
  http.delete('/api/jobs/:id', async ({ params }) => {
    // artificial latency: 200 - 1200 ms
    await new Promise(res => setTimeout(res, Math.floor(Math.random() * 1000) + 200));

    console.log('🔍 MSW: Intercepted DELETE /api/jobs/' + params.id);
    
    try {
      // ✅ Use dbUtils to delete from IndexedDB
      await dbUtils.deleteJob(params.id as string);
      
      console.log('✅ Job deleted from IndexedDB:', params.id);
      return HttpResponse.json({ success: true, message: 'Job deleted' });
    } catch (error) {
      console.error('❌ Job deletion error:', error);
      return HttpResponse.json({ success: false, error: 'Failed to delete job' }, { status: 500 });
    }
  }),


  /* ------------------ CANDIDATES ------------------ */
  http.get('/api/candidates', async ({ request }) => {
    // artificial latency: 200 - 1200 ms
    await new Promise(res => setTimeout(res, Math.floor(Math.random() * 1000) + 200));

    console.log('🔍 MSW: Intercepted GET /api/candidates');
    
    const url = new URL(request.url);
    const search = url.searchParams.get('search') ?? '';
    const stage = url.searchParams.get('stage') ?? 'all';
    const job_id = url.searchParams.get('job_id') ?? '';
    const page = parseInt(url.searchParams.get('page') ?? '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') ?? '10', 10);

    try {
      const allCandidates = await dbUtils.getAllCandidates({
        search: search || undefined,
        stage: stage !== 'all' ? stage : undefined,
        job_id: job_id || undefined
      });
      
      const totalItems = allCandidates.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
      const start = (page - 1) * pageSize;
      const paginatedCandidates = allCandidates.slice(start, start + pageSize);

      const responseData = {
        success: true,
        data: {
          candidates: paginatedCandidates,
          pagination: {
            current_page: page,
            page_size: pageSize,
            total_items: totalItems,
            total_pages: totalPages,
            has_next: page < totalPages,
            has_prev: page > 1,
          },
        },
        timestamp: new Date().toISOString(),
      };

      console.log('✅ MSW: Returning', paginatedCandidates.length, 'candidates');
      return HttpResponse.json(responseData, { status: 200 });
    } catch (error) {
      console.error('❌ MSW Candidates Error:', error);
      return HttpResponse.json({ success: false, error: 'Database error' }, { status: 500 });
    }
  }),

  // ✅ Other candidate endpoints...
  http.get('/api/candidates/:id', async ({ params }) => {
    // artificial latency: 200 - 1200 ms
    await new Promise(res => setTimeout(res, Math.floor(Math.random() * 1000) + 200));

    try {
      const candidate = await dbUtils.getCandidate(params.id as string);
      if (!candidate) {
        return HttpResponse.json({ success: false, error: 'Candidate not found' }, { status: 404 });
      }
      return HttpResponse.json({ success: true, data: candidate });
    } catch (error) {
      return HttpResponse.json({ success: false, error: 'Database error' }, { status: 500 });
    }
  }),

  // ✅ ADD: Type-safe PATCH handler for updating candidates
  http.patch('/api/candidates/:id', async ({ request, params }) => {
    // artificial latency: 200 - 1200 ms
    await new Promise(res => setTimeout(res, Math.floor(Math.random() * 1000) + 200));

    console.log('🔍 MSW: Intercepted PATCH /api/candidates/' + params.id);
    
    try {
      // ✅ Type-safe way to handle request body
      const updates = await request.json() as Partial<Candidate>;
      console.log('📝 Updating candidate with:', updates);
      
      // Validate that we have a valid update object
      if (!updates || typeof updates !== 'object') {
        return HttpResponse.json({
          success: false,
          error: 'Invalid update payload'
        }, { status: 400 });
      }
      
      // Use dbUtils to update candidate in IndexedDB
      const updatedCandidate = await dbUtils.updateCandidate(params.id as string, updates);
      
      if (!updatedCandidate) {
        return HttpResponse.json({
          success: false,
          error: 'Candidate not found'
        }, { status: 404 });
      }

      console.log('✅ Candidate updated in IndexedDB:', updatedCandidate.id);
      return HttpResponse.json({ success: true, data: updatedCandidate });
    } catch (error) {
      console.error('❌ Candidate update error:', error);
      return HttpResponse.json({
        success: false,
        error: 'Failed to update candidate'
      }, { status: 500 });
    }
  }),

  http.post('/api/candidates/:id/notes', async ({ params, request }) => {
    // artificial latency: 200 - 1200 ms
    await new Promise(res => setTimeout(res, Math.floor(Math.random() * 1000) + 200));

    const candidateId = params.id
    if (!candidateId) {
      return HttpResponse.json(
        { success: false, error: 'Candidate ID is missing' },
        { status: 400 }
      );
    }
    const id = candidateId  as string;
    const { content, is_private } = (await request.json()) as { content: string; is_private: boolean };

    console.log(`MSW: Adding note for candidate ${id}`, { content, is_private });

    // Use the pre-made function to persist the note in IndexedDB
    const newNote = await dbUtils.addCandidateNote(id, {
      content,
      is_private,
      created_by: 'hr@Company',
    });

    return HttpResponse.json(
      {
        success: true,
        data: newNote,
      },
      { status: 201 }
    );
  }),

  // Add this handler to the handlers array in handlers.ts

  // ✅ NEW: Update candidate stage with timeline
  http.patch('/api/candidates/:id/stage', async ({ request, params }) => {
    // artificial latency: 200 - 1200 ms
    await new Promise(res => setTimeout(res, Math.floor(Math.random() * 1000) + 200));

    console.log('🔍 MSW: Intercepted PATCH /api/candidates/' + params.id + '/stage');
    try {
      const {
        candidateName,
        previousStage,
        newStage,
        previousStageTitle,
        newStageTitle
      } = await request.json() as {
        candidateName: string;
        previousStage: string;
        newStage: string;
        previousStageTitle: string;
        newStageTitle: string;
      };

      console.log('📝 Updating candidate stage with timeline:', {
        candidateId: params.id,
        candidateName,
        previousStage,
        newStage,
        previousStageTitle,
        newStageTitle
      });

      // Use the new dbUtils method
      const updatedCandidate = await dbUtils.updateCandidateStageWithTimeline(
        params.id as string,
        candidateName,
        previousStage,
        newStage as Candidate['stage'],
        previousStageTitle,
        newStageTitle
      );

      if (!updatedCandidate) {
        return HttpResponse.json({
          success: false,
          error: 'Candidate not found'
        }, { status: 404 });
      }

      console.log('✅ Candidate stage updated with timeline in IndexedDB:', updatedCandidate.id);
      return HttpResponse.json({ success: true, data: updatedCandidate });
    } catch (error) {
      console.error('❌ Candidate stage update with timeline error:', error);
      return HttpResponse.json({
        success: false,
        error: 'Failed to update candidate stage with timeline'
      }, { status: 500 });
    }
  }),



  /* ------------------ ASSESSMENTS ------------------ */
  // ✅ GET assessment by job ID - UPDATED for single assessment
  http.get('/api/assessments/:jobId', async ({ params }) => {
    // artificial latency: 200 - 1200 ms
    await new Promise(res => setTimeout(res, Math.floor(Math.random() * 1000) + 200));

    console.log('🔍 MSW: Intercepted GET /api/assessments/' + params.jobId);
    
    try {
      // ✅ CHANGED: Get single assessment for job (no assessment_number)
      const assessment = await dbUtils.getAssessmentByJobId(params.jobId as string);
      console.log('📋 Assessment found:', assessment ? 'Yes' : 'No');
      
      return HttpResponse.json({ success: true, data: assessment });
    } catch (error) {
      console.error('❌ Assessment fetch error:', error);
      return HttpResponse.json({ success: false, error: 'Database error' }, { status: 500 });
    }
  }),

  http.put('/api/assessments/:jobId', async ({ request, params }) => {
    // artificial latency: 200 - 1200 ms
    await new Promise(res => setTimeout(res, Math.floor(Math.random() * 1000) + 200));

    console.log('🔍 MSW: Intercepted PUT /api/assessments/' + params.jobId);
    
    try {
      const assessmentData = await request.json() as Record<string, any>;
      console.log('📝 Saving assessment with jobId:', params.jobId);
      console.log('📝 Assessment data:', assessmentData);
      
      // ✅ Check if assessment exists for this job
      const existingAssessment = await dbUtils.getAssessmentByJobId(params.jobId as string);
      
      let assessment;
      
      if (existingAssessment) {
        // ✅ UPDATE: Use existing assessment's ID and preserve created_at
        console.log('📝 Updating existing assessment:', existingAssessment.id);
        
        const updateData = {
          ...assessmentData,
          job_id: params.jobId as string, // Ensure job_id matches URL param
          id: existingAssessment.id, // ✅ Use existing ID
          created_at: existingAssessment.created_at, // ✅ Preserve created_at
        };
        
        assessment = await dbUtils.updateAssessment(existingAssessment.id, updateData);
        console.log('✅ Assessment updated in IndexedDB with job_id:', assessment?.job_id);
      } else {
        // ✅ CREATE: Generate new assessment
        console.log('📝 Creating new assessment for job:', params.jobId);
        
        const createData: Omit<Assessment, 'created_at' | 'updated_at'> = {
          id: assessmentData.id || `assessment-${params.jobId}-${Date.now()}`,
          job_id: params.jobId as string,
          title: assessmentData.title || `Assessment for Job ${params.jobId}`,
          description: assessmentData.description || '',
          sections: Array.isArray(assessmentData.sections) ? assessmentData.sections : [],
          is_active: typeof assessmentData.is_active === 'boolean' ? assessmentData.is_active : true,
          created_by: assessmentData.created_by || 'current-user@company.com'
        };
        
        assessment = await dbUtils.createAssessment(createData);
        console.log('✅ Assessment created in IndexedDB with job_id:', assessment?.job_id);
      }
      
      return HttpResponse.json({ success: true, data: assessment });
    } catch (error) {
      console.error('❌ Assessment save error:', error);
      return HttpResponse.json({ success: false, error: 'Failed to save assessment' }, { status: 500 });
    }
  }),



  // ✅ DELETE assessment - UPDATED for single assessment
  http.delete('/api/assessments/:jobId', async ({ params }) => {
    // artificial latency: 200 - 1200 ms
    await new Promise(res => setTimeout(res, Math.floor(Math.random() * 1000) + 200));

    console.log('🔍 MSW: Intercepted DELETE /api/assessments/' + params.jobId);
    
    try {
      const existingAssessment = await dbUtils.getAssessmentByJobId(params.jobId as string);
      
      if (existingAssessment) {
        await dbUtils.deleteAssessment(existingAssessment.id);
        console.log('✅ Assessment deleted from IndexedDB');
      }
      
      return HttpResponse.json({ success: true, message: 'Assessment deleted' });
    } catch (error) {
      console.error('❌ Assessment deletion error:', error);
      return HttpResponse.json({ success: false, error: 'Failed to delete assessment' }, { status: 500 });
    }
  }),
];
