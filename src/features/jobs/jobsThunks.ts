import { createAsyncThunk } from '@reduxjs/toolkit';
import { jobsApi, type JobsQueryParams } from '@/services/jobsApi';
import type { Job } from '@/lib/database';

export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async (params: JobsQueryParams = {}, { rejectWithValue }) => {
    try {
      console.log('Fetching jobs with params:', params);
      const response = await jobsApi.getJobs(params);
      console.log('Jobs API Response:', response);
      return response; //This should now contain the MSW data
    } catch (error: any) {
      console.error('Jobs fetch error:', error);
      return rejectWithValue(error.message || 'Failed to fetch jobs');
    }
  }
);

export const fetchJobById = createAsyncThunk(
  'jobs/fetchJobById',
  async (jobId: string, { rejectWithValue }) => {
    try {
      const response = await jobsApi.getJobById(jobId);
      return response; // FIXED: Don't access .data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch job');
    }
  }
);

export const createJob = createAsyncThunk(
  'jobs/createJob',
  async (jobData: Partial<Job>, { rejectWithValue }) => {
    try {
      const response = await jobsApi.createJob(jobData);
      return response; // FIXED: Don't access .data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create job');
    }
  }
);

export const updateJob = createAsyncThunk(
  'jobs/updateJob',
  async ({ id, updates }: { id: string; updates: Partial<Job> }, { rejectWithValue }) => {
    try {
      const response = await jobsApi.updateJob(id, updates);
      return response; // FIXED: Don't access .data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update job');
    }
  }
);

// Keep deleteJob and reorderJobs as they are since they don't access .data
export const deleteJob = createAsyncThunk(
  'jobs/deleteJob',
  async (jobId: string, { rejectWithValue }) => {
    try {
      await jobsApi.deleteJob(jobId);
      return jobId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete job');
    }
  }
);

export const reorderJobs = createAsyncThunk(
  'jobs/reorderJobs',
  async (jobIds: string[], { rejectWithValue }) => {
    try {
      await jobsApi.reorderJobs(jobIds);
      return jobIds;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to reorder jobs');
    }
  }
);


