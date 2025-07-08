'use client';

import * as React from 'react';
import { CalendarIcon } from '@radix-ui/react-icons';
import { addDays, format, subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
    date: DateRange | undefined;
    setDate: (date: DateRange | undefined) => void;
}

export function DateRangePicker({ className, date, setDate }: DateRangePickerProps) {

    const handleSelectPreset = (preset: string) => {
        const now = new Date();
        switch (preset) {
            case 'today':
                setDate({ from: now, to: now });
                break;
            case 'yesterday':
                const yesterday = addDays(now, -1);
                setDate({ from: yesterday, to: yesterday });
                break;
            case 'last7':
                setDate({ from: subDays(now, 6), to: now });
                break;
            case 'last30':
                setDate({ from: subDays(now, 29), to: now });
                break;
            case 'last90':
                 setDate({ from: subDays(now, 89), to: now });
                break;
            case 'thisMonth':
                setDate({ from: new Date(now.getFullYear(), now.getMonth(), 1), to: now });
                break;
             case 'lastMonth':
                const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                setDate({ from: lastMonth, to: new Date(now.getFullYear(), now.getMonth(), 0) });
                break;
        }
    };


  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd, y')} -{' '}
                  {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            <div className="p-2 border-r">
                <Select onValueChange={handleSelectPreset}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a preset" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="yesterday">Yesterday</SelectItem>
                        <SelectItem value="last7">Last 7 days</SelectItem>
                        <SelectItem value="last30">Last 30 days</SelectItem>
                        <SelectItem value="last90">Last 90 days</SelectItem>
                        <SelectItem value="thisMonth">This Month</SelectItem>
                        <SelectItem value="lastMonth">Last Month</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
} 