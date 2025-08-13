"use client"

import React from "react"
import { Clock, Check, X, Plane, Edit3, FileText } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

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

interface RequestDetailDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  request: Request | null
  onEdit: (request: Request) => void
}

export function RequestDetailDialog({ isOpen, onOpenChange, request, onEdit }: RequestDetailDialogProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-700">
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{request?.type}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">Period:</Label>
            <p className="text-sm">
              {request?.startDate && new Date(request.startDate).toLocaleDateString("en-US")} -{" "}
              {request?.endDate && new Date(request.endDate).toLocaleDateString("en-US")}
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">Submitted:</Label>
            <p className="text-sm">
              {request?.submittedDate && new Date(request.submittedDate).toLocaleDateString("en-US")}
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">Status:</Label>
            <div className="mt-1">{request && getStatusBadge(request.status)}</div>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">Description:</Label>
            <p className="text-sm">{request?.description}</p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          {request?.status === "pending" && (
            <Button 
              onClick={() => {
                onOpenChange(false)
                onEdit(request)
              }}
            >
              Edit
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface AttendanceDetailDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedDay: any
  onCreateRequest: () => void
}

export function AttendanceDetailDialog({ isOpen, onOpenChange, selectedDay, onCreateRequest }: AttendanceDetailDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Attendance Details</DialogTitle>
          <DialogDescription>
            Details for this day
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">Date:</Label>
            <p className="text-sm">
              {selectedDay?.date && new Date(selectedDay.date).toLocaleDateString('en-US', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}
            </p>
          </div>
          {(selectedDay?.mainStatus === "late" || selectedDay?.mainStatus === "on-time") && (
            <div>
              <Label className="text-sm font-medium text-gray-700">Type:</Label>
              <p className={cn(
                "text-sm font-bold mt-1",
                selectedDay.mainStatus === "late" ? "text-red-700" : "text-green-700"
              )}>
                {selectedDay.lateType || (selectedDay.mainStatus === "late" ? "Late" : "On Time")}
                {selectedDay.goOut && " + Go Out >30min"}
              </p>
            </div>
          )}
          {selectedDay?.checkIn && (
            <div>
              <Label className="text-sm font-medium text-gray-700">Check-in:</Label>
              <p className="text-sm">{selectedDay.checkIn}</p>
            </div>
          )}
          {selectedDay?.checkOut && (
            <div>
              <Label className="text-sm font-medium text-gray-700">Check-out:</Label>
              <p className="text-sm">{selectedDay.checkOut}</p>
            </div>
          )}
          {selectedDay?.type === "work-online" && (
            <div>
              <Label className="text-sm font-medium text-gray-700">Type:</Label>
              <p className="text-sm font-bold mt-1">Work Online</p>
            </div>
          )}
          {selectedDay?.type === "paid-leave" && (
            <div>
              <Label className="text-sm font-medium text-gray-700">Type:</Label>
              <p className="text-sm font-bold mt-1">Paid Leave</p>
            </div>
          )}
          {selectedDay?.type === "unpaid-leave" && (
            <div>
              <Label className="text-sm font-medium text-gray-700">Type:</Label>
              <p className="text-sm font-bold mt-1">Unpaid Leave</p>
            </div>
          )}
          {selectedDay?.type === "no-checkin" && (
            <div>
              <Label className="text-sm font-medium text-gray-700">Type:</Label>
              <p className="text-sm font-bold mt-1">No Check-in</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button onClick={onCreateRequest}>
            Create Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface CreateRequestDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedDay: any
  formData: {
    type: string
    description: string
    startTime: string
    endTime: string
  }
  formErrors: Record<string, string>
  onFormDataChange: (field: string, value: string) => void
  onSubmit: () => void
}

export function CreateRequestDialog({ 
  isOpen, 
  onOpenChange, 
  selectedDay, 
  formData, 
  formErrors, 
  onFormDataChange, 
  onSubmit 
}: CreateRequestDialogProps) {
  const requestTypes = [
    { value: "leave-paid", label: "Leave Paid", icon: Plane },
    { value: "leave-unpaid", label: "Leave Unpaid", icon: Plane },
    { value: "ot", label: "OT", icon: Clock },
    { value: "go-out", label: "Go Out", icon: FileText },
    { value: "work-from-home", label: "Work From Home", icon: FileText },
    { value: "time-edit", label: "Time Edit", icon: Edit3 },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create request</DialogTitle>
          <DialogDescription>
            Day: <span className="font-semibold">{selectedDay?.date}</span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={e => { e.preventDefault(); onSubmit(); }}>
          <div className="grid gap-4 py-4">
            <div className="grid items-center grid-cols-4 gap-4">
              <Label htmlFor="type" className="text-right">
                Request Type
              </Label>
              <Select onValueChange={value => onFormDataChange("type", value)} value={formData.type}>
                <SelectTrigger id="type" className="col-span-3">
                  <SelectValue placeholder="Select request type" />
                </SelectTrigger>
                <SelectContent>
                  {requestTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.type && <p className="col-start-2 col-span-3 text-sm text-red-500">{formErrors.type}</p>}
            </div>
            
            <div className="grid items-center grid-cols-4 gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e => onFormDataChange("description", e.target.value)}
                className="col-span-3"
              />
              {formErrors.description && <p className="col-start-2 col-span-3 text-sm text-red-500">{formErrors.description}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid items-center grid-cols-4 col-span-1 gap-4">
                <Label htmlFor="startTime" className="text-right">
                  Start Time
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={e => onFormDataChange("startTime", e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid items-center grid-cols-4 col-span-1 gap-4">
                <Label htmlFor="endTime" className="text-right">
                  End Time
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={e => onFormDataChange("endTime", e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Send</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface EditRequestDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  formData: {
    type: string
    description: string
    startTime: string
    endTime: string
  }
  formErrors: Record<string, string>
  onFormDataChange: (field: string, value: string) => void
  onSubmit: () => void
}

export function EditRequestDialog({ 
  isOpen, 
  onOpenChange, 
  formData, 
  formErrors, 
  onFormDataChange, 
  onSubmit 
}: EditRequestDialogProps) {
  const requestTypes = [
    { value: "leave-paid", label: "Leave Paid", icon: Plane },
    { value: "leave-unpaid", label: "Leave Unpaid", icon: Plane },
    { value: "ot", label: "OT", icon: Clock },
    { value: "go-out", label: "Go Out", icon: FileText },
    { value: "work-from-home", label: "Work From Home", icon: FileText },
    { value: "time-edit", label: "Time Edit", icon: Edit3 },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Request</DialogTitle>
        </DialogHeader>
        <form onSubmit={e => { e.preventDefault(); onSubmit(); }}>
          <div className="grid gap-4 py-4">
            <div className="grid items-center grid-cols-4 gap-4">
              <Label htmlFor="type" className="text-right">
                Request Type
              </Label>
              <Select onValueChange={value => onFormDataChange("type", value)} value={formData.type}>
                <SelectTrigger id="type" className="col-span-3">
                  <SelectValue placeholder="Select request type" />
                </SelectTrigger>
                <SelectContent>
                  {requestTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.type && <p className="col-start-2 col-span-3 text-sm text-red-500">{formErrors.type}</p>}
            </div>

            <div className="grid items-center grid-cols-4 gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e => onFormDataChange("description", e.target.value)}
                className="col-span-3"
              />
              {formErrors.description && <p className="col-start-2 col-span-3 text-sm text-red-500">{formErrors.description}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid items-center grid-cols-4 col-span-1 gap-4">
                <Label htmlFor="startTime" className="text-right">
                  Start Time
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={e => onFormDataChange("startTime", e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid items-center grid-cols-4 col-span-1 gap-4">
                <Label htmlFor="endTime" className="text-right">
                  End Time
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={e => onFormDataChange("endTime", e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Update</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 