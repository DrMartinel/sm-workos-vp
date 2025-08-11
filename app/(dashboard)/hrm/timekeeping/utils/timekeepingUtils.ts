export const generateCalendarData = () => {
  const data: Record<string, any> = {}

  const buildLabel = (base: string, goOut?: boolean) =>
    goOut ? `${base} + Go Out` : base

  const startDate = new Date(2025, 6, 1) // 1/7/2025
  const endDate = new Date(2025, 7, 8)   // 8/8/2025

  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const day = date.getDate()
    const dayOfWeek = date.getDay()
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      data[dateStr] = { type: "weekend", label: "Weekend" }
    } else if (day % 10 === 0) {
      data[dateStr] = { type: "paid-leave", label: "Leave Paid" }
    } else if (day % 15 === 0) {
      data[dateStr] = { type: "unpaid-leave", label: "Leave Unpaid" }
    } else if (day % 9 === 0) {
      data[dateStr] = { type: "no-checkin", label: "No Check-in" }
    } else {
      const seed = day % 10
      // Random goOut for on-time or late with ~30% chance
      const goOut = [2, 4, 7].includes(seed)

      if (seed >= 5) {
        data[dateStr] = {
          type: "on-time",
          checkIn: "08:01",
          checkOut: "17:05",
          label: buildLabel("On Time", goOut),
          mainStatus: "on-time",
          ...(goOut && { goOut: true })
        }
      } else if (seed === 3) {
        data[dateStr] = {
          type: "work-online",
          label: "Work Online",
          checkIn: "08:00",
          checkOut: "17:00"
        }
      } else if (seed === 2) {
        data[dateStr] = {
          type: "late-1-10",
          checkIn: "08:08",
          checkOut: "17:15",
          label: buildLabel("Late 1-10min", goOut),
          mainStatus: "late",
          ...(goOut && { goOut: true })
        }
      } else if (seed === 1) {
        data[dateStr] = {
          type: "late-10-30",
          checkIn: "08:25",
          checkOut: "17:30",
          label: buildLabel("Late 10-30min", goOut),
          mainStatus: "late",
          ...(goOut && { goOut: true })
        }
      } else {
        data[dateStr] = {
          type: "late-over-30",
          checkIn: "09:15",
          checkOut: "18:00",
          label: buildLabel("Late > 30min", goOut),
          mainStatus: "late",
          ...(goOut && { goOut: true })
        }
      }
    }
  }

  // add fallback for every day of the current month
  const now = new Date()
  const fallbackMonth = now.getMonth()
  const fallbackYear = now.getFullYear()
  const daysInFallbackMonth = new Date(fallbackYear, fallbackMonth + 1, 0).getDate()

  for (let day = 1; day <= daysInFallbackMonth; day++) {
    const date = new Date(fallbackYear, fallbackMonth, day)
    const dateStr = `${fallbackYear}-${String(fallbackMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    if (!data[dateStr]) {
      data[dateStr] = {
        type: "not-generated",
        label: "Chưa có dữ liệu",
        allowRequest: true
      }
    }
  }

  return data
}

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

export const getMonthlySummary = (currentDate: Date, calendarData: Record<string, any>, mockRequests: any[]) => {
  const daysInMonth = getDaysInMonth(currentDate)
  const stats = getStatistics(calendarData)
  
  // Calculate weekdays in month
  let weekdays = 0
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const dayOfWeek = date.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not weekend
      weekdays++
    }
  }

  // Total attendance hours (8 hours per weekday)
  const totalAttendanceHours = weekdays * 8

  // Calculate actual working hours from calendar data
  let actualWorkingHours = 0
  let onlineWorkHours = 0
  let goOutOver30Hours = 0

  Object.values(calendarData).forEach((dayData: any) => {
    if (dayData.checkIn && dayData.checkOut) {
      const [inHour, inMinute] = dayData.checkIn.split(":").map(Number)
      const [outHour, outMinute] = dayData.checkOut.split(":").map(Number)
      const inTime = inHour * 60 + inMinute
      const outTime = outHour * 60 + outMinute
      const totalMinutes = outTime - inTime
      const hours = totalMinutes / 60
      actualWorkingHours += hours
    } else if (dayData.type === "work-online") {
      onlineWorkHours += 8 // Assume 8 hours for online work
      actualWorkingHours += 8
    } else if (dayData.type === "go-out-over-30") {
      goOutOver30Hours += 0.5 // 30 minutes
      actualWorkingHours += 7.5 // 8 - 0.5
    } else if (dayData.type === "paid-leave") {
      actualWorkingHours += 8 // Paid leave counts as working hours
    }
  })

  // Calculate OT hours from approved requests
  const otHours = mockRequests
    .filter(req => req.type === "OT" && req.status === "approved")
    .reduce((total, req) => total + (req.otHours || 0), 0)

  // Happy hours (mock calculation - could be based on events, team activities, etc.)
  const happyHours = 12 // Mock value

  // Total hours including OT and happy hours
  const totalHours = actualWorkingHours + otHours + happyHours

  // Efficiency
  const efficiency = totalAttendanceHours > 0 ? (totalHours / totalAttendanceHours) * 100 : 0

  // Total penalty amount
  const totalPenalty = stats["late-1-10"].amount + stats["late-10-30"].amount + stats["late-over-30"].amount

  return {
    totalAttendanceHours: Math.round(totalAttendanceHours),
    otHours: Math.round(otHours),
    happyHours: Math.round(happyHours),
    onlineWorkHours: Math.round(onlineWorkHours),
    goOutOver30Hours: Math.round(goOutOver30Hours * 10) / 10, // Round to 1 decimal
    totalHours: Math.round(totalHours),
    efficiency: Math.round(efficiency * 10) / 10, // Round to 1 decimal
    totalPenalty
  }
}

export const getDaysInMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

export const getFirstDayOfMonth = (date: Date) => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  return firstDay === 0 ? 6 : firstDay - 1
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