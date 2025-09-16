import { createAsyncThunk } from '@reduxjs/toolkit';
import { candidatesApi, type CandidatesQueryParams } from '@/services/candidatesApi';
import type { Candidate } from '@/lib/database';

export const fetchCandidates = createAsyncThunk(
  'candidates/fetchCandidates',
  async (params: CandidatesQueryParams = {}, { rejectWithValue }) => {
    try {
      const response = await candidatesApi.getCandidates(params);
      console.log("dfsgsd", response);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch candidates');
    }
  }
);

export const fetchCandidateById = createAsyncThunk(
  'candidates/fetchCandidateById',
  async (candidateId: string, { rejectWithValue }) => {
    try {
      return await candidatesApi.getCandidateById(candidateId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch candidate');
    }
  }
);

export const updateCandidate = createAsyncThunk(
  'candidates/updateCandidate',
  async ({ id, updates }: { id: string; updates: Partial<Candidate> }, { rejectWithValue }) => {
    try {
      return await candidatesApi.updateCandidate(id, updates);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update candidate');
    }
  }
);

export const addCandidateNote = createAsyncThunk(
  'candidates/addCandidateNote',
  async (
    { candidateId, content, isPrivate = false }: { candidateId: string; content: string; isPrivate?: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response = await candidatesApi.addCandidateNote(candidateId, content, isPrivate);
      return { candidateId, note: response?.data || response };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add note');
    }
  }
);

export const fetchCandidatesByStage = createAsyncThunk(
  'candidates/fetchCandidatesByStage',
  async (jobId: string, { rejectWithValue }) => {
    try {
      return await candidatesApi.getCandidatesByStage(jobId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch candidates by stage');
    }
  }
);

export const updateCandidateStage = createAsyncThunk(
  'candidates/updateCandidateStage',
  async ({ candidateId, newStage }: { candidateId: string; newStage: Candidate['stage'] }, { rejectWithValue }) => {
    try {
      return await candidatesApi.updateCandidate(candidateId, { stage: newStage });
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update candidate stage');
    }
  }
);

// ✅ NEW: Update candidate stage with timeline entry
export const updateCandidateStageWithTimeline = createAsyncThunk(
  'candidates/updateCandidateStageWithTimeline',
  async ({
    candidateId,
    candidateName,
    previousStage,
    newStage,
    previousStageTitle,
    newStageTitle
  }: {
    candidateId: string;
    candidateName: string;
    previousStage: string;
    newStage: Candidate['stage'];
    previousStageTitle: string;
    newStageTitle: string;
  }, { rejectWithValue }) => {
    try {
      return await candidatesApi.updateCandidateStageWithTimeline(
        candidateId,
        candidateName,
        previousStage,
        newStage,
        previousStageTitle,
        newStageTitle
      );
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update candidate stage with timeline');
    }
  }
);
