'use client';

import * as React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface MultiSelectFilterProps {
  title: string;
  options: {
    value: string;
    label: string;
    icon?: string;
  }[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  className?: string;
}

export function MultiSelectFilter({
  title,
  options,
  selectedValues,
  onSelectionChange,
  className,
}: MultiSelectFilterProps) {
  const selectedOptions = options.filter(option => selectedValues.includes(option.value));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("justify-start", className)}>
          <span className="font-semibold mr-2">{title}:</span>
          {selectedValues.length > 0 ? (
            selectedValues.length > 2 ? (
                <Badge variant="secondary">{`${selectedValues.length} selected`}</Badge>
            ) : (
                selectedOptions.map((option) => (
                    <Badge key={option.value} variant="secondary" className="mr-1 flex items-center gap-1">
                        {option.icon && <Image src={option.icon} alt={option.label} width={16} height={16} className="rounded" />}
                        {option.label}
                    </Badge>
                ))
            )
          ) : (
            'All'
          )}
           <ChevronDownIcon className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${title}...`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  if (selectedValues.length === options.length) {
                    onSelectionChange([]);
                  } else {
                    onSelectionChange(options.map((option) => option.value));
                  }
                }}
              >
                <Checkbox
                  checked={selectedValues.length === options.length || (selectedValues.length > 0 && selectedValues.length < options.length)}
                  className="mr-2"
                />
                <span>Select All</span>
              </CommandItem>
              <CommandSeparator />
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => {
                    const newSelectedValues = selectedValues.includes(option.value)
                      ? selectedValues.filter((v) => v !== option.value)
                      : [...selectedValues, option.value];
                    onSelectionChange(newSelectedValues);
                  }}
                >
                  <Checkbox
                    checked={selectedValues.includes(option.value)}
                    className="mr-2"
                  />
                  <div className="flex items-center gap-2">
                    {option.icon && <Image src={option.icon} alt={option.label} width={20} height={20} className="rounded-md" />}
                    <span>{option.label}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 