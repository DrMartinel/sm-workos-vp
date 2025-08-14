"use client"

import React, { useState, useEffect, useRef } from "react"
import { FileText, Clock, Check, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { cn } from "@/lib/utils"
import { DateRange } from "react-day-picker"
import { DateRangePicker } from "@/components/filters/date-range-picker"
import { Calendar } from "@/components/ui/calendar"

interface Request {
  id: number
  type: string
  description: string
  start_date: string
  end_date: string
  created_at?: string
  status: string
  start_time?: string
  end_time?: string
  ot_hours?: number
}

interface RequestHistoryProps {
  requests: Request[]
  filterType: string
  filterStatus: string
  dateRange: DateRange | undefined
  onFilterTypeChange: (value: string) => void
  onFilterStatusChange: (value: string) => void
  onDateRangeChange: (date: DateRange | undefined) => void
  onRequestClick: (request: Request) => void
}

export default function RequestHistory({
  requests,
  filterType,
  filterStatus,
  dateRange,
  onFilterTypeChange,
  onFilterStatusChange,
  onDateRangeChange,
  onRequestClick
}: RequestHistoryProps) {
  const [showMobileDatePicker, setShowMobileDatePicker] = useState(false)
  const datePickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowMobileDatePicker(false)
      }
    }

    // Add touch event handling for mobile
    const handleTouchOutside = (event: TouchEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowMobileDatePicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleTouchOutside)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleTouchOutside)
    }
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "approved":
        return <Check className="h-4 w-4 text-green-600" />
      case "rejected":
        return <X className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const filteredRequests = requests.filter((request) => {
    const matchesType = filterType === "all" || request.type === filterType
    const matchesStatus = filterStatus === "all" || request.status === filterStatus

    const from = dateRange?.from ? new Date(dateRange.from) : undefined
    const to = dateRange?.to ? new Date(dateRange.to) : from

    const requestStart = new Date(request.start_date)
    const requestEnd = new Date(request.end_date)

    // Normalize dates to start of day for comparison
    const fromDate = from ? new Date(from.getFullYear(), from.getMonth(), from.getDate()) : undefined
    const toDate = to ? new Date(to.getFullYear(), to.getMonth(), to.getDate()) : undefined
    const requestStartDate = new Date(requestStart.getFullYear(), requestStart.getMonth(), requestStart.getDate())
    const requestEndDate = new Date(requestEnd.getFullYear(), requestEnd.getMonth(), requestEnd.getDate())

    const matchesDate = !fromDate || !toDate || (requestStartDate >= fromDate && requestStartDate <= toDate)

    return matchesType && matchesStatus && matchesDate
  })

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <FileText className="h-5 w-5" />
          Request History
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {/* Filter Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          {/* Mobile: All filters on same row */}
          <div className="flex md:hidden items-center gap-2 w-full">
            {/* Mobile: Compact date range display */}
            <div className="flex-1 min-w-0 relative">
              <div 
                className="text-xs text-center px-2 py-1 bg-white border border-gray-300 rounded cursor-pointer hover:bg-gray-50 h-8 flex items-center justify-center"
                onClick={() => setShowMobileDatePicker(!showMobileDatePicker)}
              >
                {dateRange?.from ? 
                  `${dateRange.from.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}${dateRange.to ? ` - ${dateRange.to.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}` : 
                  'Select dates'
                }
              </div>
              
              {/* Mobile Date Picker Popover */}
              {showMobileDatePicker && (
                <div ref={datePickerRef} className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-3 w-full">
                  {/* Mobile Preset Selector */}
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-2">Quick Select</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onDateRangeChange({ from: new Date(), to: new Date() })}
                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 active:bg-blue-200 rounded border border-gray-300"
                      >
                        Today
                      </button>
                      <button
                        onClick={() => onDateRangeChange({ from: new Date(Date.now() - 24 * 60 * 60 * 1000), to: new Date(Date.now() - 24 * 60 * 60 * 1000) })}
                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 active:bg-blue-200 rounded border border-gray-300"
                      >
                        Yesterday
                      </button>
                      <button
                        onClick={() => onDateRangeChange({ from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), to: new Date() })}
                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 active:bg-blue-200 rounded border border-gray-300"
                      >
                        Last 7 days
                      </button>
                      <button
                        onClick={() => onDateRangeChange({ from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to: new Date() })}
                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 active:bg-blue-200 rounded border border-gray-300"
                      >
                        Last 30 days
                      </button>
                    </div>
                  </div>
                  
                  {/* Mobile Calendar */}
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-2">Select Dates</label>
                    <div className="border rounded-lg p-2 overflow-hidden">
                      <Calendar
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={(newDateRange) => {
                          onDateRangeChange(newDateRange)
                          if (newDateRange?.from && newDateRange?.to) {
                            setShowMobileDatePicker(false)
                          }
                        }}
                        numberOfMonths={1}
                        className="w-full"
                        classNames={{
                          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                          month: "space-y-4",
                          caption: "flex justify-center pt-1 relative items-center",
                          caption_label: "text-sm font-medium",
                          nav: "space-x-1 flex items-center",
                          nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                          nav_button_previous: "absolute left-1",
                          nav_button_next: "absolute right-1",
                          table: "w-full border-collapse space-y-1",
                          head_row: "flex",
                          head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                          row: "flex w-full mt-2",
                          cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                          day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100",
                          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                          day_today: "bg-accent text-accent-foreground",
                          day_outside: "text-muted-foreground opacity-50",
                          day_disabled: "text-muted-foreground opacity-50",
                          day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                          day_hidden: "invisible",
                        }}
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowMobileDatePicker(false)}
                    className="w-full px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded border border-gray-300"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>

            <Select value={filterType} onValueChange={onFilterTypeChange}>
              <SelectTrigger className="w-20 border-gray-300 text-xs h-8">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Type</SelectItem>
                <SelectItem value="Leave Paid">Paid</SelectItem>
                <SelectItem value="Leave Unpaid">Unpaid</SelectItem>
                <SelectItem value="OT">OT</SelectItem>
                <SelectItem value="Work From Home">WFH</SelectItem>
                <SelectItem value="Go Out">Out</SelectItem>
                <SelectItem value="Time Edit">Edit</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={onFilterStatusChange}>
              <SelectTrigger className="w-20 border-gray-300 text-xs h-8">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Desktop: Original layout */}
          <div className="hidden md:flex flex-col gap-3 md:flex-row md:items-center">
            <div className="min-w-[340px]">
              <DateRangePicker date={dateRange} setDate={onDateRangeChange} />
            </div>

            <div className="flex gap-3 items-center">
              <Select value={filterType} onValueChange={onFilterTypeChange}>
                <SelectTrigger className="w-[160px] sm:w-[200px] border-gray-300">
                  <span className="sm:hidden">Type</span>
                  <span className="hidden sm:inline">
                    <SelectValue placeholder="Request Type" />
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Leave Paid">Leave Paid</SelectItem>
                  <SelectItem value="Leave Unpaid">Leave Unpaid</SelectItem>
                  <SelectItem value="OT">OT</SelectItem>
                  <SelectItem value="Work From Home">Work From Home</SelectItem>
                  <SelectItem value="Go Out">Go Out</SelectItem>
                  <SelectItem value="Time Edit">Time Edit</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={onFilterStatusChange}>
                <SelectTrigger className="w-[160px] sm:w-[200px] border-gray-300">
                  <span className="sm:hidden">Status</span>
                  <span className="hidden sm:inline">
                    <SelectValue placeholder="Status" />
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Request List */}
        <div className="space-y-3">
          {filteredRequests.map((request) => {
            return (
              <div
                key={request.id}
                className={cn(
                  "flex items-center justify-between p-4 border rounded-lg transition-all duration-200 shadow-sm hover:shadow-md",
                  request.status === "pending" 
                    ? "hover:bg-gray-50 cursor-pointer border-gray-200" 
                    : "cursor-default border-gray-200"
                )}
                onClick={() => onRequestClick(request)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg border border-gray-200">
                    <FileText className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{request.type}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(request.start_date).toLocaleDateString("en-US")} - {new Date(request.end_date).toLocaleDateString("en-US")}
                    </p>
                    <p className="text-sm text-gray-500">
                      {request.start_time || ""} - {request.end_time || ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(request.status)}
                </div>
              </div>
            )
          })}

          {filteredRequests.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p>No requests found matching your filters.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 