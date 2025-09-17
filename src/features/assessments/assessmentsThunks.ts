// assessmentsThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { assessmentsApi } from '@/services/assessmentsApi';
import { setCurrentAssessment, setLoading, setSaving, setError, clearAssessment } from './assessmentsSlice';

export const fetchAssessmentByJobId = createAsyncThunk(
  'assessments/fetchByJobId',
  async (jobId: string, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      console.log('Fetching assessment for jobId:', jobId);
      
      const response = await assessmentsApi.getAssessmentByJobId(jobId);
      
      console.log('Fetch response:', response);
      
      if (response.success && response.data) {
        console.log('Found assessment with job_id:', response.data.job_id);
        dispatch(setCurrentAssessment(response.data));
      } else {
        console.log('No assessment found for jobId:', jobId);
        dispatch(clearAssessment());
      }
      
      return response;
    } catch (error: any) {
      console.error('Error fetching assessment:', error);
      dispatch(setError(error.message || 'Failed to fetch assessment'));
      dispatch(clearAssessment());
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const createAssessment = createAsyncThunk(
  'assessments/create',
  async ({ jobId, assessmentData }: { jobId: string; assessmentData: any }, { dispatch }) => {
    try {
      dispatch(setSaving(true));
      dispatch(setError(null));
      
      //FIXED: Ensure job_id is always set
      const dataWithJobId = {
        ...assessmentData,
        job_id: jobId, //CRITICAL: Ensure job_id is set
        sections: assessmentData.sections || []
      };
      
      console.log('Creating assessment with data:', dataWithJobId);
      
      const response = await assessmentsApi.createAssessment(jobId, dataWithJobId);
      
      if (response.success && response.data) {
        dispatch(setCurrentAssessment(response.data));
      }
      
      return response;
    } catch (error: any) {
      dispatch(setError(error.message));
      throw error;
    } finally {
      dispatch(setSaving(false));
    }
  }
);


export const updateAssessment = createAsyncThunk(
  'assessments/update',
  async ({ assessmentId, assessmentData }: { assessmentId: string; assessmentData: any }, { dispatch }) => {
    try {
      dispatch(setSaving(true));
      dispatch(setError(null));
      
      const response = await assessmentsApi.updateAssessment(assessmentId, assessmentData);
      
      if (response.success) {
        dispatch(setCurrentAssessment(response.data));
      }
      
      return response;
    } catch (error: any) {
      dispatch(setError(error.message));
      throw error;
    } finally {
      dispatch(setSaving(false));
    }
  }
);

export const deleteAssessment = createAsyncThunk(
  'assessments/delete',
  async (assessmentId: string, { dispatch }) => {
    try {
      dispatch(setSaving(true));
      dispatch(setError(null));
      
      const response = await assessmentsApi.deleteAssessment(assessmentId);
      
      if (response.success) {
        dispatch(clearAssessment());
      }
      
      return response;
    } catch (error: any) {
      dispatch(setError(error.message));
      throw error;
    } finally {
      dispatch(setSaving(false));
    }
  }
);
