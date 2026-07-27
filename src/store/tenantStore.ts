import { create } from 'zustand';
import { apiClient } from '../api/axios';

interface TenantState {
  tenant: string | null;
  schoolId: string | null;
  schoolName: string | null;
  logoUrl: string | null;
  isLoading: boolean;
  error: string | null;
  
  setTenant: (tenant: string | null) => void;
  fetchTenantDetails: (subdomain: string) => Promise<void>;
}

export const useTenantStore = create<TenantState>((set) => ({
  tenant: null,
  schoolId: null,
  schoolName: null,
  logoUrl: null,
  isLoading: false,
  error: null,
  
  setTenant: (tenant) => set({ tenant }),
  
  fetchTenantDetails: async (subdomain: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get(`/schools/domain/${subdomain}`);
      
      if (response.data.success && response.data.data) {
        const schoolData = response.data.data;
        set({ 
          schoolId: schoolData.id || schoolData.schoolId,
          schoolName: schoolData.name || schoolData.basicInfo?.name,
          logoUrl: typeof schoolData.logoUrl === 'string' ? schoolData.logoUrl : (schoolData.logoUrl?.url || null),
          tenant: subdomain,
          isLoading: false 
        });
      } else {
        set({ error: 'School details not found in response', isLoading: false });
      }
    } catch (err: any) {
      set({ 
        error: err.response?.data?.message || 'Failed to fetch school details', 
        isLoading: false 
      });
    }
  },
}));
