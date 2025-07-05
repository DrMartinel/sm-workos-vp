"use client"

import * as React from "react"
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "./separator"

interface MultiSelectFilterProps {
  title: string
  options: {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
  selectedValues: string[]
  onSelectionChange: (selected: string[]) => void
}

export function MultiSelectFilter({
  title,
  options,
  selectedValues,
  onSelectionChange,
}: MultiSelectFilterProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (value: string) => {
    const isSelected = selectedValues.includes(value)
    if (isSelected) {
      onSelectionChange(selectedValues.filter((v) => v !== value))
    } else {
      onSelectionChange([...selectedValues, value])
    }
  }

  const handleSelectAll = () => {
    if (selectedValues.length === options.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(options.map(option => option.value));
    }
  }

  const isAllSelected = selectedValues.length === options.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          <span>{title}</span>
          <div className="flex items-center">
            {selectedValues.length > 0 && (
                <>
                    <Badge
                        variant="secondary"
                        className="rounded-sm px-1 font-normal lg:hidden"
                    >
                        {selectedValues.length}
                    </Badge>
                    <div className="hidden space-x-1 lg:flex">
                        {selectedValues.length > 2 ? (
                        <Badge
                            variant="secondary"
                            className="rounded-sm px-1 font-normal"
                        >
                            {selectedValues.length} selected
                        </Badge>
                        ) : (
                        options
                            .filter((option) => selectedValues.includes(option.value))
                            .map((option) => (
                            <Badge
                                variant="secondary"
                                key={option.value}
                                className="rounded-sm px-1 font-normal"
                            >
                                {option.label}
                            </Badge>
                            ))
                        )}
                    </div>
                    <Separator orientation="vertical" className="mx-2 h-4" />
                </>
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={`Search ${title}...`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
                <CommandItem
                    onSelect={handleSelectAll}
                    className="cursor-pointer"
                >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isAllSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className={cn("h-4 w-4")} />
                    </div>
                    <span>Select All</span>
                </CommandItem>
              {options.map((option) => {
                const isSelected = selectedValues.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className={cn("h-4 w-4")} />
                    </div>
                    {option.icon && (
                      <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{option.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selectedValues.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => onSelectionChange([])}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 