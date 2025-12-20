import React from 'react';
import { QueueStatus } from '@/types';

interface StatusBadgeProps {
  status: QueueStatus;
}

const statusStyles: Record<QueueStatus, string> = {
  [QueueStatus.IDLE]: 'bg-gray-500/20 text-gray-400',
  [QueueStatus.PROCESSING]: 'bg-blue-500/20 text-blue-400 animate-pulse',
  [QueueStatus.COMPLETED]: 'bg-emerald-500/20 text-emerald-400',
  [QueueStatus.FAILED]: 'bg-red-500/20 text-red-400',
  [QueueStatus.PAUSED]: 'bg-amber-500/20 text-amber-400'
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <div
      className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${statusStyles[status]}`}
    >
      {status}
    </div>
  );
};

export default StatusBadge;

