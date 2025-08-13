"use client"

import React from "react"
import { FileText, Clock, Check, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { cn } from "@/lib/utils"
import { DateRange } from "react-day-picker"
import { DateRangePicker } from "@/components/filters/date-range-picker"

interface Request {
  id: number
  type: string
  icon: any
  description: string
  startDate: string
  endDate: string
  submittedDate: string
  status: string
  checkIn: string
  checkOut: string
  otHours?: number
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

    const requestStart = new Date(request.startDate)
    const requestEnd = new Date(request.endDate)

    const matchesDate = !from || !to || (requestStart <= to && requestEnd >= from)

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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
            const Icon = request.icon
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
                    <Icon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{request.type}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(request.startDate).toLocaleDateString("en-US")} - {new Date(request.endDate).toLocaleDateString("en-US")}
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