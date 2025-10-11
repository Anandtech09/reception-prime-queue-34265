import { useEffect, useState } from 'react';
import { useClinic } from '@/contexts/ClinicContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Display() {
  const { doctors, tokens, queueStats } = useClinic();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const gpDoctors = doctors.filter(d => d.serviceType === 'GP');
  const dentalDoctors = doctors.filter(d => d.serviceType === 'DENTAL');

  const getNextToken = (doctorId: string, serviceType: string) => {
    const waitingTokens = tokens.filter(t => 
      t.status === 'waiting' && 
      t.serviceType === serviceType &&
      (!t.assignedDoctorId || t.assignedDoctorId === doctorId)
    );
    return waitingTokens[0]?.tokenNumber || '-';
  };

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
              <th className="px-6 py-4 text-left text-xl font-bold">Now Calling</th>
              <th className="px-6 py-4 text-left text-xl font-bold">Next</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {doctors.map((doctor) => {
              const currentToken = getCurrentToken(doctor);
              const nextToken = getNextToken(doctor.id, doctor.serviceType);
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
                  <td className="px-6 py-5">
                    {doctor.status === 'active' ? (
                      <span className={`text-4xl font-mono font-bold ${
                        currentToken !== '-' ? 'text-status-calling animate-pulse' : 'text-muted-foreground'
                      }`}>
                        {currentToken}
                      </span>
                    ) : (
                      <span className="text-2xl text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    {doctor.status === 'active' ? (
                      <span className="text-2xl font-mono font-semibold text-muted-foreground">
                        {nextToken}
                      </span>
                    ) : (
                      <span className="text-xl text-muted-foreground">-</span>
                    )}
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
      {/* Header with Date/Time */}
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-8">
          <div className="text-2xl font-semibold text-primary">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <div className="text-4xl font-bold font-mono text-foreground">
            {currentTime.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
        </div>
        
        {/* Waiting Stats */}
        <div className="flex items-center gap-4">
          <Card className="px-6 py-3 bg-card/90 backdrop-blur">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">{queueStats.gpWaiting}</div>
              <div className="text-sm text-muted-foreground">GP Waiting</div>
            </div>
          </Card>
          <Card className="px-6 py-3 bg-card/90 backdrop-blur">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">{queueStats.dentalWaiting}</div>
              <div className="text-sm text-muted-foreground">Dental Waiting</div>
            </div>
          </Card>
          <Card className="px-6 py-3 bg-accent/20 backdrop-blur border-accent">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">{queueStats.totalWaiting}</div>
              <div className="text-sm text-muted-foreground font-semibold">Total</div>
            </div>
          </Card>
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
