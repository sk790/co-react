import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../api/axios';

export interface AcademicSession {
  id: string;
  title: string;
  startDate?: string;
  endDate?: string;
  statusId?: string;
  createdAt: string;
  status: {
    id?: string;
    title: string;
  };
}

export interface CreateSessionInput {
  title: string;
  startDate: string;
  endDate: string;
  statusId: string;
}

interface SessionState {
  sessions: AcademicSession[];
  activeSessionId: string | null;
  isLoading: boolean;
  error: string | null;
  
  setActiveSessionId: (id: string) => void;
  fetchSessions: () => Promise<void>;
  createSession: (data: CreateSessionInput) => Promise<AcademicSession>;
  deleteSession: (id: string) => Promise<void>;
  clearSessions: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSessionId: null,
      isLoading: false,
      error: null,
      
      setActiveSessionId: (id) => {
        const currentActiveId = get().activeSessionId;
        if (currentActiveId !== id) {
          set({ activeSessionId: id });
          window.location.reload();
        }
      },
      
      fetchSessions: async () => {
        if (get().isLoading) return;
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.get('/academic-sessions');
          
          if (response.data.success && response.data.data) {
            const fetchedSessions: AcademicSession[] = response.data.data;
            
            set((state) => {
              const currentActiveExists = fetchedSessions.some(s => s.id === state.activeSessionId);
              let activeSessionId = state.activeSessionId;

              if (!currentActiveExists || !activeSessionId) {
                const activeSession = fetchedSessions.find(s => s.status?.title === 'ACTIVE');
                activeSessionId = activeSession ? activeSession.id : (fetchedSessions[0]?.id || null);
              }

              return { 
                sessions: fetchedSessions,
                activeSessionId,
                isLoading: false 
              };
            });
          } else {
            set({ error: 'Failed to fetch sessions', isLoading: false });
          }
        } catch (err: any) {
          set({ 
            error: err.response?.data?.message || 'Error loading academic sessions', 
            isLoading: false 
          });
        }
      },

      createSession: async (data: CreateSessionInput) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post('/academic-sessions', data);
          if (response.data.success && response.data.data) {
            const newSession = response.data.data;
            await get().fetchSessions();
            return newSession;
          } else {
            throw new Error(response.data.message || 'Failed to create session');
          }
        } catch (err: any) {
          const errorMsg = err.response?.data?.message || err.message || 'Error creating academic session';
          set({ error: errorMsg, isLoading: false });
          throw new Error(errorMsg);
        }
      },

      deleteSession: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.delete(`/academic-sessions/${id}`);
          if (response.data.success) {
            await get().fetchSessions();
          } else {
            throw new Error(response.data.message || 'Failed to delete session');
          }
        } catch (err: any) {
          const errorMsg = err.response?.data?.message || err.message || 'Error deleting session';
          set({ error: errorMsg, isLoading: false });
          throw new Error(errorMsg);
        }
      },
      
      clearSessions: () => set({ sessions: [], activeSessionId: null, error: null }),
    }),
    {
      name: 'session-storage', // Persist session context across reloads
    }
  )
);
