import * as React from 'react';
import { cn } from '../../lib/utils';

export interface RecordingIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean;
}

export const RecordingIndicator = React.forwardRef<HTMLDivElement, RecordingIndicatorProps>(
  ({ active = false, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('inline-flex items-center gap-2', className)} {...props}>
        <span
          className={cn(
            'inline-block h-3 w-3 rounded-full bg-[var(--state-recording)]',
            active && 'animate-recording-pulse shadow-[0_0_8px_var(--state-recording)]',
            !active && 'opacity-40',
          )}
        />
      </div>
    );
  },
);
RecordingIndicator.displayName = 'RecordingIndicator';
