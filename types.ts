
export enum WAStatus {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  WAITING_SCAN = 'WAITING SCAN',
  INITIALIZING = 'INITIALIZING'
}

export interface AntiBanConfig {
  minDelay: number;
  maxDelay: number;
  dailyLimit: number;
  rotateTemplates: boolean;
  humanTypingSimulation: boolean;
}

export interface Branch {
  id: string;
  name: string;
  phone: string;
  status: WAStatus;
  lastActive: Date;
  location: string;
  antiBan: AntiBanConfig;
}

export interface MessageLog {
  id: string;
  timestamp: Date;
  to: string;
  name: string;
  resi: string;
  status: string;
  deliveryType: string;
  result: 'SUCCESS' | 'FAILED' | 'PENDING';
  cost: number;
  branchId: string;
}

export interface SupabaseConfig {
  url: string;
  key: string;
  table: string;
  isEnabled: boolean;
}

export interface SystemHealth {
  cpu: number;
  ram: number;
  uptime: string;
  latency: number;
}
