import { useState } from 'react';
import { useClinic } from '@/contexts/ClinicContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Token } from '@/types/clinic';

interface RequeueDialogProps {
  open: boolean;
  onClose: () => void;
  token: Token | null;
}

export const RequeueDialog = ({ open, onClose, token }: RequeueDialogProps) => {
  const { doctors, requeuePatient } = useClinic();
  const [selectedDoctor, setSelectedDoctor] = useState<string>('auto');
  const [queuePosition, setQueuePosition] = useState<'front' | 'back'>('back');

  if (!token) return null;

  const availableDoctors = doctors.filter(
    d => d.serviceType === token.serviceType && d.status === 'active'
  );

  const handleRequeue = () => {
    const doctorId = selectedDoctor === 'auto' ? undefined : selectedDoctor;
    requeuePatient(token.id, doctorId, queuePosition);
    onClose();
    setSelectedDoctor('auto');
    setQueuePosition('back');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Re-queue Patient</DialogTitle>
          <DialogDescription>
            Configure re-queue settings for {token.tokenNumber} - {token.patientName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Assign to Doctor</Label>
            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
              <SelectTrigger>
                <SelectValue placeholder="Select doctor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto-assign (least busy)</SelectItem>
                {availableDoctors.map(doctor => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.name} - Cabin {doctor.cabinNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Queue Position</Label>
            <RadioGroup value={queuePosition} onValueChange={(val) => setQueuePosition(val as 'front' | 'back')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="front" id="front" />
                <Label htmlFor="front" className="font-normal cursor-pointer">
                  Front of queue (priority)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="back" id="back" />
                <Label htmlFor="back" className="font-normal cursor-pointer">
                  Back of queue (normal)
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleRequeue}>
            Re-queue Patient
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
