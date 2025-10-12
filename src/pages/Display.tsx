import { useEffect, useState, useRef } from 'react';
import { useClinic } from '@/contexts/ClinicContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Display() {
  const { doctors, tokens, queueStats } = useClinic();
  const [currentTime, setCurrentTime] = useState(new Date());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousCallingTokens = useRef<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Play sound when new patient is called
  useEffect(() => {
    const currentCallingTokens = tokens
      .filter(t => t.status === 'calling')
      .map(t => t.id);

    const newCallingTokens = currentCallingTokens.filter(
      id => !previousCallingTokens.current.includes(id)
    );

    if (newCallingTokens.length > 0) {
      // Play alert sound
      if (!audioRef.current) {
        audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+mdryz3guBSh+zPLaizsIGGS57OihUBELTKXh8bllHAU2jdXzzn0pBSd/z/LZijYIGmW67Od9Lg==');
      }
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }

    previousCallingTokens.current = currentCallingTokens;
  }, [tokens]);

  const gpDoctors = doctors.filter(d => d.serviceType === 'GP');
  const dentalDoctors = doctors.filter(d => d.serviceType === 'DENTAL');

  const getCurrentToken = (doctor: any) => {
    const callingToken = tokens.find(t => 
      t.assignedDoctorId === doctor.id && 
      t.status === 'calling'
    );
    return callingToken?.tokenNumber || '-';
  };

  const getBreakTimeRemaining = (doctor: any) => {
    if (!doctor.breakEndTime) return null;
    const remaining = Math.ceil((doctor.breakEndTime.getTime() - Date.now()) / 60000);
    return remaining > 0 ? `Back in ${remaining} min` : null;
  };

  const getServiceQueueCount = (serviceType: string) => {
    return tokens.filter(t => 
      t.serviceType === serviceType && 
      t.status === 'waiting'
    ).length;
  };

  const DoctorTable = ({ doctors, title }: { doctors: any[], title: string }) => (
    <div className="mb-8">
      <h2 className="text-4xl font-bold text-primary mb-4 px-2">{title}</h2>
      <Card className="overflow-hidden bg-card/90 backdrop-blur">
        <table className="w-full">
          <thead className="bg-primary text-primary-foreground">
            <tr>
              <th className="px-6 py-4 text-left text-xl font-bold">Doctor</th>
              <th className="px-6 py-4 text-left text-xl font-bold">Cabin</th>
              <th className="px-6 py-4 text-left text-xl font-bold">Status</th>
              <th className="px-6 py-4 text-center text-xl font-bold">Now Calling</th>
              <th className="px-6 py-4 text-center text-xl font-bold">Queue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {doctors.map((doctor) => {
              const currentToken = getCurrentToken(doctor);
              const queueCount = getServiceQueueCount(doctor.serviceType);
              const breakTime = getBreakTimeRemaining(doctor);

              return (
                <tr key={doctor.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-5 text-xl font-semibold">{doctor.name}</td>
                  <td className="px-6 py-5">
                    <span className="text-3xl font-mono font-bold text-primary">
                      {doctor.cabinNumber}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    {doctor.status === 'active' && (
                      <Badge className="text-base px-3 py-1 bg-status-active text-success-foreground">
                        Active
                      </Badge>
                    )}
                    {doctor.status === 'break' && (
                      <div className="space-y-1">
                        <Badge className="text-base px-3 py-1 bg-status-break text-warning-foreground">
                          On Break
                        </Badge>
                        {breakTime && (
                          <div className="text-xs text-muted-foreground">{breakTime}</div>
                        )}
                      </div>
                    )}
                    {doctor.status === 'disabled' && (
                      <Badge className="text-base px-3 py-1 bg-status-disabled text-destructive-foreground">
                        Unavailable
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-5 text-center">
                    {doctor.status === 'active' ? (
                      <span className={`text-5xl font-mono font-bold ${
                        currentToken !== '-' ? 'text-status-calling animate-pulse' : 'text-muted-foreground'
                      }`}>
                        {currentToken}
                      </span>
                    ) : (
                      <span className="text-2xl text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-3xl font-bold text-primary">
                      {queueCount}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6">
      {/* Compact Header */}
      <div className="bg-card/80 backdrop-blur rounded-lg px-6 py-3 mb-6 shadow-sm">
        <div className="flex items-center justify-between">
          {/* Date and Time */}
          <div className="flex items-center gap-6">
            <div className="text-lg text-muted-foreground">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
            <div className="text-2xl font-mono font-bold text-foreground">
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit'
              })}
            </div>
          </div>
          
          {/* Waiting Stats - Inline */}
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">GP Queue</div>
              <div className="text-2xl font-bold text-primary">{queueStats.gpWaiting}</div>
            </div>
            <div className="h-8 w-px bg-border"></div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Dental Queue</div>
              <div className="text-2xl font-bold text-primary">{queueStats.dentalWaiting}</div>
            </div>
            <div className="h-8 w-px bg-border"></div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Total Waiting</div>
              <div className="text-3xl font-bold text-accent">{queueStats.totalWaiting}</div>
            </div>
          </div>
        </div>
      </div>

      {/* GP Doctors Table */}
      {gpDoctors.length > 0 && (
        <DoctorTable doctors={gpDoctors} title="General Practitioners" />
      )}

      {/* Dental Doctors Table */}
      {dentalDoctors.length > 0 && (
        <DoctorTable doctors={dentalDoctors} title="Dental Department" />
      )}
    </div>
  );
}
