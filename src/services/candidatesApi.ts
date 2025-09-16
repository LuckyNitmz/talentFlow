import api from './api';
import type { Candidate } from '../lib/database';

export interface CandidatesQueryParams {
  search?: string;
  stage?: 'all' | 'applied' | 'screen' | 'tech' | 'offer' | 'hired' | 'rejected';
  job_id?: string;
  page?: number;
  pageSize?: number;
}

export const candidatesApi = {
  async getCandidates(params: CandidatesQueryParams = {}) {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== 'all') {
        searchParams.append(key, value.toString());
      }
    });

    const response = await api.get(`/candidates?${searchParams.toString()}`);
    // ✅ FIXED: Don't access .data since axios interceptor already extracted it
    console.log("✅ Candidates API Response:", response);
    return response; // This is already the MSW data from interceptor
  },

  async getCandidateById(id: string) {
    const response = await api.get(`/candidates/${id}`);
    // ✅ FIXED: Don't access .data
    return response;
  },

  async updateCandidate(id: string, updates: Partial<Candidate>) {
    const response = await api.patch(`/candidates/${id}`, updates);
    // ✅ FIXED: Don't access .data
    return response;
  },

  // ✅ NEW: Update candidate stage with timeline
  async updateCandidateStageWithTimeline(
    candidateId: string,
    candidateName: string,
    previousStage: string,
    newStage: string,
    previousStageTitle: string,
    newStageTitle: string
  ) {
    const response = await api.patch(`/candidates/${candidateId}/stage`, {
      candidateName,
      previousStage,
      newStage,
      previousStageTitle,
      newStageTitle
    });
    return response;
  },

  async addCandidateNote(candidateId: string, content: string, isPrivate = false) {
    const response = await api.post(`/candidates/${candidateId}/notes`, {
      content,
      is_private: isPrivate
    });
    // ✅ FIXED: Don't access .data
    return response;
  },

  async getCandidatesByStage(jobId?: string) {
    const response = await this.getCandidates({ 
      job_id: jobId, 
      pageSize: 1000 
    });
    
    // ✅ FIXED: Handle the MSW response structure properly
    let candidates = [];
    if (response?.success && response?.data?.candidates) {
      candidates = response.data.candidates;
    } else if (response?.data && Array.isArray(response.data)) {
      candidates = response.data;
    } else if (Array.isArray(response)) {
      candidates = response;
    } else {
      console.error('❌ Unexpected candidates response structure:', response);
      candidates = [];
    }
    
    const stages = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];
    const candidatesByStage: { [stage: string]: Candidate[] } = {};
    
    stages.forEach(stage => {
      candidatesByStage[stage] = candidates.filter((candidate: Candidate) => candidate.stage === stage);
    });
    
    return candidatesByStage; // ✅ FIXED: Return directly, not wrapped in { data: ... }
  }
};

export default candidatesApi;
