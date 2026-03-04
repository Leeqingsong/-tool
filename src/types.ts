export interface Unit {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
}

export interface Device {
  id: string;
  unitId: string;
  name: string;
  type: string;
  url: string;
  username: string;
  password?: string;
  notes?: string;
  isInspected?: boolean;
  createdAt: number;
}

declare global {
  interface Window {
    electronAPI?: {
      openDevice: (data: any) => Promise<{success: boolean, message: string}>;
    };
  }
}
