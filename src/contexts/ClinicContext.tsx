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

const STORAGE_KEY = 'clinic_state';
const CHANNEL_NAME = 'clinic_sync';

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from localStorage
  const loadState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          doctors: parsed.doctors.map((d: any) => ({
            ...d,
            breakEndTime: d.breakEndTime ? new Date(d.breakEndTime) : undefined
          })),
          tokens: parsed.tokens.map((t: any) => ({
            ...t,
            createdAt: new Date(t.createdAt),
            calledAt: t.calledAt ? new Date(t.calledAt) : undefined,
            visitedAt: t.visitedAt ? new Date(t.visitedAt) : undefined
          })),
          haltedTokens: parsed.haltedTokens.map((t: any) => ({
            ...t,
            createdAt: new Date(t.createdAt),
            calledAt: t.calledAt ? new Date(t.calledAt) : undefined,
            visitedAt: t.visitedAt ? new Date(t.visitedAt) : undefined
          })),
          tokenCounters: parsed.tokenCounters
        };
      }
    } catch (e) {
      console.error('Failed to load state:', e);
    }
    return null;
  };

  const savedState = loadState();
  const [doctors, setDoctors] = useState<Doctor[]>(savedState?.doctors || initialDoctors);
  const [tokens, setTokens] = useState<Token[]>(savedState?.tokens || []);
  const [haltedTokens, setHaltedTokens] = useState<Token[]>(savedState?.haltedTokens || []);
  const [tokenCounters, setTokenCounters] = useState(savedState?.tokenCounters || { GP: 0, DENTAL: 0 });

  // BroadcastChannel for cross-tab communication
  const [broadcastChannel] = useState(() => {
    try {
      return new BroadcastChannel(CHANNEL_NAME);
    } catch (e) {
      console.log('BroadcastChannel not supported, using localStorage polling');
      return null;
    }
  });

  // Save state to localStorage and broadcast to other tabs
  useEffect(() => {
    const state = { doctors, tokens, haltedTokens, tokenCounters };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    
    // Broadcast to other tabs using BroadcastChannel
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'STATE_UPDATE', state });
    }
  }, [doctors, tokens, haltedTokens, tokenCounters, broadcastChannel]);

  // Listen for updates from other tabs
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'STATE_UPDATE') {
        const state = event.data.state;
        if (state) {
          setDoctors(state.doctors.map((d: any) => ({
            ...d,
            breakEndTime: d.breakEndTime ? new Date(d.breakEndTime) : undefined
          })));
          setTokens(state.tokens.map((t: any) => ({
            ...t,
            createdAt: new Date(t.createdAt),
            calledAt: t.calledAt ? new Date(t.calledAt) : undefined,
            visitedAt: t.visitedAt ? new Date(t.visitedAt) : undefined
          })));
          setHaltedTokens(state.haltedTokens.map((t: any) => ({
            ...t,
            createdAt: new Date(t.createdAt),
            calledAt: t.calledAt ? new Date(t.calledAt) : undefined,
            visitedAt: t.visitedAt ? new Date(t.visitedAt) : undefined
          })));
          setTokenCounters(state.tokenCounters);
        }
      }
    };

    if (broadcastChannel) {
      broadcastChannel.addEventListener('message', handleMessage);
      return () => {
        broadcastChannel.removeEventListener('message', handleMessage);
      };
    } else {
      // Fallback: Poll localStorage every 500ms
      const interval = setInterval(() => {
        const state = loadState();
        if (state) {
          setDoctors(state.doctors);
          setTokens(state.tokens);
          setHaltedTokens(state.haltedTokens);
          setTokenCounters(state.tokenCounters);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [broadcastChannel]);

  // Cleanup BroadcastChannel on unmount
  useEffect(() => {
    return () => {
      if (broadcastChannel) {
        broadcastChannel.close();
      }
    };
  }, [broadcastChannel]);

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
    
    // Find the least busy active doctor to assign
    const activeDoctorsOfType = doctors.filter(d => 
      d.serviceType === serviceType && 
      d.status === 'active'
    );

    let assignedDoctorId = specificDoctorId;
    
    // If no specific doctor selected, auto-assign to least busy active doctor
    if (!specificDoctorId && activeDoctorsOfType.length > 0) {
      // Count waiting tokens for each doctor
      const doctorQueueCounts = activeDoctorsOfType.map(doctor => ({
        doctorId: doctor.id,
        queueCount: tokens.filter(t => 
          t.assignedDoctorId === doctor.id && 
          t.status === 'waiting'
        ).length
      }));
      
      // Find doctor with smallest queue
      const leastBusyDoctor = doctorQueueCounts.reduce((min, curr) => 
        curr.queueCount < min.queueCount ? curr : min
      );
      
      assignedDoctorId = leastBusyDoctor.doctorId;
    }
    
    const newToken: Token = {
      id: `token-${Date.now()}`,
      tokenNumber,
      patientName,
      patientId,
      serviceType,
      status: 'waiting',
      assignedDoctorId,
      isSpecificDoctor: !!specificDoctorId,
      createdAt: new Date(),
    };

    setTokens(prev => {
      const updated = [...prev, newToken];
      console.log('Token generated and assigned:', newToken);
      return updated;
    });
    
    toast({
      title: "Token Generated",
      description: `${tokenNumber} issued for ${patientName}`,
    });
  }, [tokenCounters, doctors, tokens]);

  const updateDoctorStatus = useCallback((doctorId: string, status: DoctorStatus, breakDuration?: number) => {
    setDoctors(prev => prev.map(doc => {
      if (doc.id !== doctorId) return doc;

      const breakEndTime = breakDuration ? new Date(Date.now() + breakDuration * 60000) : undefined;

      // Intelligently redistribute ALL waiting tokens if doctor going on break/disabled
      if (status !== 'active' && doc.status === 'active') {
        const doctorWaitingTokens = tokens.filter(t => 
          t.assignedDoctorId === doctorId && 
          t.status === 'waiting'
        );

        if (doctorWaitingTokens.length > 0) {
          const activeDoctors = prev.filter(d => 
            d.id !== doctorId && 
            d.serviceType === doc.serviceType && 
            d.status === 'active'
          );

          if (activeDoctors.length > 0) {
            // Count current queue sizes for each active doctor
            const doctorQueueCounts = activeDoctors.map(doctor => ({
              doctorId: doctor.id,
              queueCount: tokens.filter(t => 
                t.assignedDoctorId === doctor.id && 
                t.status === 'waiting'
              ).length
            }));

            setTokens(prevTokens => prevTokens.map(token => {
              if (doctorWaitingTokens.some(dt => dt.id === token.id)) {
                // Assign to least busy doctor
                const leastBusyDoctor = doctorQueueCounts.reduce((min, curr) => 
                  curr.queueCount < min.queueCount ? curr : min
                );
                
                // Update the count for next assignment
                const doctorIndex = doctorQueueCounts.findIndex(d => d.doctorId === leastBusyDoctor.doctorId);
                if (doctorIndex !== -1) {
                  doctorQueueCounts[doctorIndex].queueCount++;
                }
                
                console.log(`Redistributing ${token.tokenNumber} to least busy doctor`);
                return { ...token, assignedDoctorId: leastBusyDoctor.doctorId, isSpecificDoctor: false };
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

    // Find next waiting patient in this doctor's queue (oldest first)
    const nextToken = tokens
      .filter(t => 
        t.assignedDoctorId === doctorId && 
        t.status === 'waiting'
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];

    if (!nextToken) {
      toast({
        title: "No Patients",
        description: "No patients in this doctor's queue",
        variant: "destructive",
      });
      return;
    }

    setTokens(prev => prev.map(t => 
      t.id === nextToken.id 
        ? { ...t, status: 'calling' as const, calledAt: new Date() }
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
