"use client"

import React from "react"
import { Clock } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface AttendanceStatusBannerProps {
  isCheckedIn: boolean
  isCheckedOut: boolean
  checkInTime: Date | null
  onCheckIn: () => void
  onCheckOut: () => void
}

export default function AttendanceStatusBanner({
  isCheckedIn,
  isCheckedOut,
  checkInTime,
  onCheckIn,
  onCheckOut
}: AttendanceStatusBannerProps) {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 md:p-6 text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-full p-2">
            <Clock className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg md:text-xl">Attendance Status</h3>
            {!isCheckedIn ? (
              <p className="text-blue-100 text-sm">You haven't checked in today</p>
            ) : isCheckedIn && !isCheckedOut ? (
              <p className="text-blue-100 text-sm">
                Checked in at {checkInTime?.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </p>
            ) : (
              <p className="text-blue-100 text-sm">Work day completed</p>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          {!isCheckedIn ? (
            <Button
              onClick={onCheckIn}
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-4 py-2 h-auto"
            >
              Check-in
            </Button>
          ) : isCheckedIn && !isCheckedOut ? (
            <Button
              onClick={onCheckOut}
              className="bg-white text-red-600 hover:bg-gray-100 font-semibold px-4 py-2 h-auto"
            >
              Check-out
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
} 