import { useClinic } from '@/contexts/ClinicContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RotateCcw, AlertCircle } from 'lucide-react';

export const HaltedQueue = () => {
  const { haltedTokens, requeuePatient } = useClinic();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          Halted Patients
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {haltedTokens.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No halted patients
                  </TableCell>
                </TableRow>
              ) : (
                haltedTokens.map((token) => (
                  <TableRow key={token.id}>
                    <TableCell className="font-mono font-semibold">{token.tokenNumber}</TableCell>
                    <TableCell>
                      <div>{token.patientName}</div>
                      <div className="text-xs text-muted-foreground">{token.patientId}</div>
                    </TableCell>
                    <TableCell>{token.serviceType}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => requeuePatient(token.id)}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Re-queue
                      </Button>
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
