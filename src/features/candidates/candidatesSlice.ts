// import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { createSelector } from '@reduxjs/toolkit'; // ✅ ADDED for memoization
// import type { Candidate, CandidateNote } from '@/lib/database';
// import {
//   fetchCandidates,
//   fetchCandidateById,
//   updateCandidate,
//   addCandidateNote,
//   fetchCandidatesByStage,
//   updateCandidateStage,
//   updateCandidateStageWithTimeline // ✅ Add this
// } from '@/features/candidates/candidatesThunks';

// interface CandidatesState {
//   candidates: Candidate[];
//   candidatesByStage: { [stage: string]: Candidate[] };
//   currentCandidate: Candidate | null;
//   loading: boolean;
//   error: string | null;
//   filters: {
//     search: string;
//     stage: 'all' | 'applied' | 'screen' | 'tech' | 'offer' | 'hired' | 'rejected';
//     job_id: string;
//   };
//   pagination: {
//     currentPage: number;
//     itemsPerPage: number;
//     totalCandidates: number;
//     totalPages: number;
//   };
// }

// const initialState: CandidatesState = {
//   candidates: [],
//   candidatesByStage: {},
//   currentCandidate: null,
//   loading: false,
//   error: null,
//   filters: {
//     search: '',
//     stage: 'all',
//     job_id: ''
//   },
//   pagination: {
//     currentPage: 1,
//     itemsPerPage: 5,
//     totalCandidates: 0,
//     totalPages: 0
//   }
// };

// const candidatesSlice = createSlice({
//   name: 'candidates',
//   initialState,
//   reducers: {
//     setFilters: (state, action: PayloadAction<Partial<typeof state.filters>>) => {
//       state.filters = { ...state.filters, ...action.payload };
//       state.pagination.currentPage = 1;
//     },
    
//     setPagination: (state, action: PayloadAction<Partial<typeof state.pagination>>) => {
//       state.pagination = { ...state.pagination, ...action.payload };
//     },
    
//     clearError: (state) => {
//       state.error = null;
//     }
//   },
  
//   extraReducers: (builder) => {
//     // Fetch candidates
//     builder
//       .addCase(fetchCandidates.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchCandidates.fulfilled, (state, action) => {
//   state.loading = false;
//  const payload = action.payload as any; 
//   console.log('🔍 Candidates Redux - Received payload:', payload);

//   // ✅ Match MSW response structure
//   if (payload?.success && payload?.data?.candidates) {
//     state.candidates = payload.data.candidates;
//     state.pagination = {
//       ...state.pagination,
//       totalCandidates: payload.data.pagination?.total_items || 0,
//       totalPages: payload.data.pagination?.total_pages || 0
//     };
//   } 
//   else if (Array.isArray(payload)) {
//     // If some API returns plain array
//     state.candidates = payload;
//     state.pagination = {
//       ...state.pagination,
//       totalCandidates: payload.length,
//       totalPages: Math.ceil(payload.length / state.pagination.itemsPerPage)
//     };
//   } 
//   else {
//     console.error('❌ Unexpected candidates payload structure:', payload);
//     state.candidates = [];
//   }
// })

//       .addCase(fetchCandidates.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload as string;
//         // ✅ ADDED: Reset data on error
//         state.candidates = [];
//       });

//     // Fetch candidates by stage
//     builder
//       .addCase(fetchCandidatesByStage.fulfilled, (state, action) => {
//         // ✅ FIXED: Handle direct object response
//         state.candidatesByStage = action.payload || {};
//       });

//     // Fetch single candidate
//     builder
//       .addCase(fetchCandidateById.fulfilled, (state, action) => {
//         // ✅ FIXED: Handle MSW response structure
//         if (action.payload?.data?.success && action.payload?.data?.data) {
//           state.currentCandidate = action.payload.data;
//         } else {
//           state.currentCandidate = (action.payload?.data || action.payload) as Candidate || null;
//         }
//       });

//     // Update candidate
//     builder
//       .addCase(updateCandidate.fulfilled, (state, action) => {
//         // ✅ FIXED: Handle MSW response structure
//         const updatedCandidate = action.payload?.data || action.payload;
//         if (updatedCandidate) {
//           const candidateIndex = state.candidates.findIndex(c => c.id === updatedCandidate.id);
//           if (candidateIndex !== -1) {
//             state.candidates[candidateIndex] = updatedCandidate;
//           }
//           if (state.currentCandidate?.id === updatedCandidate.id) {
//             state.currentCandidate = updatedCandidate;
//           }
//         }
//       });

//     // Update candidate stage
//     builder
//       .addCase(updateCandidateStage.fulfilled, (state, action) => {
//         // ✅ FIXED: Handle MSW response structure
//         const updatedCandidate = action.payload?.data || action.payload;
//         if (updatedCandidate) {
//           // Update in candidates array
//           const candidateIndex = state.candidates.findIndex(c => c.id === updatedCandidate.id);
//           if (candidateIndex !== -1) {
//             state.candidates[candidateIndex] = updatedCandidate;
//           }
          
//           // Update in candidatesByStage
//           Object.keys(state.candidatesByStage).forEach(stage => {
//             state.candidatesByStage[stage] = state.candidatesByStage[stage]?.filter(c => c.id !== updatedCandidate.id) || [];
//           });
          
//           if (!state.candidatesByStage[updatedCandidate.stage]) {
//             state.candidatesByStage[updatedCandidate.stage] = [];
//           }
//           state.candidatesByStage[updatedCandidate.stage].push(updatedCandidate);
//         }
//       });

//     // Add candidate note
//     builder
//       .addCase(addCandidateNote.fulfilled, (state, action) => {
//         const { candidateId, note } = action.payload;
        
//         const candidateIndex = state.candidates.findIndex(c => c.id === candidateId);
//         if (candidateIndex !== -1) {
//           state.candidates[candidateIndex].notes.push(note);
//         }
        
//         if (state.currentCandidate?.id === candidateId) {
//           state.currentCandidate.notes.push(note);
//         }
//       });



//       // Add this case to the extraReducers in candidatesSlice.ts

//     // Update candidate stage with timeline
//     builder
//       .addCase(updateCandidateStageWithTimeline.fulfilled, (state, action) => {
//         // ✅ Handle MSW response structure
//         const updatedCandidate = action.payload?.data || action.payload;
//         if (updatedCandidate) {
//           // Update in candidates array
//           const candidateIndex = state.candidates.findIndex(c => c.id === updatedCandidate.id);
//           if (candidateIndex !== -1) {
//             state.candidates[candidateIndex] = updatedCandidate;
//           }

//           // Update in candidatesByStage
//           Object.keys(state.candidatesByStage).forEach(stage => {
//             state.candidatesByStage[stage] = state.candidatesByStage[stage]?.filter(c => c.id !== updatedCandidate.id) || [];
//           });
//           if (!state.candidatesByStage[updatedCandidate.stage]) {
//             state.candidatesByStage[updatedCandidate.stage] = [];
//           }
//           state.candidatesByStage[updatedCandidate.stage].push(updatedCandidate);

//           // Update current candidate if it's the same
//           if (state.currentCandidate?.id === updatedCandidate.id) {
//             state.currentCandidate = updatedCandidate;
//           }
//         }
//       });




//   }
// });

// export const { setFilters, setPagination, clearError } = candidatesSlice.actions;

// // ✅ FIXED: Memoized selectors to prevent rerenders
// export const selectCandidates = (state: { candidates: CandidatesState }) => state.candidates.candidates;
// export const selectCurrentCandidate = (state: { candidates: CandidatesState }) => state.candidates.currentCandidate;
// export const selectCandidatesLoading = (state: { candidates: CandidatesState }) => state.candidates.loading;
// export const selectCandidatesError = (state: { candidates: CandidatesState }) => state.candidates.error;
// export const selectCandidatesFilters = (state: { candidates: CandidatesState }) => state.candidates.filters;
// export const selectCandidatesPagination = (state: { candidates: CandidatesState }) => state.candidates.pagination;

// // ✅ FIXED: Use createSelector for memoization
// export const selectPaginatedCandidates = createSelector(
//   [selectCandidates, selectCandidatesPagination],
//   (candidates, pagination) => ({
//     candidates: candidates || [],
//     totalCandidates: pagination.totalCandidates,
//     totalPages: pagination.totalPages
//   })
// );

// export const selectCandidatesByStage = (state: { candidates: CandidatesState }, jobId?: string) => {
//   if (jobId) {
//     const filteredByStage: { [stage: string]: Candidate[] } = {};
//     Object.keys(state.candidates.candidatesByStage).forEach(stage => {
//       filteredByStage[stage] = state.candidates.candidatesByStage[stage]?.filter(c => c.job_id === jobId) || [];
//     });
//     return filteredByStage;
//   }
//   return state.candidates.candidatesByStage;
// };

// export const selectCandidateById = (state: { candidates: CandidatesState }, candidateId: string): Candidate | undefined =>
//   state.candidates.candidates?.find(candidate => candidate.id === candidateId) ||
//   (state.candidates.currentCandidate?.id === candidateId ? state.candidates.currentCandidate : undefined);

// export default candidatesSlice.reducer;

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createSelector } from '@reduxjs/toolkit'; // ✅ ADDED for memoization
import type { Candidate, CandidateNote } from '@/lib/database';
import {
  fetchCandidates,
  fetchCandidateById,
  updateCandidate,
  addCandidateNote,
  fetchCandidatesByStage,
  updateCandidateStage,
  updateCandidateStageWithTimeline // ✅ Add this
} from '@/features/candidates/candidatesThunks';

interface CandidatesState {
  candidates: Candidate[];
  candidatesByStage: { [stage: string]: Candidate[] };
  currentCandidate: Candidate | null;
  loading: boolean;               // for list fetch
  error: string | null;
  detailLoading: boolean;         // for fetch by id
  detailError: string | null;
  filters: {
    search: string;
    stage: 'all' | 'applied' | 'screen' | 'tech' | 'offer' | 'hired' | 'rejected';
    job_id: string;
  };
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalCandidates: number;
    totalPages: number;
  };
}

const initialState: CandidatesState = {
  candidates: [],
  candidatesByStage: {},
  currentCandidate: null,
  loading: false,
  error: null,
  detailLoading: false,
  detailError: null,
  filters: {
    search: '',
    stage: 'all',
    job_id: ''
  },
  pagination: {
    currentPage: 1,
    itemsPerPage: 5,
    totalCandidates: 0,
    totalPages: 0
  }
};

const candidatesSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<typeof state.filters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1;
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
    // Fetch candidates (list)
    builder
      .addCase(fetchCandidates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCandidates.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        console.log('🔍 Candidates Redux - Received payload:', payload);

        // ✅ Match MSW response structure
        if (payload?.success && payload?.data?.candidates) {
          state.candidates = payload.data.candidates;
          state.pagination = {
            ...state.pagination,
            totalCandidates: payload.data.pagination?.total_items || 0,
            totalPages: payload.data.pagination?.total_pages || 0
          };
        } 
        else if (Array.isArray(payload)) {
          // If some API returns plain array
          state.candidates = payload;
          state.pagination = {
            ...state.pagination,
            totalCandidates: payload.length,
            totalPages: Math.ceil(payload.length / state.pagination.itemsPerPage)
          };
        } 
        else {
          console.error('❌ Unexpected candidates payload structure:', payload);
          state.candidates = [];
          state.pagination = {
            ...state.pagination,
            totalCandidates: 0,
            totalPages: 0
          };
        }
      })
      .addCase(fetchCandidates.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to fetch candidates';
        // ✅ ADDED: Reset data on error
        state.candidates = [];
      });

    // Fetch candidates by stage
    builder
      .addCase(fetchCandidatesByStage.fulfilled, (state, action) => {
        // ✅ FIXED: Handle direct object response
        state.candidatesByStage = action.payload || {};
      });

    // Fetch single candidate (detail) - pending / fulfilled / rejected
    builder
      .addCase(fetchCandidateById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
        // optionally keep currentCandidate until new one arrives
      })
      .addCase(fetchCandidateById.fulfilled, (state, action) => {
        state.detailLoading = false;
        const payload = action.payload as any;

        // Normalize payload to candidate object:
        // support MSW: { data: { success: true, data: Candidate } } or direct Candidate or { data: Candidate }
        let candidate: Candidate | null = null;
        if (payload == null) {
          candidate = null;
        } else if (payload?.data?.data) {
          candidate = payload.data.data;
        } else if (payload?.data && typeof payload.data === 'object' && payload?.data?.id) {
          candidate = payload.data;
        } else if (payload?.id) {
          candidate = payload;
        } else if (payload?.data?.success && payload?.data) {
          // fallback: single layer
          candidate = payload.data;
        } else {
          candidate = (payload as Candidate) || null;
        }

        state.currentCandidate = candidate;
      })
      .addCase(fetchCandidateById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = (action.payload as string) || action.error.message || 'Failed to fetch candidate';
        state.currentCandidate = null;
      });

    // Update candidate
    builder
      .addCase(updateCandidate.fulfilled, (state, action) => {
        // ✅ FIXED: Handle MSW response structure
        const updatedCandidate = action.payload?.data || action.payload;
        if (updatedCandidate) {
          const candidateIndex = state.candidates.findIndex(c => c.id === updatedCandidate.id);
          if (candidateIndex !== -1) {
            state.candidates[candidateIndex] = updatedCandidate;
          }
          if (state.currentCandidate?.id === updatedCandidate.id) {
            state.currentCandidate = updatedCandidate;
          }
        }
      });

    // Update candidate stage
    builder
      .addCase(updateCandidateStage.fulfilled, (state, action) => {
        // ✅ FIXED: Handle MSW response structure
        const updatedCandidate = action.payload?.data || action.payload;
        if (updatedCandidate) {
          // Update in candidates array
          const candidateIndex = state.candidates.findIndex(c => c.id === updatedCandidate.id);
          if (candidateIndex !== -1) {
            state.candidates[candidateIndex] = updatedCandidate;
          }
          
          // Update in candidatesByStage
          Object.keys(state.candidatesByStage).forEach(stage => {
            state.candidatesByStage[stage] = state.candidatesByStage[stage]?.filter(c => c.id !== updatedCandidate.id) || [];
          });
          
          if (!state.candidatesByStage[updatedCandidate.stage]) {
            state.candidatesByStage[updatedCandidate.stage] = [];
          }
          state.candidatesByStage[updatedCandidate.stage].push(updatedCandidate);
        }
      });

    // Add candidate note
    builder
      .addCase(addCandidateNote.fulfilled, (state, action) => {
        // The thunk shape may vary. Try to be flexible:
        const payload = action.payload as any;
        // Common shapes: { candidateId, note } or { data: { candidateId, note } } or updated candidate object
        if (payload == null) return;

        const candidateId = payload.candidateId || payload?.data?.candidateId || payload?.data?.id || payload?.id;
        const note = payload.note || payload?.data?.note;

        if (candidateId && note) {
          const candidateIndex = state.candidates.findIndex(c => c.id === candidateId);
          if (candidateIndex !== -1) {
            state.candidates[candidateIndex].notes.push(note as CandidateNote);
          }
          
          if (state.currentCandidate?.id === candidateId) {
            state.currentCandidate.notes.push(note as CandidateNote);
          }
        } else {
          // fallback: if payload is entire updated candidate, replace
          const updatedCandidate = payload?.data || payload;
          if (updatedCandidate?.id) {
            const idx = state.candidates.findIndex(c => c.id === updatedCandidate.id);
            if (idx !== -1) state.candidates[idx] = updatedCandidate;
            if (state.currentCandidate?.id === updatedCandidate.id) state.currentCandidate = updatedCandidate;
          }
        }
      });

    // Update candidate stage with timeline
    builder
      .addCase(updateCandidateStageWithTimeline.fulfilled, (state, action) => {
        // ✅ Handle MSW response structure
        const updatedCandidate = action.payload?.data || action.payload;
        if (updatedCandidate) {
          // Update in candidates array
          const candidateIndex = state.candidates.findIndex(c => c.id === updatedCandidate.id);
          if (candidateIndex !== -1) {
            state.candidates[candidateIndex] = updatedCandidate;
          }

          // Update in candidatesByStage
          Object.keys(state.candidatesByStage).forEach(stage => {
            state.candidatesByStage[stage] = state.candidatesByStage[stage]?.filter(c => c.id !== updatedCandidate.id) || [];
          });
          if (!state.candidatesByStage[updatedCandidate.stage]) {
            state.candidatesByStage[updatedCandidate.stage] = [];
          }
          state.candidatesByStage[updatedCandidate.stage].push(updatedCandidate);

          // Update current candidate if it's the same
          if (state.currentCandidate?.id === updatedCandidate.id) {
            state.currentCandidate = updatedCandidate;
          }
        }
      });
  }
});

export const { setFilters, setPagination, clearError } = candidatesSlice.actions;

// ✅ FIXED: Memoized selectors to prevent rerenders
export const selectCandidates = (state: { candidates: CandidatesState }) => state.candidates.candidates;
export const selectCurrentCandidate = (state: { candidates: CandidatesState }) => state.candidates.currentCandidate;
export const selectCandidatesLoading = (state: { candidates: CandidatesState }) => state.candidates.loading;
export const selectCandidatesError = (state: { candidates: CandidatesState }) => state.candidates.error;
export const selectCandidatesFilters = (state: { candidates: CandidatesState }) => state.candidates.filters;
export const selectCandidatesPagination = (state: { candidates: CandidatesState }) => state.candidates.pagination;
// NEW: detail loading selector
export const selectCandidateDetailLoading = (state: { candidates: CandidatesState }) => state.candidates.detailLoading;
export const selectCandidateDetailError = (state: { candidates: CandidatesState }) => state.candidates.detailError;

// ✅ FIXED: Use createSelector for memoization
export const selectPaginatedCandidates = createSelector(
  [selectCandidates, selectCandidatesPagination],
  (candidates, pagination) => ({
    candidates: candidates || [],
    totalCandidates: pagination.totalCandidates,
    totalPages: pagination.totalPages
  })
);

export const selectCandidatesByStage = (state: { candidates: CandidatesState }, jobId?: string) => {
  if (jobId) {
    const filteredByStage: { [stage: string]: Candidate[] } = {};
    Object.keys(state.candidates.candidatesByStage).forEach(stage => {
      filteredByStage[stage] = state.candidates.candidatesByStage[stage]?.filter(c => c.job_id === jobId) || [];
    });
    return filteredByStage;
  }
  return state.candidates.candidatesByStage;
};

export const selectCandidateById = (state: { candidates: CandidatesState }, candidateId: string): Candidate | undefined =>
  state.candidates.candidates?.find(candidate => candidate.id === candidateId) ||
  (state.candidates.currentCandidate?.id === candidateId ? state.candidates.currentCandidate : undefined);

export default candidatesSlice.reducer;

