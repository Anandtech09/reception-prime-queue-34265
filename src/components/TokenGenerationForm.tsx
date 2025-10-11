import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ServiceType } from '@/types/clinic';
import { useClinic } from '@/contexts/ClinicContext';
import { Plus } from 'lucide-react';

export const TokenGenerationForm = () => {
  const { doctors, generateToken } = useClinic();
  const [patientName, setPatientName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('GP');
  const [specificDoctor, setSpecificDoctor] = useState<string>('');

  const availableDoctors = doctors.filter(d => d.serviceType === serviceType && d.status === 'active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !patientId) return;

    generateToken(patientName, patientId, serviceType, specificDoctor || undefined);
    
    // Reset form
    setPatientName('');
    setPatientId('');
    setSpecificDoctor('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Generate Token
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientName">Patient Name</Label>
              <Input
                id="patientName"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Enter name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patientId">Patient ID</Label>
              <Input
                id="patientId"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Enter ID"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceType">Service Type</Label>
            <Select value={serviceType} onValueChange={(v) => setServiceType(v as ServiceType)}>
              <SelectTrigger id="serviceType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GP">General Practitioner</SelectItem>
                <SelectItem value="DENTAL">Dental</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specificDoctor">Specific Doctor (Optional)</Label>
            <Select value={specificDoctor} onValueChange={setSpecificDoctor}>
              <SelectTrigger id="specificDoctor">
                <SelectValue placeholder="Any available doctor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any available doctor</SelectItem>
                {availableDoctors.map(doc => (
                  <SelectItem key={doc.id} value={doc.id}>
                    {doc.name} - Cabin {doc.cabinNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Generate Token
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
