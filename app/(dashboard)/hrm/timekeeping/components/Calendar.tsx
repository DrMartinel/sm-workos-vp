"use client"

import React from "react"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface CalendarProps {
  currentDate: Date
  calendarData: Record<string, any>
  viewMode: string
  calendarFilter: string
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
      const isWeekend = dayData?.type === "weekend"

      // View mode filtering
      const shouldShowByViewMode = viewMode === "all" || 
        (viewMode === "working" && !isWeekend) ||
        (viewMode === "weekends" && isWeekend)

      // Category filtering
      const shouldShowByCategory = calendarFilter === "all" || 
        (calendarFilter === "late" && (dayData?.type?.includes("late") || dayData?.mainStatus === "late")) ||
        (calendarFilter === "on-time" && (dayData?.type === "on-time" || dayData?.mainStatus === "on-time")) ||
        (calendarFilter === "leave" && (dayData?.type === "paid-leave" || dayData?.type === "unpaid-leave")) ||
        (calendarFilter === "work-online" && dayData?.type === "work-online") ||
        (calendarFilter === "go-out" && dayData?.goOut) ||
        (calendarFilter === "no-checkin" && dayData?.type === "no-checkin")

      const shouldShow = shouldShowByViewMode && shouldShowByCategory

      let cardBgColor = "bg-white border-gray-300"
      let textColor = "text-gray-800"

      const isGreyStatus = ["weekend", "paid-leave", "unpaid-leave", "no-checkin", "work-online"].includes(dayData?.type)
      const hasMainStatus = dayData?.mainStatus
      
      if (hasMainStatus === "late") {
        cardBgColor = "bg-red-50 border-red-300"
        textColor = "text-red-700"
      } else if (hasMainStatus === "on-time") {
        cardBgColor = "bg-green-50 border-green-300"
        textColor = "text-green-700"
      } else if (isGreyStatus) {
        cardBgColor = "bg-gray-100 border-gray-300"
        textColor = "text-gray-400"
      }

      days.push(
        <div
          key={day}
          className={cn(
            "aspect-square h-28 p-2 text-xs rounded-lg transition-all duration-200 shadow-sm cursor-pointer",
            shouldShow ? cardBgColor : "bg-gray-50 border border-gray-100 text-gray-300",
            "flex flex-col items-start justify-between",
            shouldShow ? "opacity-100" : "opacity-30"
          )}
          onClick={() => shouldShow && onDayClick(dayData, dateStr)}
        >
          <div className={cn("font-semibold text-sm", textColor)}>{day}</div>
          
          {hasMainStatus && (
            <div className="flex flex-col items-center w-full">
              <div className={cn("font-semibold text-xs w-full text-center", textColor)}>
                {hasMainStatus === "on-time" && "On Time"}
                {hasMainStatus === "late" && "Late"}
              </div>
              {dayData.goOut && (
                <div className="flex items-center px-1 py-0.5 mt-1 rounded-full bg-purple-200 text-[10px] text-purple-800 font-medium w-full justify-center">
                  <Clock className="h-2 w-2 mr-1" />
                  Go Out 
                </div>
              )}
              {dayData.checkIn && (
                <div className="text-gray-600 text-[10px] mt-1 w-full text-center">In: {dayData.checkIn}</div>
              )}
              {dayData.checkOut && (
                <div className="text-gray-600 text-[10px] w-full text-center">Out: {dayData.checkOut}</div>
              )}
            </div>
          )}
          {!hasMainStatus && (
              <div className="flex flex-col items-center w-full h-full"></div>
          )}
        </div>,
      )
    }

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
                <SelectItem value="go-out">Go Out</SelectItem>
                <SelectItem value="no-checkin">No Check-in</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => onNavigateMonth("prev")} className="border-gray-300">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onNavigateMonth("next")} className="border-gray-300">
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
              <span>Leave/Weekend/No Check-in</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 