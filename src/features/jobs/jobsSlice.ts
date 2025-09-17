import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import type { Job } from '@/lib/database';
import {
  fetchJobs,
  fetchJobById,
  createJob,
  updateJob,
  deleteJob,
  reorderJobs
} from '@/features/jobs/jobsThunks';

interface JobsState {
  jobs: Job[];
  currentJob: Job | null;
  loading: boolean;           // for list fetch
  error: string | null;
  detailLoading: boolean;     // for fetch by id
  detailError: string | null;
  filters: {
    search: string;
    status: 'all' | 'active' | 'draft' | 'archived';
  };
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalJobs: number;
    totalPages: number;
  };
}

const initialState: JobsState = {
  jobs: [],
  currentJob: null,
  loading: false,
  error: null,
  detailLoading: false,
  detailError: null,
  filters: {
    search: '',
    status: 'all'
  },
  pagination: {
    currentPage: 1,
    itemsPerPage: 5,
    totalJobs: 0,
    totalPages: 0
  }
};

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<typeof state.filters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1; // reset page on filter change
    },
    setPagination: (state, action: PayloadAction<Partial<typeof state.pagination>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
      state.detailError = null;
    }
  },
  extraReducers: (builder) => {
    /* ---------------- Fetch Jobs (list) ---------------- */
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;

        console.log("Redux - Received payload:", action.payload);

        // Robust handling of payload (MSW vs plain)
        const payload: any = action.payload;
        if (payload?.data?.jobs) {
          state.jobs = payload.data.jobs;
          state.pagination = {
            ...state.pagination,
            totalJobs: payload.data.pagination?.total_items || 0,
            totalPages: payload.data.pagination?.total_pages || 0
          };
          console.log('Successfully processed jobs:', state.jobs.length);
        } else if (Array.isArray(payload)) {
          state.jobs = payload;
          state.pagination = {
            ...state.pagination,
            totalJobs: payload.length,
            totalPages: Math.ceil(payload.length / state.pagination.itemsPerPage)
          };
        } else {
          console.error('Unexpected jobs payload structure:', action.payload);
          state.jobs = [];
          state.pagination = {
            ...state.pagination,
            totalJobs: 0,
            totalPages: 0
          };
        }
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch jobs';
        state.jobs = [];
      });

    /* ---------------- Fetch Single Job (detail) ---------------- */
    builder
      .addCase(fetchJobById.pending, (state) => {
        // Use detailLoading separate from list loading
        state.detailLoading = true;
        state.detailError = null;
        // optionally keep currentJob visible until replaced
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.detailLoading = false;
        const payload: any = action.payload;

        // Normalize common payload shapes to a Job object:
        // - { data: { job: Job, ... } } or { data: Job } or Job
        let job: Job | null = null;

        if (!payload) {
          job = null;
        } else if (payload?.data?.job) {
          job = payload.data.job;
        } else if (payload?.data && payload.data?.id) {
          // payload.data is a job
          job = payload.data;
        } else if (payload?.id) {
          job = payload;
        } else if (payload?.data && typeof payload.data === 'object') {
          // last resort: payload.data
          job = payload.data as Job;
        } else {
          job = (payload as Job) || null;
        }

        state.currentJob = job;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = (action.payload as string) || action.error?.message || 'Failed to fetch job';
        state.currentJob = null;
      });

    /* ---------------- Create Job ---------------- */
    builder
      .addCase(createJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.loading = false;
        const newJob = action.payload?.data;
        if (newJob) {
          state.jobs.unshift(newJob);
        }
      })
      .addCase(createJob.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to create job';
      });

    /* ---------------- Update Job ---------------- */
    builder
      .addCase(updateJob.fulfilled, (state, action) => {
        const updatedJob = action.payload?.data;
        if (updatedJob) {
          const jobIndex = state.jobs.findIndex((job) => job.id === updatedJob.id);
          if (jobIndex !== -1) {
            state.jobs[jobIndex] = updatedJob;
          }
          if (state.currentJob?.id === updatedJob.id) {
            state.currentJob = updatedJob;
          }
        }
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to update job';
      });

    /* ---------------- Delete Job ---------------- */
    builder
      .addCase(deleteJob.fulfilled, (state, action) => {
        const jobId = action.payload;
        state.jobs = state.jobs.filter((job) => job.id !== jobId);
        if (state.currentJob?.id === jobId) {
          state.currentJob = null;
        }
      })
      .addCase(deleteJob.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to delete job';
      });

    /* ---------------- Reorder Jobs ---------------- */
    builder
      .addCase(reorderJobs.fulfilled, (state, action) => {
        const newOrderIds: string[] = action.payload;
        const jobsMap = new Map(state.jobs.map((job) => [job.id, job]));
        state.jobs = newOrderIds.map((id, index) => ({
          ...jobsMap.get(id)!,
          order: index
        }));
      })
      .addCase(reorderJobs.rejected, (state, action) => {
        console.error('Reorder failed:', action.payload || action.error);
      });

  }
});

export const { setFilters, setPagination, clearError } = jobsSlice.actions;

/* ---------------- Selectors ---------------- */
export const selectJobs = (state: { jobs: JobsState }) => state.jobs.jobs;
export const selectCurrentJob = (state: { jobs: JobsState }) => state.jobs.currentJob;
export const selectJobsLoading = (state: { jobs: JobsState }) => state.jobs.loading;
export const selectJobsError = (state: { jobs: JobsState }) => state.jobs.error;
export const selectJobsFilters = (state: { jobs: JobsState }) => state.jobs.filters;
export const selectJobsPagination = (state: { jobs: JobsState }) => state.jobs.pagination;
// NEW: detail loading selectors
export const selectJobDetailLoading = (state: { jobs: JobsState }) => state.jobs.detailLoading;
export const selectJobDetailError = (state: { jobs: JobsState }) => state.jobs.detailError;

export const selectPaginatedJobs = createSelector(
  [selectJobs, selectJobsPagination],
  (jobs, pagination) => ({
    jobs: jobs || [],
    totalJobs: pagination.totalJobs,
    totalPages: pagination.totalPages
  })
);

export const selectJobById = (state: { jobs: JobsState }, jobId: string): Job | undefined =>
  state.jobs.jobs?.find((job) => job.id === jobId) ||
  (state.jobs.currentJob?.id === jobId ? state.jobs.currentJob : undefined);

/* Alias for backwards compatibility */
export const addJob = createJob;

export default jobsSlice.reducer;
