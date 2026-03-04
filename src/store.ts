import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Unit, Device } from './types';

interface AppState {
  units: Unit[];
  devices: Device[];
  selectedUnitId: string | null;
  addUnit: (unit: Omit<Unit, 'id' | 'createdAt'>) => void;
  updateUnit: (id: string, unit: Partial<Unit>) => void;
  deleteUnit: (id: string) => void;
  addDevice: (device: Omit<Device, 'id' | 'createdAt'>) => void;
  updateDevice: (id: string, device: Partial<Device>) => void;
  deleteDevice: (id: string) => void;
  toggleInspected: (id: string) => void;
  setSelectedUnitId: (id: string | null) => void;
  importData: (units: Unit[], devices: Device[]) => void;
  preferredBrowser: 'default' | 'chrome' | 'firefox' | 'edge';
  setPreferredBrowser: (browser: 'default' | 'chrome' | 'firefox' | 'edge') => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      units: [],
      devices: [],
      selectedUnitId: null,
      preferredBrowser: 'default',

      addUnit: (unitData) => set((state) => ({
        units: [...state.units, { ...unitData, id: generateId(), createdAt: Date.now() }]
      })),

      updateUnit: (id, unitData) => set((state) => ({
        units: state.units.map(u => u.id === id ? { ...u, ...unitData } : u)
      })),

      deleteUnit: (id) => set((state) => ({
        units: state.units.filter(u => u.id !== id),
        devices: state.devices.filter(d => d.unitId !== id),
        selectedUnitId: state.selectedUnitId === id ? null : state.selectedUnitId
      })),

      addDevice: (deviceData) => set((state) => ({
        devices: [...state.devices, { ...deviceData, id: generateId(), createdAt: Date.now() }]
      })),

      updateDevice: (id, deviceData) => set((state) => ({
        devices: state.devices.map(d => d.id === id ? { ...d, ...deviceData } : d)
      })),

      deleteDevice: (id) => set((state) => ({
        devices: state.devices.filter(d => d.id !== id)
      })),

      toggleInspected: (id) => set((state) => ({
        devices: state.devices.map(d => d.id === id ? { ...d, isInspected: !d.isInspected } : d)
      })),

      setSelectedUnitId: (id) => set({ selectedUnitId: id }),

      importData: (newUnits, newDevices) => set((state) => ({
        units: [...state.units, ...newUnits],
        devices: [...state.devices, ...newDevices]
      })),

      setPreferredBrowser: (browser) => set({ preferredBrowser: browser })
    }),
    {
      name: 'secupatrol-storage',
    }
  )
);
