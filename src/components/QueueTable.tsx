import { useClinic } from '@/contexts/ClinicContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { Token } from '@/types/clinic';

export const QueueTable = () => {
  const { tokens, doctors, markPatientVisited, markPatientHalted } = useClinic();

  const activeTokens = tokens.filter(t => t.status !== 'visited');

  const getDoctorName = (doctorId?: string) => {
    if (!doctorId) return '-';
    return doctors.find(d => d.id === doctorId)?.name || '-';
  };

  const getStatusBadge = (token: Token) => {
    if (token.status === 'calling') {
      return <Badge className="bg-status-calling text-white">Calling</Badge>;
    }
    if (token.isSpecificDoctor && token.assignedDoctorId) {
      return <Badge variant="outline" className="border-accent text-accent">Dedicated</Badge>;
    }
    return <Badge variant="secondary">Waiting</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Active Queue
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeTokens.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No patients in queue
                  </TableCell>
                </TableRow>
              ) : (
                activeTokens.map((token) => (
                  <TableRow key={token.id}>
                    <TableCell className="font-mono font-semibold">{token.tokenNumber}</TableCell>
                    <TableCell>
                      <div>{token.patientName}</div>
                      <div className="text-xs text-muted-foreground">{token.patientId}</div>
                    </TableCell>
                    <TableCell>{token.serviceType}</TableCell>
                    <TableCell>{getStatusBadge(token)}</TableCell>
                    <TableCell>{getDoctorName(token.assignedDoctorId)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {token.status === 'calling' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markPatientVisited(token.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Visited
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markPatientHalted(token.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            No Show
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
