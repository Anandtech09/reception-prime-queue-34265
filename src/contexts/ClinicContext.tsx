import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Doctor, Token, ServiceType, DoctorStatus, QueueStats } from '@/types/clinic';
import { toast } from '@/hooks/use-toast';

interface ClinicContextType {
  doctors: Doctor[];
  tokens: Token[];
  haltedTokens: Token[];
  queueStats: QueueStats;
  generateToken: (patientName: string, patientId: string, serviceType: ServiceType, specificDoctorId?: string) => void;
  updateDoctorStatus: (doctorId: string, status: DoctorStatus, breakDuration?: number) => void;
  callNextPatient: (doctorId: string) => void;
  markPatientVisited: (tokenId: string) => void;
  markPatientHalted: (tokenId: string) => void;
  requeuePatient: (tokenId: string) => void;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

const initialDoctors: Doctor[] = [
  { id: 'gp1', name: 'Dr. Sarah Johnson', cabinNumber: '101', serviceType: 'GP', status: 'active' },
  { id: 'gp2', name: 'Dr. Michael Chen', cabinNumber: '102', serviceType: 'GP', status: 'active' },
  { id: 'gp3', name: 'Dr. Emily Brown', cabinNumber: '103', serviceType: 'GP', status: 'active' },
  { id: 'dental1', name: 'Dr. James Wilson', cabinNumber: '201', serviceType: 'DENTAL', status: 'active' },
  { id: 'dental2', name: 'Dr. Lisa Anderson', cabinNumber: '202', serviceType: 'DENTAL', status: 'active' },
];

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [haltedTokens, setHaltedTokens] = useState<Token[]>([]);
  const [tokenCounters, setTokenCounters] = useState({ GP: 0, DENTAL: 0 });

  const calculateQueueStats = useCallback((): QueueStats => {
    const waitingTokens = tokens.filter(t => t.status === 'waiting');
    return {
      totalWaiting: waitingTokens.length,
      gpWaiting: waitingTokens.filter(t => t.serviceType === 'GP').length,
      dentalWaiting: waitingTokens.filter(t => t.serviceType === 'DENTAL').length,
    };
  }, [tokens]);

  const queueStats = calculateQueueStats();

  const generateToken = useCallback((patientName: string, patientId: string, serviceType: ServiceType, specificDoctorId?: string) => {
    const newCounter = tokenCounters[serviceType] + 1;
    setTokenCounters(prev => ({ ...prev, [serviceType]: newCounter }));

    const tokenNumber = `${serviceType}-${String(newCounter).padStart(3, '0')}`;
    
    const newToken: Token = {
      id: `token-${Date.now()}`,
      tokenNumber,
      patientName,
      patientId,
      serviceType,
      status: 'waiting',
      assignedDoctorId: specificDoctorId, // Only set if specific doctor selected
      isSpecificDoctor: !!specificDoctorId, // True only if specific doctor
      createdAt: new Date(),
    };

    setTokens(prev => {
      const updated = [...prev, newToken];
      console.log('Token generated:', newToken, 'Total tokens:', updated.length);
      return updated;
    });
    
    toast({
      title: "Token Generated",
      description: `${tokenNumber} issued for ${patientName}`,
    });
  }, [tokenCounters]);

  const updateDoctorStatus = useCallback((doctorId: string, status: DoctorStatus, breakDuration?: number) => {
    setDoctors(prev => prev.map(doc => {
      if (doc.id !== doctorId) return doc;

      const breakEndTime = breakDuration ? new Date(Date.now() + breakDuration * 60000) : undefined;

      // Redistribute tokens if doctor going on break
      if (status !== 'active' && doc.status === 'active') {
        const doctorTokens = tokens.filter(t => 
          t.assignedDoctorId === doctorId && 
          t.status === 'waiting' &&
          t.isSpecificDoctor
        );

        if (doctorTokens.length > 0) {
          const activeDoctors = prev.filter(d => 
            d.id !== doctorId && 
            d.serviceType === doc.serviceType && 
            d.status === 'active'
          );

          if (activeDoctors.length > 0) {
            setTokens(prevTokens => prevTokens.map(token => {
              if (doctorTokens.some(dt => dt.id === token.id)) {
                const targetDoctor = activeDoctors[Math.floor(Math.random() * activeDoctors.length)];
                return { ...token, assignedDoctorId: targetDoctor.id };
              }
              return token;
            }));
          }
        }
      }

      return { ...doc, status, breakEndTime, currentToken: status !== 'active' ? undefined : doc.currentToken };
    }));

    toast({
      title: "Doctor Status Updated",
      description: `Doctor status changed to ${status}`,
    });
  }, [tokens]);

  const callNextPatient = useCallback((doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor || doctor.status !== 'active') return;

    // Priority 1: Check dedicated queue (specific doctor requests)
    const dedicatedToken = tokens.find(t => 
      t.assignedDoctorId === doctorId && 
      t.status === 'waiting' &&
      t.isSpecificDoctor === true
    );

    // Priority 2: Check central queue (no specific doctor)
    const centralToken = tokens.find(t => 
      t.serviceType === doctor.serviceType && 
      t.status === 'waiting' &&
      t.isSpecificDoctor === false &&
      !t.assignedDoctorId
    );

    const nextToken = dedicatedToken || centralToken;
    
    console.log('Calling next patient for', doctor.name, {
      dedicatedToken,
      centralToken,
      nextToken,
      allWaitingTokens: tokens.filter(t => t.status === 'waiting')
    });

    if (!nextToken) {
      toast({
        title: "No Patients",
        description: "No patients in queue",
        variant: "destructive",
      });
      return;
    }

    setTokens(prev => prev.map(t => 
      t.id === nextToken.id 
        ? { ...t, status: 'calling' as const, assignedDoctorId: doctorId, calledAt: new Date() }
        : t
    ));

    setDoctors(prev => prev.map(d => 
      d.id === doctorId 
        ? { ...d, currentToken: nextToken.tokenNumber }
        : d
    ));

    toast({
      title: "Patient Called",
      description: `${nextToken.tokenNumber} - ${nextToken.patientName} to Cabin ${doctor.cabinNumber}`,
    });
  }, [doctors, tokens]);

  const markPatientVisited = useCallback((tokenId: string) => {
    const token = tokens.find(t => t.id === tokenId);
    if (!token) return;

    setTokens(prev => prev.map(t => 
      t.id === tokenId 
        ? { ...t, status: 'visited' as const, visitedAt: new Date() }
        : t
    ));

    setDoctors(prev => prev.map(d => 
      d.id === token.assignedDoctorId 
        ? { ...d, currentToken: undefined }
        : d
    ));

    toast({
      title: "Patient Completed",
      description: `${token.tokenNumber} marked as visited`,
    });
  }, [tokens]);

  const markPatientHalted = useCallback((tokenId: string) => {
    const token = tokens.find(t => t.id === tokenId);
    if (!token) return;

    setTokens(prev => prev.filter(t => t.id !== tokenId));
    setHaltedTokens(prev => [...prev, { ...token, status: 'halted' as const }]);

    setDoctors(prev => prev.map(d => 
      d.id === token.assignedDoctorId 
        ? { ...d, currentToken: undefined }
        : d
    ));

    toast({
      title: "Patient Halted",
      description: `${token.tokenNumber} moved to halted pool`,
      variant: "destructive",
    });
  }, [tokens]);

  const requeuePatient = useCallback((tokenId: string) => {
    const token = haltedTokens.find(t => t.id === tokenId);
    if (!token) return;

    setHaltedTokens(prev => prev.filter(t => t.id !== tokenId));
    setTokens(prev => [...prev, { ...token, status: 'waiting' as const, assignedDoctorId: undefined }]);

    toast({
      title: "Patient Re-queued",
      description: `${token.tokenNumber} added back to queue`,
    });
  }, [haltedTokens]);

  // Auto-restore doctors from break
  useEffect(() => {
    const interval = setInterval(() => {
      setDoctors(prev => prev.map(doc => {
        if (doc.status === 'break' && doc.breakEndTime && new Date() >= doc.breakEndTime) {
          toast({
            title: "Break Completed",
            description: `${doc.name} is now active`,
          });
          return { ...doc, status: 'active' as const, breakEndTime: undefined };
        }
        return doc;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ClinicContext.Provider
      value={{
        doctors,
        tokens,
        haltedTokens,
        queueStats,
        generateToken,
        updateDoctorStatus,
        callNextPatient,
        markPatientVisited,
        markPatientHalted,
        requeuePatient,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within ClinicProvider');
  }
  return context;
};
