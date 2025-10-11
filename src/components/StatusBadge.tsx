import { DoctorStatus } from '@/types/clinic';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: DoctorStatus;
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const variants = {
    active: 'bg-status-active text-success-foreground',
    break: 'bg-status-break text-warning-foreground',
    disabled: 'bg-status-disabled text-destructive-foreground',
  };

  const labels = {
    active: 'Active',
    break: 'On Break',
    disabled: 'Disabled',
  };

  return (
    <Badge className={`${variants[status]} ${className || ''}`}>
      {labels[status]}
    </Badge>
  );
};
