export const getStatistics = (calendarData: Record<string, any>) => {
  const stats = {
    "late-1-10": { count: 0, amount: 0 },
    "late-10-30": { count: 0, amount: 0 },
    "late-over-30": { count: 0, amount: 0 },
    "unpaid-leave": { count: 0, amount: 0 },
    weekend: { count: 0, amount: 0 },
    "go-out-over-30": { count: 0, amount: 0 },
    "paid-leave": { count: 0, amount: 0 },
    "work-online": { count: 0, amount: 0 },
    "on-time": { count: 0, amount: 0 },
    "no-checkin": { count: 0, amount: 0 },
  }

  Object.values(calendarData).forEach((dayData: any) => {
    if (stats[dayData.type as keyof typeof stats]) {
      stats[dayData.type as keyof typeof stats].count++
      // Mock penalty amounts
      if (dayData.type === "late-1-10") stats[dayData.type as keyof typeof stats].amount += 50000
      if (dayData.type === "late-10-30") stats[dayData.type as keyof typeof stats].amount += 100000
      if (dayData.type === "late-over-30") stats[dayData.type as keyof typeof stats].amount += 200000
    }
  })

  return stats
}

export const getMonthlySummary = (currentDate: Date, calendarData: Record<string, any>, requests: any[]) => {
  const daysInMonth = getDaysInMonth(currentDate)
  
  // Calculate weekdays in month
  let weekdays = 0
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const dayOfWeek = date.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not weekend
      weekdays++
    }
  }

  // Calculate actual working hours from timekeeping data
  let totalHours = 0
  Object.values(calendarData).forEach((dayData: any) => {
    if (dayData.checkIn && dayData.checkOut) {
      const [inHour, inMinute] = dayData.checkIn.split(":").map(Number)
      const [outHour, outMinute] = dayData.checkOut.split(":").map(Number)
      const inTime = inHour * 60 + inMinute
      const outTime = outHour * 60 + outMinute
      const totalMinutes = outTime - inTime
      const hours = totalMinutes / 60
      totalHours += hours
    }
  })

  // Calculate OT hours from approved requests
  const otHours = requests
    .filter(req => req.type === "OT" && req.status === "approved")
    .reduce((total, req) => total + (req.otHours || 0), 0)

  // Calculate efficiency (actual hours vs expected hours)
  const expectedHours = weekdays * 8 // 8 hours per weekday
  const efficiency = expectedHours > 0 ? ((totalHours + otHours) / expectedHours) * 100 : 0

  // Calculate penalty from late check-ins
  let totalPenalty = 0
  Object.values(calendarData).forEach((dayData: any) => {
    if (dayData.isLate === true && dayData.checkIn) {
      const classification = classifyTimekeeping(dayData.checkIn)
      if (classification.lateMinutes <= 10) {
        totalPenalty += 50000 // 50k VND for 1-10 min late
      } else if (classification.lateMinutes <= 30) {
        totalPenalty += 100000 // 100k VND for 10-30 min late
      } else {
        totalPenalty += 200000 // 200k VND for >30 min late
      }
    }
  })

  return {
    totalHours: Math.round(totalHours),
    otHours: Math.round(otHours),
    efficiency: Math.round(efficiency * 10) / 10, // Round to 1 decimal
    totalPenalty
  }
}

export const getDaysInMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

// Helper function to format time from database timestamp
export const formatTimeFromTimestamp = (timestamp: string | null): string | null => {
  if (!timestamp) return null
  try {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  } catch {
    return null
  }
}

// ============================================================================
// TIMEKEEPING CLASSIFICATION SYSTEM
// ============================================================================
// This module centralizes all timekeeping classification logic to prevent
// inconsistencies and make maintenance easier.

export interface TimekeepingClassification {
  isLate: boolean
  lateMinutes: number
}

export interface TimekeepingDayData {
  isLate?: boolean
  checkIn?: string
  checkOut?: string
  requests?: Array<{
    id: string
    type: string
    status: string
    description?: string
  }>
}

/**
 * Classifies timekeeping status based on check-in time
 * @param checkInTime - Check-in time in HH:MM format
 * @param workdayStart - Workday start time (default: "08:30")
 * @returns Classification object
 */
export const classifyTimekeeping = (
  checkInTime: string, 
  workdayStart: string = "08:30"
): TimekeepingClassification => {
  const [checkInHour, checkInMinute] = checkInTime.split(':').map(Number)
  const [workHour, workMinute] = workdayStart.split(':').map(Number)
  
  const checkInMinutes = checkInHour * 60 + checkInMinute
  const workMinutes = workHour * 60 + workMinute
  const lateMinutes = checkInMinutes - workMinutes
  console.log(lateMinutes)
  
  if (lateMinutes <= 0) {
    return {
      isLate: false,
      lateMinutes: 0
    }
  } else if (lateMinutes <= 10) {
    return {
      isLate: true,
      lateMinutes
    }
  } else if (lateMinutes <= 30) {
    return {
      isLate: true,
      lateMinutes
    }
  } else {
    return {
      isLate: true,
      lateMinutes
    }
  }
}

/**
 * Gets the display label for a timekeeping day based on its data
 * @param dayData - The day data object
 * @param dateStr - Date string in YYYY-MM-DD format (optional, for weekend detection)
 * @returns Display label string
 */
export const getTimekeepingLabel = (dayData: TimekeepingDayData, dateStr?: string): string => {
  if (!dayData) return "No data"

  // Check if it's a weekend
  if (dateStr) {
    const date = new Date(dateStr)
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return "Weekend"
    }
  }

  if (dayData.isLate === false) {
    return "On Time"
  }
  
  if (dayData.isLate === true) {
    if (dayData.checkIn) {
      const classification = classifyTimekeeping(dayData.checkIn)
      if (classification.lateMinutes <= 10) {
        return "Late 1-10min"
      } else if (classification.lateMinutes <= 30) {
        return "Late 10-30min"
      } else {
        return "Late >30min"
      }
    }
    return "Late"
  }
  
  return "No Check-in"
}

/**
 * Gets the CSS classes for styling a timekeeping day card
 * @param dayData - The day data object
 * @returns Object with background and text color classes
 */
export const getTimekeepingStyles = (dayData: TimekeepingDayData): {
  cardBgColor: string
  textColor: string
} => {
  if (!dayData) {
    return {
      cardBgColor: "bg-gray-100 border-gray-300",
      textColor: "text-gray-400"
    }
  }

  if (dayData.isLate === true) {
    return {
      cardBgColor: "bg-red-50 border-red-300",
      textColor: "text-red-700"
    }
  } else if (dayData.isLate === false) {
    return {
      cardBgColor: "bg-green-50 border-green-300",
      textColor: "text-green-700"
    }
  }
  
  return {
    cardBgColor: "bg-gray-100 border-gray-300",
    textColor: "text-gray-400"
  }
}

/**
 * Gets the CSS classes for styling request indicators
 * @param requestType - The type of request
 * @returns Object with background and text color classes for request indicators
 */
export const getRequestIndicatorStyles = (requestType: string): {
  bgColor: string
  textColor: string
} => {
  switch (requestType) {
    case "Leave Paid":
      return {
        bgColor: "bg-blue-200",
        textColor: "text-blue-800"
      }
    case "Leave Unpaid":
      return {
        bgColor: "bg-orange-200",
        textColor: "text-orange-800"
      }
    case "OT":
      return {
        bgColor: "bg-purple-200",
        textColor: "text-purple-800"
      }
    case "Work From Home":
      return {
        bgColor: "bg-indigo-200",
        textColor: "text-indigo-800"
      }
    case "Go Out":
      return {
        bgColor: "bg-yellow-200",
        textColor: "text-yellow-800"  
      }
    case "Time Edit":
      return {
        bgColor: "bg-teal-200",
        textColor: "text-teal-800"
      }
    default:
      return {
        bgColor: "bg-gray-200",
        textColor: "text-gray-800"
      }
  }
}

/**
 * Determines if a day should be shown based on view mode and filter
 * @param dayData - The day data object
 * @param viewMode - Current view mode ("all", "working", "weekends")
 * @param calendarFilter - Current filter ("all", "late", "on-time", etc.)
 * @returns Boolean indicating if the day should be shown
 */
export const shouldShowDay = (
  dayData: TimekeepingDayData,
  viewMode: string,
  calendarFilter: string,
  requestFilter: string = "all"
): boolean => {
  if (!dayData) return false
  
  // Category filtering (timekeeping)
  const matchesTimekeeping = calendarFilter === "all" || 
    (calendarFilter === "late" && dayData?.isLate === true) ||
    (calendarFilter === "on-time" && dayData?.isLate === false) ||
    (calendarFilter === "no-checkin" && dayData?.isLate === undefined)
  
  // Request filtering
  const matchesRequest = requestFilter === "all" ||
    (Array.isArray((dayData as any).requests) && (dayData as any).requests.some((r: any) => r?.type === requestFilter))
  
  return matchesTimekeeping && matchesRequest
}

export const getFirstDayOfMonth = (date: Date) => {
  // Get the day of week for the first day of the month (0 = Sunday, 1 = Monday, etc.)
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  
  // Convert to Monday-based week (0 = Monday, 1 = Tuesday, ..., 6 = Sunday)
  // Sunday becomes 6, Monday becomes 0, Tuesday becomes 1, etc.
  const mondayBasedDay = firstDay === 0 ? 6 : firstDay - 1
  
  return mondayBasedDay
}

export const checkLocation = async (): Promise<"approved" | "denied"> => {
  if (!navigator.geolocation) {
    return "denied"
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude
        const userLng = position.coords.longitude
        const officeLat = 21.018405
        const officeLng = 105.809683

        // Haversine formula to calculate distance in meters
        function toRad(x: number) {
          return (x * Math.PI) / 180
        }
        const R = 6371000 // meters
        const dLat = toRad(officeLat - userLat)
        const dLon = toRad(officeLng - userLng)
        const lat1 = toRad(userLat)
        const lat2 = toRad(officeLat)

        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const distance = R * c

        if (distance <= 1000000) {
          resolve("approved")
        } else {
          resolve("denied")
        }
      },
      (error) => {
        resolve("denied")
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  })
} 