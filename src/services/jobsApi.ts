import api from '@/services/api';
import type { Job } from '@/lib/database';

export interface JobsQueryParams {
  search?: string;
  status?: 'all' | 'active' | 'draft' | 'archived';
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export const jobsApi = {
  async getJobs(params: JobsQueryParams = {}) {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== 'all') {
        searchParams.append(key, value.toString());
      }
    });

    const response = await api.get(`/jobs?${searchParams.toString()}`);
    console.log("Jobs API Response:", response);
    return response;
  },

  async getJobById(id: string) {
    const response = await api.get(`/jobs/${id}`);
    return response;
  },

  async createJob(jobData: Partial<Job>) {
    const response = await api.post('/jobs', jobData);
    return response;
  },

  async updateJob(id: string, updates: Partial<Job>) {
    const response = await api.patch(`/jobs/${id}`, updates);
    return response;
  },

  async deleteJob(id: string) {
    const response = await api.delete(`/jobs/${id}`);
    return response;
  },

  // ADD: Reorder jobs function
  async reorderJobs(jobIds: string[]) {
    const response = await api.patch('/jobs/reorder', { jobIds });
    return response;
  }
};

export default jobsApi;
