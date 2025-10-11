import { Doctor } from '@/types/clinic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { Clock, Phone, XCircle } from 'lucide-react';
import { useClinic } from '@/contexts/ClinicContext';

interface DoctorCardProps {
  doctor: Doctor;
  onUpdateStatus: (doctorId: string) => void;
  onCallNext: (doctorId: string) => void;
}

export const DoctorCard = ({ doctor, onUpdateStatus, onCallNext }: DoctorCardProps) => {
  const { tokens } = useClinic();
  const currentToken = tokens.find(t => t.tokenNumber === doctor.currentToken);

  const getBreakTimeRemaining = () => {
    if (!doctor.breakEndTime) return null;
    const remaining = Math.ceil((doctor.breakEndTime.getTime() - Date.now()) / 60000);
    return remaining > 0 ? remaining : null;
  };

  const breakTime = getBreakTimeRemaining();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{doctor.name}</CardTitle>
          <StatusBadge status={doctor.status} />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-mono font-semibold text-primary">Cabin {doctor.cabinNumber}</span>
          <span className="text-xs">•</span>
          <span>{doctor.serviceType}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {currentToken && (
          <div className="p-3 bg-status-calling/10 rounded-lg border border-status-calling/30">
            <div className="text-xs text-muted-foreground mb-1">Currently Calling</div>
            <div className="font-mono text-lg font-bold text-status-calling">
              {currentToken.tokenNumber}
            </div>
            <div className="text-sm text-muted-foreground mt-1">{currentToken.patientName}</div>
          </div>
        )}

        {breakTime && (
          <div className="flex items-center gap-2 text-sm text-warning p-2 bg-warning/10 rounded">
            <Clock className="h-4 w-4" />
            <span>Back in {breakTime} min</span>
          </div>
        )}

        <div className="flex gap-2">
          {doctor.status === 'active' && (
            <>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => onCallNext(doctor.id)}
                disabled={!!currentToken}
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Next
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateStatus(doctor.id)}
              >
                <Clock className="h-4 w-4" />
              </Button>
            </>
          )}
          {doctor.status !== 'active' && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onUpdateStatus(doctor.id)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Update Status
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
