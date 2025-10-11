import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Printer, X } from 'lucide-react';

interface TokenSlipProps {
  open: boolean;
  onClose: () => void;
  tokenNumber: string;
  patientName: string;
  patientId: string;
  serviceType: string;
  doctorName?: string;
  cabinNumber?: string;
  createdAt: Date;
}

export const TokenSlip = ({
  open,
  onClose,
  tokenNumber,
  patientName,
  patientId,
  serviceType,
  doctorName,
  cabinNumber,
  createdAt,
}: TokenSlipProps) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Token Generated Successfully</DialogTitle>
        </DialogHeader>
        
        <Card className="p-6 print:shadow-none" id="token-slip">
          <div className="text-center space-y-4">
            <div className="border-b pb-4">
              <h2 className="text-2xl font-bold text-primary">Clinic Token</h2>
              <p className="text-sm text-muted-foreground">
                {createdAt.toLocaleDateString()} {createdAt.toLocaleTimeString()}
              </p>
            </div>

            <div className="bg-primary/10 rounded-lg p-6 my-4">
              <p className="text-sm text-muted-foreground mb-2">Token Number</p>
              <p className="text-4xl font-bold text-primary">{tokenNumber}</p>
            </div>

            <div className="space-y-3 text-left border-t pt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Patient Name:</span>
                <span className="font-semibold">{patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Patient ID:</span>
                <span className="font-semibold">{patientId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service Type:</span>
                <span className="font-semibold">
                  {serviceType === 'GP' ? 'General Practitioner' : 'Dental'}
                </span>
              </div>
              {doctorName && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Doctor:</span>
                    <span className="font-semibold">{doctorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cabin:</span>
                    <span className="font-semibold">{cabinNumber}</span>
                  </div>
                </>
              )}
            </div>

            <div className="border-t pt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Please wait for your token to be called
              </p>
            </div>
          </div>
        </Card>

        <div className="flex gap-2 print:hidden">
          <Button onClick={handlePrint} className="flex-1">
            <Printer className="h-4 w-4 mr-2" />
            Print Slip
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1">
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
