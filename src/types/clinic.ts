export type ServiceType = 'GP' | 'DENTAL';

export type DoctorStatus = 'active' | 'break' | 'disabled';

export type TokenStatus = 'waiting' | 'calling' | 'visited' | 'halted';

export interface Doctor {
  id: string;
  name: string;
  cabinNumber: string;
  serviceType: ServiceType;
  status: DoctorStatus;
  breakEndTime?: Date;
  currentToken?: string;
}

export interface Token {
  id: string;
  tokenNumber: string;
  patientName: string;
  patientId: string;
  serviceType: ServiceType;
  status: TokenStatus;
  assignedDoctorId?: string;
  isSpecificDoctor: boolean;
  createdAt: Date;
  calledAt?: Date;
  visitedAt?: Date;
}

export interface QueueStats {
  totalWaiting: number;
  gpWaiting: number;
  dentalWaiting: number;
}
