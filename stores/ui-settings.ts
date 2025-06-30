import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface UISettingsState {
  // Dashboard settings
  showCharts: boolean;
  
  // Actions
  setShowCharts: (show: boolean) => void;
  toggleShowCharts: () => void;
}

export const useUISettingsStore = create<UISettingsState>()(
  persist(
    (set, get) => ({
      // Initial state
      showCharts: true,

      // Actions
      setShowCharts: (show: boolean) => {
        console.log('UISettingsStore: Setting show charts to:', show);
        set({ showCharts: show });
      },

      toggleShowCharts: () => {
        const { showCharts } = get();
        const newValue = !showCharts;
        console.log('UISettingsStore: Toggling show charts to:', newValue);
        set({ showCharts: newValue });
      },
    }),
    {
      name: 'ui-settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Persist all UI settings
      partialize: (state) => ({ 
        showCharts: state.showCharts
      }),
    }
  )
);

// Helper hooks for common patterns
export const useShowCharts = () => useUISettingsStore((state) => state.showCharts);
export const useChartsToggle = () => useUISettingsStore((state) => state.toggleShowCharts);
