import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../api/axios';

export interface AcademicSession {
  id: string;
  title: string;
  createdAt: string;
  status: {
    title: string;
  };
}

interface SessionState {
  sessions: AcademicSession[];
  activeSessionId: string | null;
  isLoading: boolean;
  error: string | null;
  
  setActiveSessionId: (id: string) => void;
  fetchSessions: () => Promise<void>;
  clearSessions: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      sessions: [],
      activeSessionId: null,
      isLoading: false,
      error: null,
      
      setActiveSessionId: (id) => set({ activeSessionId: id }),
      
      fetchSessions: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.get('/academic-sessions');
          
          if (response.data.success && response.data.data) {
            const fetchedSessions: AcademicSession[] = response.data.data;
            
            // Find the active session
            const activeSession = fetchedSessions.find(s => s.status.title === 'ACTIVE');
            const activeSessionId = activeSession ? activeSession.id : (fetchedSessions[0]?.id || null);
            
            set({ 
              sessions: fetchedSessions,
              activeSessionId,
              isLoading: false 
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
      
      clearSessions: () => set({ sessions: [], activeSessionId: null, error: null }),
    }),
    {
      name: 'session-storage', // Persist session context across reloads
    }
  )
);
