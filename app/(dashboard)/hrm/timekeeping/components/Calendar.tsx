"use client"

import React from "react"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Plane, Edit3, FileText, Home, LogOut } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { 
  getTimekeepingLabel,
  getTimekeepingStyles, 
  shouldShowDay,
  type TimekeepingDayData 
} from "../utils/timekeepingUtils"

interface CalendarProps {
  currentDate: Date
  calendarData: Record<string, any>

  calendarFilter: string
  requestFilter: string
  isLoading?: boolean
  onNavigateMonth: (direction: "prev" | "next") => void
  onCalendarFilterChange: (value: string) => void
  onRequestFilterChange: (value: string) => void
  onDayClick: (dayData: any, dateStr: string) => void
}

export default function Calendar({
  currentDate,
  calendarData,
  calendarFilter,
  requestFilter,
  isLoading = false,
  onNavigateMonth,
  onCalendarFilterChange,
  onRequestFilterChange,
  onDayClick
}: CalendarProps) {
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return firstDay === 0 ? 6 : firstDay - 1
  }

  const renderCalendar = () => {
    if (isLoading) {
      return Array.from({ length: 42 }, (_, i) => (
        <div key={`skeleton-${i}`}>
          {/* Desktop skeleton */}
          <div className="aspect-square h-28 p-2 rounded-lg bg-gray-100 animate-pulse md:block hidden">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-1"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
          </div>
          {/* Mobile skeleton */}
          <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse md:hidden"></div>
        </div>
      ))
    }

    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`}>
          {/* Desktop empty cell */}
          <div className="aspect-square hidden md:block"></div>
          {/* Mobile empty cell */}
          <div className="w-10 h-10 md:hidden"></div>
        </div>
      )
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const dayData = calendarData[dateStr]
      const shouldShow = shouldShowDay(dayData as TimekeepingDayData, "all", calendarFilter, requestFilter)
      const { cardBgColor, textColor } = getTimekeepingStyles(dayData as TimekeepingDayData)
      const hasAttendance = dayData?.isLate !== undefined

      days.push(
        <div key={day}>
          {/* Desktop Calendar Card */}
          <div
            className={cn(
              "aspect-square h-28 p-2 text-xs rounded-lg transition-all duration-200 shadow-sm cursor-pointer relative hidden md:flex md:flex-col md:items-center md:justify-between",
              shouldShow ? cardBgColor : "bg-gray-50 border border-gray-100 text-gray-300",
              shouldShow ? "opacity-100" : "opacity-40"
            )}
            onClick={() => onDayClick(dayData, dateStr)}
          >
            {/* Request indicators in top right */}
            {dayData?.requests && dayData.requests.length > 0 && (
              <div className="absolute top-1 right-1 flex flex-col gap-1">
                {dayData.requests.slice(0, 2).map((request: any, index: number) => (
                  <div
                    key={`${dateStr}-${request.id}-${index}`}
                    className="flex items-center justify-center"
                    title={`${request.type} - ${request.status}`}
                  >
                    {request.type === "Leave Paid" && <Plane className="w-3 h-3 text-gray-600" />}
                    {request.type === "Leave Unpaid" && <Plane className="w-3 h-3 text-gray-600" />}
                    {request.type === "OT" && <Clock className="w-3 h-3 text-gray-600" />}
                    {request.type === "Work From Home" && <Home className="w-3 h-3 text-gray-600" />}
                    {request.type === "Go Out" && <LogOut className="w-3 h-3 text-gray-600" />}
                    {request.type === "Time Edit" && <Edit3 className="w-3 h-3 text-gray-600" />}
                    {!["Leave Paid", "Leave Unpaid", "OT", "Work From Home", "Go Out", "Time Edit"].includes(request.type) && <FileText className="w-3 h-3 text-gray-600" />}
                  </div>
                ))}
                {dayData.requests.length > 2 && (
                  <div className="text-[8px] font-semibold text-gray-500 text-right">
                    +{dayData.requests.length - 2}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between w-full">
              <div className={cn("font-semibold text-sm", textColor)}>{day}</div>
            </div>
            
            <div className="mt-1 flex-1 w-full flex flex-col items-center">
              <div className={cn("font-semibold text-xs text-center w-full", hasAttendance ? textColor : "text-gray-400")}>
                {getTimekeepingLabel(dayData as TimekeepingDayData, dateStr)}
              </div>

              {hasAttendance && (
                <div className="text-gray-600 text-[10px] mt-1 w-full text-center">
                  {dayData.checkIn && <div>In: {dayData.checkIn}</div>}
                  {dayData.checkOut && <div>Out: {dayData.checkOut}</div>}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Calendar Card - Circular */}
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold cursor-pointer transition-all duration-200 shadow-sm md:hidden",
              shouldShow ? cardBgColor : "bg-gray-50 border border-gray-100 text-gray-300",
              shouldShow ? "opacity-100" : "opacity-40"
            )}
            onClick={() => onDayClick(dayData, dateStr)}
            title={shouldShow ? `${day} - ${getTimekeepingLabel(dayData as TimekeepingDayData, dateStr)}` : `${day}`}
          >
            {day}
          </div>
        </div>
      )
    }

    return days
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CalendarIcon className="h-5 w-5" />
              {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </CardTitle>
          </div>
          
          {/* Mobile: Filters and navigation on same row */}
          <div className="flex md:hidden items-center gap-2 w-full">
            <Select value={calendarFilter} onValueChange={onCalendarFilterChange}>
              <SelectTrigger className="w-32 border-gray-300 text-xs h-8">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Timekeeping</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="on-time">On Time</SelectItem>
                <SelectItem value="no-checkin">No Check-in</SelectItem>
              </SelectContent>
            </Select>

            <Select value={requestFilter} onValueChange={onRequestFilterChange}>
              <SelectTrigger className="w-24 border-gray-300 text-xs h-8">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Request</SelectItem>
                <SelectItem value="Leave Paid">Paid</SelectItem>
                <SelectItem value="Leave Unpaid">Unpaid</SelectItem>
                <SelectItem value="OT">OT</SelectItem>
                <SelectItem value="Work From Home">WFH</SelectItem>
                <SelectItem value="Go Out">Out</SelectItem>
                <SelectItem value="Time Edit">Edit</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-1 ml-auto">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onNavigateMonth("prev")} 
                className="border-gray-300 h-8 w-8 p-0"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-3 w-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <ChevronLeft className="h-3 w-3" />
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onNavigateMonth("next")} 
                className="border-gray-300 h-8 w-8 p-0"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-3 w-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>

          {/* Desktop: Original layout */}
          <div className="hidden md:flex md:flex-row gap-3 w-full md:w-auto">
            <Select value={calendarFilter} onValueChange={onCalendarFilterChange}>
              <SelectTrigger className="w-[155px] border-gray-300">
                <SelectValue placeholder="Timekeeping" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Timekeeping</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="on-time">On Time</SelectItem>
                <SelectItem value="no-checkin">No Check-in</SelectItem>
              </SelectContent>
            </Select>

            <Select value={requestFilter} onValueChange={onRequestFilterChange}>
              <SelectTrigger className="w-[160px] border-gray-300">
                <SelectValue placeholder="Requests" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requests</SelectItem>
                <SelectItem value="Leave Paid">Leave Paid</SelectItem>
                <SelectItem value="Leave Unpaid">Leave Unpaid</SelectItem>
                <SelectItem value="OT">OT</SelectItem>
                <SelectItem value="Work From Home">Work From Home</SelectItem>
                <SelectItem value="Go Out">Go Out</SelectItem>
                <SelectItem value="Time Edit">Time Edit</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onNavigateMonth("prev")} 
                className="border-gray-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onNavigateMonth("next")} 
                className="border-gray-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {/* Calendar Grid */}
        <div className="mb-4">
          <div className="grid grid-cols-7 gap-2 mb-3">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">{renderCalendar()}</div>
        </div>

        {/* Categories Legend */}
        <div className="border-t pt-3">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Legend</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-50 border border-red-300 rounded-sm"></div>
              <span>Late</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-50 border border-green-300 rounded-sm"></div>
              <span>On Time</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded-sm"></div>
              <span>No Check-in / Weekend</span>
            </div>
          </div>
          
          {/* Request Indicators Legend - Desktop Only */}
          <div className="hidden md:block">
            <h4 className="text-xs font-semibold text-gray-600 mt-3 mb-2">Request Indicators (Top Right)</h4>
            <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs">
              <div className="flex items-center gap-2">
                <Plane className="w-3 h-3 text-800" />
                <span>Paid Leave</span>
              </div>
              <div className="flex items-center gap-2">
                <Plane className="w-3 h-3 text-800" />
                <span>Unpaid Leave</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-800" />
                <span>OT</span>
              </div>
              <div className="flex items-center gap-2">
                <Home className="w-3 h-3 text-800" />
                <span>WFH</span>
              </div>
              <div className="flex items-center gap-2">
                <LogOut className="w-3 h-3 text-800" />
                <span>Go Out</span>
              </div>
              <div className="flex items-center gap-2">
                <Edit3 className="w-3 h-3 text-800" />
                <span>Time Edit</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-600">+</span>
                <span>More Requests</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 