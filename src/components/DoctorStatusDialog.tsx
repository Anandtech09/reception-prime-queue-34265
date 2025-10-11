import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DoctorStatus } from '@/types/clinic';

interface DoctorStatusDialogProps {
  open: boolean;
  onClose: () => void;
  onUpdate: (status: DoctorStatus, breakDuration?: number) => void;
  doctorName: string;
}

export const DoctorStatusDialog = ({ open, onClose, onUpdate, doctorName }: DoctorStatusDialogProps) => {
  const [status, setStatus] = useState<DoctorStatus>('active');
  const [breakDuration, setBreakDuration] = useState('5');

  const handleSubmit = () => {
    onUpdate(status, status === 'break' ? parseInt(breakDuration) : undefined);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Status - {doctorName}</DialogTitle>
          <DialogDescription>Change doctor availability and break time</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <RadioGroup value={status} onValueChange={(v) => setStatus(v as DoctorStatus)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="active" id="active" />
              <Label htmlFor="active">Active</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="break" id="break" />
              <Label htmlFor="break">On Break</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="disabled" id="disabled" />
              <Label htmlFor="disabled">Disabled</Label>
            </div>
          </RadioGroup>

          {status === 'break' && (
            <div className="space-y-2">
              <Label htmlFor="duration">Break Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={breakDuration}
                onChange={(e) => setBreakDuration(e.target.value)}
              />
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            Update Status
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
