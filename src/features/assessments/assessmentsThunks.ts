// import { createAsyncThunk } from '@reduxjs/toolkit';
// import { assessmentsApi } from '@/services/assessmentsApi';
// import type { Assessment } from '@/lib/database';

// export const fetchAssessmentByJobId = createAsyncThunk(
//   'assessments/fetchAssessmentByJobId',
//   async (jobId: string, { rejectWithValue }) => {
//     try {
//       console.log('🔍 Fetching assessment for job:', jobId);
//       const response = await assessmentsApi.getAssessmentByJobId(jobId);
//       console.log('✅ Assessment response:', response);
      
//       // ✅ Handle MSW response structure
//       if (response?.data) {
//         return response.data; // Could be null if no assessment exists
//       }
//       return response?.data || response || null;
//     } catch (error: any) {
//       console.error('❌ Assessment fetch error:', error);
//       if (error.status === 404) {
//         return null; // No assessment found is not an error
//       }
//       return rejectWithValue(error.message || 'Failed to fetch assessment');
//     }
//   }
// );

// export const saveAssessment = createAsyncThunk(
//   'assessments/saveAssessment',
//   async ({ jobId, assessmentData }: { jobId: string; assessmentData: Partial<Assessment> }, { rejectWithValue }) => {
//     try {
//       console.log('💾 Saving assessment for job:', jobId, assessmentData);
//       const response = await assessmentsApi.saveAssessment(jobId, assessmentData);
//       console.log('✅ Assessment saved:', response);
      
//       // ✅ Handle MSW response structure
//       if (response?.data) {
//         return response.data;
//       }
//       return response?.data || response;
//     } catch (error: any) {
//       console.error('❌ Assessment save error:', error);
//       return rejectWithValue(error.message || 'Failed to save assessment');
//     }
//   }
// );

// export const deleteAssessment = createAsyncThunk(
//   'assessments/deleteAssessment', 
//   async (jobId: string, { rejectWithValue }) => {
//     try {
//       console.log('🗑️ Deleting assessment for job:', jobId);
//       await assessmentsApi.deleteAssessment(jobId);
//       return jobId;
//     } catch (error: any) {
//       console.error('❌ Assessment delete error:', error);
//       return rejectWithValue(error.message || 'Failed to delete assessment');
//     }
//   }
// );


// assessmentsThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { assessmentsApi } from '@/services/assessmentsApi';
import { setCurrentAssessment, setLoading, setSaving, setError, clearAssessment } from './assessmentsSlice';

// ✅ CHANGED: Fetch single assessment by job ID
// export const fetchAssessmentByJobId = createAsyncThunk(
//   'assessments/fetchByJobId',
//   async (jobId: string, { dispatch }) => {
//     try {
//       dispatch(setLoading(true));
//       dispatch(setError(null));
      
//       const response = await assessmentsApi.getAssessmentByJobId(jobId);
      
//       if (response.success && response.data) {
//         dispatch(setCurrentAssessment(response.data));
//       } else {
//         // No assessment exists for this job
//         dispatch(clearAssessment());
//       }
      
//       return response;
//     } catch (error: any) {
//       dispatch(setError(error.message));
//       dispatch(clearAssessment());
//       throw error;
//     } finally {
//       dispatch(setLoading(false));
//     }
//   }
// );

export const fetchAssessmentByJobId = createAsyncThunk(
  'assessments/fetchByJobId',
  async (jobId: string, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      console.log('🔍 Fetching assessment for jobId:', jobId);
      
      const response = await assessmentsApi.getAssessmentByJobId(jobId);
      
      console.log('📥 Fetch response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Found assessment with job_id:', response.data.job_id);
        dispatch(setCurrentAssessment(response.data));
      } else {
        console.log('❌ No assessment found for jobId:', jobId);
        dispatch(clearAssessment());
      }
      
      return response;
    } catch (error: any) {
      console.error('❌ Error fetching assessment:', error);
      dispatch(setError(error.message || 'Failed to fetch assessment'));
      dispatch(clearAssessment());
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);


// ✅ CHANGED: Create single assessment for job
// export const createAssessment = createAsyncThunk(
//   'assessments/create',
//   async ({ jobId, assessmentData }: { jobId: string; assessmentData: any }, { dispatch }) => {
//     try {
//       dispatch(setSaving(true));
//       dispatch(setError(null));
      
//       const response = await assessmentsApi.createAssessment(jobId, {
//         ...assessmentData,
//         sections: []
//       });
      
//       if (response.success) {
//         dispatch(setCurrentAssessment(response.data));
//       }
      
//       return response;
//     } catch (error: any) {
//       dispatch(setError(error.message));
//       throw error;
//     } finally {
//       dispatch(setSaving(false));
//     }
//   }
// );

export const createAssessment = createAsyncThunk(
  'assessments/create',
  async ({ jobId, assessmentData }: { jobId: string; assessmentData: any }, { dispatch }) => {
    try {
      dispatch(setSaving(true));
      dispatch(setError(null));
      
      // ✅ FIXED: Ensure job_id is always set
      const dataWithJobId = {
        ...assessmentData,
        job_id: jobId, // ✅ CRITICAL: Ensure job_id is set
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
