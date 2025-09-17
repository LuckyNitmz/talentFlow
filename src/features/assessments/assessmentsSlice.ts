import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

//CHANGED: Simplified interfaces for single assessment
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
  //REMOVED: assessment_number field
  created_at: string;
  updated_at: string;
}

interface AssessmentsState {
  currentAssessment: Assessment | null; //CHANGED: Single assessment
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: AssessmentsState = {
  currentAssessment: null, //CHANGED: Single assessment
  loading: false,
  saving: false,
  error: null,
};

const assessmentsSlice = createSlice({
  name: 'assessments',
  initialState,
  reducers: {
    //CHANGED: Set current assessment (simplified)
    setCurrentAssessment: (state, action: PayloadAction<Assessment>) => {
      state.currentAssessment = action.payload;
    },

    //REMOVED: setSelectedAssessmentNumber (no longer needed)

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setSaving: (state, action: PayloadAction<boolean>) => {
      state.saving = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    //CHANGED: Clear assessment (simplified)
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

//CHANGED: Updated selectors for single assessment
export const selectCurrentAssessment = (state: any) => state.assessments.currentAssessment;
export const selectAssessmentsLoading = (state: any) => state.assessments.loading;
export const selectAssessmentsSaving = (state: any) => state.assessments.saving;
export const selectAssessmentsError = (state: any) => state.assessments.error;

export default assessmentsSlice.reducer;
