'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatMonthYear, getPreviousMonth, getNextMonth } from '@/lib/utils/formatting';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export interface MonthPickerProps {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
}

export function MonthPicker({ value, onChange, className }: MonthPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [viewYear, setViewYear] = React.useState(value.getFullYear());

  const displayLabel = formatMonthYear(value);
  const handlePrev = () => onChange(getPreviousMonth(value));
  const handleNext = () => onChange(getNextMonth(value));

  const selectMonth = (monthIndex: number) => {
    onChange(new Date(viewYear, monthIndex, 1));
    setOpen(false);
  };

  React.useEffect(() => {
    setViewYear(value.getFullYear());
  }, [value]);

  return (
    <div className={cn('flex items-center justify-between gap-1', className)}>
      <button
        type="button"
        onClick={handlePrev}
        className="p-2 hover:bg-muted rounded-lg transition"
        aria-label="Previous month"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex-1 min-w-0 bg-muted hover:bg-muted/80 rounded-full px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-1"
            aria-label="Select month"
          >
            <span className="truncate uppercase">{displayLabel}</span>
            <ChevronRight className="w-4 h-4 rotate-90 shrink-0 opacity-70" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="center" className="w-56 p-3">
          <div className="flex items-center justify-between gap-2 mb-3">
            <button
              type="button"
              onClick={() => setViewYear((y) => y - 1)}
              className="p-1.5 hover:bg-muted rounded"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold">{viewYear}</span>
            <button
              type="button"
              onClick={() => setViewYear((y) => y + 1)}
              className="p-1.5 hover:bg-muted rounded"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {MONTHS.map((name, i) => (
              <button
                key={name}
                type="button"
                onClick={() => selectMonth(i)}
                className={cn(
                  'py-2 px-1 rounded-md text-xs font-medium transition',
                  value.getMonth() === i && value.getFullYear() === viewYear
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}
              >
                {name.slice(0, 3)}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <button
        type="button"
        onClick={handleNext}
        className="p-2 hover:bg-muted rounded-lg transition"
        aria-label="Next month"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
