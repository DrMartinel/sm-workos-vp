"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface MonthlySummaryProps {
  currentDate: Date
  monthlySummary: {
    totalAttendanceHours: number
    otHours: number
    efficiency: number
    totalPenalty: number
  }
}

export default function MonthlySummary({ currentDate, monthlySummary }: MonthlySummaryProps) {
  return (
    <Card className="mb-6 shadow-lg border-0">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-bold text-gray-800">Monthly Summary</CardTitle>
        <CardDescription className="text-gray-600">
          {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-8 pb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="text-2xl font-bold text-blue-700">{monthlySummary.totalAttendanceHours}h</div>
            <div className="text-sm text-blue-600 font-medium">Total Hours</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <div className="text-2xl font-bold text-green-700">{monthlySummary.otHours}h</div>
            <div className="text-sm text-green-600 font-medium">OT Hours</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <div className="text-2xl font-bold text-purple-700">{monthlySummary.efficiency}%</div>
            <div className="text-sm text-purple-600 font-medium">Efficiency</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-100">
            <div className="text-2xl font-bold text-red-700">${(monthlySummary.totalPenalty / 25000).toFixed(2)}</div>
            <div className="text-sm text-red-600 font-medium">Penalty</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 