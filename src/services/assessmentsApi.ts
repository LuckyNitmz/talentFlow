// assessmentsApi.ts
import api from '@/services/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
}

export interface AssessmentData {
  title: string;
  description?: string;
  sections: any[];
}

export const assessmentsApi = {
  // ✅ FIXED: Use type assertion to tell TypeScript the correct type
  async getAssessmentByJobId(jobId: string): Promise<ApiResponse> {
    const response = await api.get(`/assessments/${jobId}`) as unknown as ApiResponse;
    return response;
  },

  async createAssessment(jobId: string, assessmentData: AssessmentData): Promise<ApiResponse> {
    const response = await api.put(`/assessments/${jobId}`, assessmentData) as unknown as ApiResponse;
    return response;
  },

  async updateAssessment(jobId: string, assessmentData: any): Promise<ApiResponse> {
    // ✅ FIXED: Use jobId in URL, not assessmentId
    const response = await api.put(`/assessments/${jobId}`, assessmentData) as unknown as ApiResponse;
    return response;
  },


  async deleteAssessment(jobId: string): Promise<ApiResponse> {
    const response = await api.delete(`/assessments/${jobId}`) as unknown as ApiResponse;
    return response;
  }
};

export default assessmentsApi;
