"use client"

import React from "react"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { 
  getTimekeepingLabel,
  getTimekeepingStyles, 
  getRequestIndicatorStyles,
  shouldShowDay,
  type TimekeepingDayData 
} from "../utils/timekeepingUtils"

interface CalendarProps {
  currentDate: Date
  calendarData: Record<string, any>
  viewMode: string
  calendarFilter: string
  isLoading?: boolean
  onNavigateMonth: (direction: "prev" | "next") => void
  onViewModeChange: (value: string) => void
  onCalendarFilterChange: (value: string) => void
  onDayClick: (dayData: any, dateStr: string) => void
}

export default function Calendar({
  currentDate,
  calendarData,
  viewMode,
  calendarFilter,
  isLoading = false,
  onNavigateMonth,
  onViewModeChange,
  onCalendarFilterChange,
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
        <div
          key={`skeleton-${i}`}
          className="aspect-square h-28 p-2 rounded-lg bg-gray-100 animate-pulse"
        >
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded mb-1"></div>
          <div className="h-2 bg-gray-200 rounded"></div>
        </div>
      ))
    }

    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const dayData = calendarData[dateStr]
      const shouldShow = shouldShowDay(dayData as TimekeepingDayData, viewMode, calendarFilter)
      const { cardBgColor, textColor } = getTimekeepingStyles(dayData as TimekeepingDayData)
      const hasAttendance = dayData?.isLate !== undefined

 // ... (các phần code khác)

   days.push(
        <div
          key={day}
          className={cn(
            "aspect-square h-28 p-2 text-xs rounded-lg transition-all duration-200 shadow-sm cursor-pointer relative",
            shouldShow ? cardBgColor : "bg-gray-50 border border-gray-100 text-gray-300",
            "flex flex-col items-center justify-between",
            shouldShow ? "opacity-100" : "opacity-30"
          )}
          onClick={() => shouldShow && onDayClick(dayData, dateStr)}
        >
          {/* Request indicators in top right */}
          {dayData?.requests && dayData.requests.length > 0 && (
            <div className="absolute top-1 right-1 flex flex-col gap-1">
              {dayData.requests.slice(0, 2).map((request: any, index: number) => {
                const { bgColor, textColor } = getRequestIndicatorStyles(request.type)
                return (
                  <div
                    key={`${dateStr}-${request.id}-${index}`}
                    className={cn(
                      "w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold",
                      bgColor,
                      textColor
                    )}
                    title={`${request.type} - ${request.status}`}
                  >
                    {request.type === "Leave Paid" && "P"}
                    {request.type === "Leave Unpaid" && "U"}
                    {request.type === "OT" && "O"}
                    {request.type === "Work From Home" && "W"}
                    {request.type === "Go Out" && "G"}
                    {request.type === "Time Edit" && "T"}
                  </div>
                )
              })}
              {dayData.requests.length > 2 && (
                <div className="w-4 h-4 rounded-full bg-gray-500 text-white flex items-center justify-center text-[6px] font-bold">
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
        </div>,
      )
    }

// ... (các phần code khác)


    return days
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CalendarIcon className="h-5 w-5" />
              {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </CardTitle>
          </div>
          <div className="flex items-center gap-3">
            <Select value={viewMode} onValueChange={onViewModeChange}>
              <SelectTrigger className="w-[140px] border-gray-300">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Days</SelectItem>
                <SelectItem value="working">Working Days</SelectItem>
                <SelectItem value="weekends">Weekends Only</SelectItem>
              </SelectContent>
            </Select>
            <Select value={calendarFilter} onValueChange={onCalendarFilterChange}>
              <SelectTrigger className="w-[140px] border-gray-300">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="late">Late Days</SelectItem>
                <SelectItem value="on-time">On Time</SelectItem>
                <SelectItem value="leave">Leave Days</SelectItem>
                <SelectItem value="work-online">Work Online</SelectItem>
                <SelectItem value="no-checkin">No Check-in</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onNavigateMonth("prev")} 
              className="border-gray-300"
              disabled={isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onNavigateMonth("next")} 
              className="border-gray-300"
              disabled={isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
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
              <span>No Check-in</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded-sm"></div>
              <span>Weekend</span>
            </div>
          </div>
          
          <h4 className="text-xs font-semibold text-gray-600 mt-3 mb-2">Request Indicators (Top Right)</h4>
          <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-200 rounded-full text-blue-800 text-[8px] font-bold flex items-center justify-center">P</div>
              <span>Paid Leave</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-200 rounded-full text-orange-800 text-[8px] font-bold flex items-center justify-center">U</div>
              <span>Unpaid Leave</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-200 rounded-full text-purple-800 text-[8px] font-bold flex items-center justify-center">O</div>
              <span>OT</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-indigo-200 rounded-full text-indigo-800 text-[8px] font-bold flex items-center justify-center">W</div>
              <span>WFH</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-200 rounded-full text-yellow-800 text-[8px] font-bold flex items-center justify-center">G</div>
              <span>Go Out</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-teal-200 rounded-full text-teal-800 text-[8px] font-bold flex items-center justify-center">T</div>
              <span>Time Edit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-200 rounded-full text-gray-800 text-[8px] font-bold flex items-center justify-center">+</div>
              <span>More Requests</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 