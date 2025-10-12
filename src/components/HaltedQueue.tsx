import { useState } from 'react';
import { useClinic } from '@/contexts/ClinicContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RotateCcw, AlertCircle } from 'lucide-react';
import { RequeueDialog } from './RequeueDialog';
import { Token } from '@/types/clinic';

export const HaltedQueue = () => {
  const { haltedTokens } = useClinic();
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleRequeueClick = (token: Token) => {
    setSelectedToken(token);
    setDialogOpen(true);
  };

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
                        onClick={() => handleRequeueClick(token)}
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

      <RequeueDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        token={selectedToken}
      />
    </Card>
  );
};
