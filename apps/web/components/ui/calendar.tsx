'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
        ),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell:
          'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
        row: 'flex w-full mt-2',
        cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100'
        ),
        day_range_end: 'day-range-end',
        day_selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        day_today: 'bg-accent text-accent-foreground',
        day_outside:
          'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
        day_disabled: 'text-muted-foreground opacity-50',
        day_range_middle:
          'aria-selected:bg-accent aria-selected:text-accent-foreground',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };

// Date picker with input
export function DatePicker({
  selected,
  onSelect,
  placeholder = 'Pick a date',
  className,
}: {
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className={className}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          buttonVariants({ variant: 'outline' }),
          'w-full justify-start text-left font-normal',
          !selected && 'text-muted-foreground'
        )}
      >
        {selected ? (
          selected.toLocaleDateString()
        ) : (
          <span>{placeholder}</span>
        )}
      </button>
      {open && (
        <div className="absolute z-50 mt-2 bg-background border rounded-md shadow-lg">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(date) => {
              onSelect(date);
              setOpen(false);
            }}
            initialFocus
          />
        </div>
      )}
    </div>
  );
}

// Date range picker
export function DateRangePicker({
  from,
  to,
  onSelect,
  className,
}: {
  from?: Date;
  to?: Date;
  onSelect: (range: { from?: Date; to?: Date }) => void;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className={className}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          buttonVariants({ variant: 'outline' }),
          'w-full justify-start text-left font-normal',
          !from && !to && 'text-muted-foreground'
        )}
      >
        {from ? (
          to ? (
            <>
              {from.toLocaleDateString()} - {to.toLocaleDateString()}
            </>
          ) : (
            from.toLocaleDateString()
          )
        ) : (
          <span>Pick a date range</span>
        )}
      </button>
      {open && (
        <div className="absolute z-50 mt-2 bg-background border rounded-md shadow-lg">
          <Calendar
            mode="range"
            selected={{ from, to }}
            onSelect={(range) => {
              onSelect({ from: range?.from, to: range?.to });
              if (range?.from && range?.to) {
                setOpen(false);
              }
            }}
            numberOfMonths={2}
            initialFocus
          />
        </div>
      )}
    </div>
  );
}

// Calendar with events
export function CalendarWithEvents({
  events,
  onDateSelect,
  className,
}: {
  events: Array<{ date: Date; title: string; color?: string }>;
  onDateSelect?: (date: Date) => void;
  className?: string;
}) {
  const [selected, setSelected] = React.useState<Date>();

  const modifiers = {
    hasEvent: events.map((e) => e.date),
  };

  const modifiersClassNames = {
    hasEvent: 'font-bold relative after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full',
  };

  return (
    <Calendar
      mode="single"
      selected={selected}
      onSelect={(date) => {
        setSelected(date);
        if (date && onDateSelect) {
          onDateSelect(date);
        }
      }}
      modifiers={modifiers}
      modifiersClassNames={modifiersClassNames}
      className={className}
    />
  );
}

