import { useEffect, useState } from 'react';
import { useClinic } from '@/contexts/ClinicContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

export default function Display() {
  const { doctors, tokens, queueStats } = useClinic();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">
          Clinic Queue Display
        </h1>
        <div className="flex items-center justify-center gap-4 text-2xl text-muted-foreground">
          <Clock className="h-8 w-8" />
          <span>{currentTime.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Waiting Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <Card className="p-6 text-center bg-card/80 backdrop-blur">
          <div className="text-4xl font-bold text-foreground mb-2">{queueStats.totalWaiting}</div>
          <div className="text-xl text-muted-foreground">Total Waiting</div>
        </Card>
        <Card className="p-6 text-center bg-card/80 backdrop-blur">
          <div className="text-4xl font-bold text-foreground mb-2">{queueStats.gpWaiting}</div>
          <div className="text-xl text-muted-foreground">GP Patients</div>
        </Card>
        <Card className="p-6 text-center bg-card/80 backdrop-blur">
          <div className="text-4xl font-bold text-foreground mb-2">{queueStats.dentalWaiting}</div>
          <div className="text-xl text-muted-foreground">Dental Patients</div>
        </Card>
      </div>

      {/* Doctor Status Table */}
      <Card className="overflow-hidden bg-card/80 backdrop-blur">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary text-primary-foreground">
              <tr>
                <th className="px-8 py-6 text-left text-2xl font-bold">Doctor Name</th>
                <th className="px-8 py-6 text-left text-2xl font-bold">Cabin</th>
                <th className="px-8 py-6 text-left text-2xl font-bold">Status</th>
                <th className="px-8 py-6 text-left text-2xl font-bold">Currently Calling</th>
                <th className="px-8 py-6 text-left text-2xl font-bold">Next Token</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {doctors.map((doctor) => {
                const currentToken = getCurrentToken(doctor);
                const nextToken = getNextToken(doctor.id, doctor.serviceType);
                const breakTime = getBreakTimeRemaining(doctor);

                return (
                  <tr key={doctor.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-8 py-6 text-2xl font-semibold">{doctor.name}</td>
                    <td className="px-8 py-6">
                      <span className="text-3xl font-mono font-bold text-primary">
                        {doctor.cabinNumber}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      {doctor.status === 'active' && (
                        <Badge className="text-lg px-4 py-2 bg-status-active text-success-foreground">
                          Active
                        </Badge>
                      )}
                      {doctor.status === 'break' && (
                        <div className="space-y-1">
                          <Badge className="text-lg px-4 py-2 bg-status-break text-warning-foreground">
                            On Break
                          </Badge>
                          {breakTime && (
                            <div className="text-sm text-muted-foreground">{breakTime}</div>
                          )}
                        </div>
                      )}
                      {doctor.status === 'disabled' && (
                        <Badge className="text-lg px-4 py-2 bg-status-disabled text-destructive-foreground">
                          Unavailable
                        </Badge>
                      )}
                    </td>
                    <td className="px-8 py-6">
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
                    <td className="px-8 py-6">
                      {doctor.status === 'active' ? (
                        <span className="text-3xl font-mono font-semibold text-muted-foreground">
                          {nextToken}
                        </span>
                      ) : (
                        <span className="text-2xl text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
