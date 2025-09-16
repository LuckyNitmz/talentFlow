// import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import type { Assessment } from '@/lib/database';
// import {
//   fetchAssessmentByJobId,
//   saveAssessment,
//   deleteAssessment
// } from './assessmentsThunks'; // ✅ Import from separate file

// interface AssessmentsState {
//   assessments: { [jobId: string]: Assessment | null };
//   currentAssessment: Assessment | null;
//   loading: boolean;
//   error: string | null;
//   saving: { [jobId: string]: boolean };
// }

// const initialState: AssessmentsState = {
//   assessments: {},
//   currentAssessment: null,
//   loading: false,
//   error: null,
//   saving: {}
// };

// const assessmentsSlice = createSlice({
//   name: 'assessments',
//   initialState,
//   reducers: {
//     clearError: (state) => {
//       state.error = null;
//     },
    
//     setCurrentAssessment: (state, action: PayloadAction<string | null>) => {
//       const jobId = action.payload;
//       state.currentAssessment = jobId ? (state.assessments[jobId] || null) : null;
//     },

//     // ✅ Local updates for immediate UI feedback
//     addSection: (state, action: PayloadAction<{ jobId: string; section: any }>) => {
//       const { jobId, section } = action.payload;
      
//       if (!state.assessments[jobId]) {
//         state.assessments[jobId] = {
//           id: `assessment-${jobId}`,
//           job_id: jobId,
//           title: 'New Assessment',
//           description: '',
//           sections: [],
//           is_active: true,
//           created_at: new Date().toISOString(),
//           updated_at: new Date().toISOString(),
//           created_by: 'current-user@company.com'
//         };
//       }

//       const assessment = state.assessments[jobId]!;
//       const newSection = {
//         id: `section-${Date.now()}`,
//         title: section.title || 'New Section',
//         description: section.description || '',
//         questions: [],
//         order: assessment.sections.length,
//         required: true
//       };

//       assessment.sections.push(newSection);
//       assessment.updated_at = new Date().toISOString();
      
//       if (state.currentAssessment?.job_id === jobId) {
//         state.currentAssessment = assessment;
//       }
//     },

//     updateSection: (state, action: PayloadAction<{ jobId: string; sectionId: string; updates: any }>) => {
//       const { jobId, sectionId, updates } = action.payload;
//       const assessment = state.assessments[jobId];
      
//       if (assessment) {
//         const sectionIndex = assessment.sections.findIndex(s => s.id === sectionId);
//         if (sectionIndex !== -1) {
//           assessment.sections[sectionIndex] = {
//             ...assessment.sections[sectionIndex],
//             ...updates
//           };
//           assessment.updated_at = new Date().toISOString();
//         }
//       }
//     },

//     removeSection: (state, action: PayloadAction<{ jobId: string; sectionId: string }>) => {
//       const { jobId, sectionId } = action.payload;
//       const assessment = state.assessments[jobId];
      
//       if (assessment) {
//         assessment.sections = assessment.sections.filter(s => s.id !== sectionId);
//         assessment.updated_at = new Date().toISOString();
//       }
//     },

//     addQuestion: (state, action: PayloadAction<{ jobId: string; sectionId: string; question: any }>) => {
//       const { jobId, sectionId, question } = action.payload;
//       const assessment = state.assessments[jobId];
      
//       if (assessment) {
//         const section = assessment.sections.find(s => s.id === sectionId);
//         if (section) {
//           const newQuestion = {
//             id: `question-${Date.now()}`,
//             type: question.type || 'short_text',
//             title: question.title || 'New Question',
//             description: question.description || '',
//             required: question.required || false,
//             options: question.options || [],
//             validation: question.validation || {},
//             conditional_logic: question.conditional_logic,
//             order: section.questions.length,
//             points: question.points || 1
//           };

//           section.questions.push(newQuestion);
//           assessment.updated_at = new Date().toISOString();
//         }
//       }
//     },

//     updateQuestion: (state, action: PayloadAction<{ jobId: string; sectionId: string; questionId: string; updates: any }>) => {
//       const { jobId, sectionId, questionId, updates } = action.payload;
//       const assessment = state.assessments[jobId];
      
//       if (assessment) {
//         const section = assessment.sections.find(s => s.id === sectionId);
//         if (section) {
//           const questionIndex = section.questions.findIndex(q => q.id === questionId);
//           if (questionIndex !== -1) {
//             section.questions[questionIndex] = {
//               ...section.questions[questionIndex],
//               ...updates
//             };
//             assessment.updated_at = new Date().toISOString();
//           }
//         }
//       }
//     },

//     removeQuestion: (state, action: PayloadAction<{ jobId: string; sectionId: string; questionId: string }>) => {
//       const { jobId, sectionId, questionId } = action.payload;
//       const assessment = state.assessments[jobId];
      
//       if (assessment) {
//         const section = assessment.sections.find(s => s.id === sectionId);
//         if (section) {
//           section.questions = section.questions.filter(q => q.id !== questionId);
//           assessment.updated_at = new Date().toISOString();
//         }
//       }
//     }
//   },
  
//   extraReducers: (builder) => {
//     // ✅ Fetch assessment
//     builder
//       .addCase(fetchAssessmentByJobId.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchAssessmentByJobId.fulfilled, (state, action) => {
//         state.loading = false;
//         const { meta, payload } = action;
//         const jobId = meta.arg;
        
//         state.assessments[jobId] = payload; // Could be null
        
//         if (payload) {
//           state.currentAssessment = payload;
//         } else {
//           state.currentAssessment = null;
//         }
//       })
//       .addCase(fetchAssessmentByJobId.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload as string;
//       });

//     // ✅ Save assessment
//     builder
//       .addCase(saveAssessment.pending, (state, action) => {
//         const jobId = action.meta.arg.jobId;
//         state.saving[jobId] = true;
//         state.error = null;
//       })
//       .addCase(saveAssessment.fulfilled, (state, action) => {
//         const assessment = action.payload as Assessment;
//         const jobId = assessment.job_id;
        
//         state.assessments[jobId] = assessment;
//         delete state.saving[jobId];
        
//         if (state.currentAssessment?.job_id === jobId) {
//           state.currentAssessment = assessment;
//         }
//       })
//       .addCase(saveAssessment.rejected, (state, action) => {
//         const jobId = action.meta.arg.jobId;
//         delete state.saving[jobId];
//         state.error = action.payload as string;
//       });

//     // ✅ Delete assessment
//     builder
//       .addCase(deleteAssessment.fulfilled, (state, action) => {
//         const jobId = action.payload as string;
//         delete state.assessments[jobId];
        
//         if (state.currentAssessment?.job_id === jobId) {
//           state.currentAssessment = null;
//         }
//       })
//       .addCase(deleteAssessment.rejected, (state, action) => {
//         state.error = action.payload as string;
//       });
//   }
// });

// export const {
//   clearError,
//   setCurrentAssessment,
//   addSection,
//   updateSection,
//   removeSection,
//   addQuestion,
//   updateQuestion,
//   removeQuestion
// } = assessmentsSlice.actions;

// // ✅ Selectors
// export const selectAssessments = (state: { assessments: AssessmentsState }) => state.assessments.assessments;
// export const selectCurrentAssessment = (state: { assessments: AssessmentsState }) => state.assessments.currentAssessment;
// export const selectAssessmentsLoading = (state: { assessments: AssessmentsState }) => state.assessments.loading;
// export const selectAssessmentsError = (state: { assessments: AssessmentsState }) => state.assessments.error;

// export const selectAssessmentByJobId = (state: { assessments: AssessmentsState }, jobId: string): Assessment | null =>
//   state.assessments.assessments[jobId] || null;

// export const selectAssessmentSaving = (state: { assessments: AssessmentsState }, jobId: string) => 
//   Boolean(state.assessments.saving[jobId]);

// export default assessmentsSlice.reducer;


import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

// ✅ CHANGED: Simplified interfaces for single assessment
export interface Question {
  id: string;
  type: 'short_text' | 'long_text' | 'single_choice' | 'multiple_choice';
  title: string;
  required: boolean;
  options?: string[];
  correctOptions?: number[];
  correctAnswer?: string;
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

export interface Assessment {
  id: string;
  job_id: string;
  title: string;
  description?: string;
  sections: Section[];
  // ✅ REMOVED: assessment_number field
  created_at: string;
  updated_at: string;
}

interface AssessmentsState {
  currentAssessment: Assessment | null; // ✅ CHANGED: Single assessment
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: AssessmentsState = {
  currentAssessment: null, // ✅ CHANGED: Single assessment
  loading: false,
  saving: false,
  error: null,
};

const assessmentsSlice = createSlice({
  name: 'assessments',
  initialState,
  reducers: {
    // ✅ CHANGED: Set current assessment (simplified)
    setCurrentAssessment: (state, action: PayloadAction<Assessment>) => {
      state.currentAssessment = action.payload;
    },

    // ✅ REMOVED: setSelectedAssessmentNumber (no longer needed)

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setSaving: (state, action: PayloadAction<boolean>) => {
      state.saving = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // ✅ CHANGED: Clear assessment (simplified)
    clearAssessment: (state) => {
      state.currentAssessment = null;
    },

    addSection: (state, action: PayloadAction<{ section: { title: string; description?: string } }>) => {
      if (state.currentAssessment) {
        const newSection: Section = {
          id: uuidv4(),
          title: action.payload.section.title,
          description: action.payload.section.description,
          questions: []
        };
        state.currentAssessment.sections.push(newSection);
        state.currentAssessment.updated_at = new Date().toISOString();
      }
    },

    updateSection: (state, action: PayloadAction<{ sectionId: string; updates: Partial<Section> }>) => {
      if (state.currentAssessment) {
        const sectionIndex = state.currentAssessment.sections.findIndex(s => s.id === action.payload.sectionId);
        if (sectionIndex !== -1) {
          state.currentAssessment.sections[sectionIndex] = {
            ...state.currentAssessment.sections[sectionIndex],
            ...action.payload.updates
          };
          state.currentAssessment.updated_at = new Date().toISOString();
        }
      }
    },

    removeSection: (state, action: PayloadAction<{ sectionId: string }>) => {
      if (state.currentAssessment) {
        state.currentAssessment.sections = state.currentAssessment.sections.filter(
          s => s.id !== action.payload.sectionId
        );
        state.currentAssessment.updated_at = new Date().toISOString();
      }
    },

    addQuestion: (state, action: PayloadAction<{ sectionId: string; question: Omit<Question, 'id'> }>) => {
      if (state.currentAssessment) {
        const sectionIndex = state.currentAssessment.sections.findIndex(s => s.id === action.payload.sectionId);
        if (sectionIndex !== -1) {
          const newQuestion: Question = {
            id: uuidv4(),
            ...action.payload.question
          };
          state.currentAssessment.sections[sectionIndex].questions.push(newQuestion);
          state.currentAssessment.updated_at = new Date().toISOString();
        }
      }
    },

    updateQuestion: (state, action: PayloadAction<{ sectionId: string; questionId: string; updates: Partial<Question> }>) => {
      if (state.currentAssessment) {
        const sectionIndex = state.currentAssessment.sections.findIndex(s => s.id === action.payload.sectionId);
        if (sectionIndex !== -1) {
          const questionIndex = state.currentAssessment.sections[sectionIndex].questions.findIndex(
            q => q.id === action.payload.questionId
          );
          if (questionIndex !== -1) {
            state.currentAssessment.sections[sectionIndex].questions[questionIndex] = {
              ...state.currentAssessment.sections[sectionIndex].questions[questionIndex],
              ...action.payload.updates
            };
            state.currentAssessment.updated_at = new Date().toISOString();
          }
        }
      }
    },

    removeQuestion: (state, action: PayloadAction<{ sectionId: string; questionId: string }>) => {
      if (state.currentAssessment) {
        const sectionIndex = state.currentAssessment.sections.findIndex(s => s.id === action.payload.sectionId);
        if (sectionIndex !== -1) {
          state.currentAssessment.sections[sectionIndex].questions = 
            state.currentAssessment.sections[sectionIndex].questions.filter(
              q => q.id !== action.payload.questionId
            );
          state.currentAssessment.updated_at = new Date().toISOString();
        }
      }
    },
  },
});

export const {
  setCurrentAssessment,
  setLoading,
  setSaving,
  setError,
  clearAssessment,
  addSection,
  updateSection,
  removeSection,
  addQuestion,
  updateQuestion,
  removeQuestion,
} = assessmentsSlice.actions;

// ✅ CHANGED: Updated selectors for single assessment
export const selectCurrentAssessment = (state: any) => state.assessments.currentAssessment;
export const selectAssessmentsLoading = (state: any) => state.assessments.loading;
export const selectAssessmentsSaving = (state: any) => state.assessments.saving;
export const selectAssessmentsError = (state: any) => state.assessments.error;

export default assessmentsSlice.reducer;
