import { useState } from 'react';
import { useClinic } from '@/contexts/ClinicContext';
import { TokenGenerationForm } from '@/components/TokenGenerationForm';
import { DoctorCard } from '@/components/DoctorCard';
import { QueueTable } from '@/components/QueueTable';
import { HaltedQueue } from '@/components/HaltedQueue';
import { DoctorStatusDialog } from '@/components/DoctorStatusDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Stethoscope, Pill } from 'lucide-react';

export default function Receptionist() {
  const { doctors, queueStats, updateDoctorStatus, callNextPatient } = useClinic();
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');

  const gpDoctors = doctors.filter(d => d.serviceType === 'GP');
  const dentalDoctors = doctors.filter(d => d.serviceType === 'DENTAL');

  const handleUpdateStatusClick = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setStatusDialogOpen(true);
  };

  const handleStatusUpdate = (status: any, breakDuration?: number) => {
    updateDoctorStatus(selectedDoctorId, status, breakDuration);
  };

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-primary">Receptionist Dashboard</h1>
          <p className="text-muted-foreground">Clinic Token & Queue Management System</p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Waiting</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{queueStats.totalWaiting}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">GP Queue</CardTitle>
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{queueStats.gpWaiting}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dental Queue</CardTitle>
              <Pill className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{queueStats.dentalWaiting}</div>
            </CardContent>
          </Card>
        </div>

        {/* Token Generation */}
        <TokenGenerationForm />

        {/* GP Doctors */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-primary">General Practitioners</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {gpDoctors.map(doctor => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                onUpdateStatus={handleUpdateStatusClick}
                onCallNext={callNextPatient}
              />
            ))}
          </div>
        </div>

        {/* Dental Doctors */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-primary">Dental Doctors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dentalDoctors.map(doctor => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                onUpdateStatus={handleUpdateStatusClick}
                onCallNext={callNextPatient}
              />
            ))}
          </div>
        </div>

        {/* Queue Table */}
        <QueueTable />

        {/* Halted Queue */}
        <HaltedQueue />
      </main>

      {selectedDoctor && (
        <DoctorStatusDialog
          open={statusDialogOpen}
          onClose={() => setStatusDialogOpen(false)}
          onUpdate={handleStatusUpdate}
          doctorName={selectedDoctor.name}
        />
      )}
    </div>
  );
}
