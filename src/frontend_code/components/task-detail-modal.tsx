"use client"

import { Input } from "@/components/ui/input"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Bell,
  Tag,
  Flag,
  ChevronDown,
  Paperclip,
  Link2,
  Smile,
  Send,
  Plus,
  Check,
  MoreHorizontal,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogClose } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

// Mock data
const mockUsers = [
  { id: "u1", name: "Quang H.", avatar: "/placeholder.svg?height=40&width=40" },
  { id: "u2", name: "Minh T.", avatar: "/placeholder.svg?height=40&width=40" },
  { id: "u3", name: "Hoa L.", avatar: "/placeholder.svg?height=40&width=40" },
  { id: "u4", name: "Tuan V.", avatar: "/placeholder.svg?height=40&width=40" },
]

const mockProjects = [
  { id: "p1", name: "Công việc", icon: "🏢", color: "red" },
  { id: "p2", name: "Báo quát MKT", icon: "📊", color: "blue" },
  { id: "p3", name: "Báo quát SMG", icon: "📱", color: "green" },
  { id: "p4", name: "Inbox", icon: "📥", color: "gray" },
]

const mockPriorities = [
  { id: "p1", name: "P1", color: "red" },
  { id: "p2", name: "P2", color: "orange" },
  { id: "p3", name: "P3", color: "yellow" },
  { id: "p4", name: "P4", color: "blue" },
]

const mockLabels = [
  { id: "l1", name: "Urgent", color: "red" },
  { id: "l2", name: "Important", color: "yellow" },
  { id: "l3", name: "Low Priority", color: "blue" },
  { id: "l4", name: "Waiting", color: "purple" },
]

const mockTaskTypes = [
  { id: "design", name: "Design UI/UX" },
  { id: "development", name: "Development" },
  { id: "documentation", name: "Documentation" },
  { id: "bugfix", name: "Bug Fix" },
  { id: "testing", name: "Testing" },
  { id: "review", name: "Review" },
]

const mockWorkflowSteps = [
  { id: "todo", name: "To Do" },
  { id: "in-progress", name: "In Progress" },
  { id: "done", name: "Done" },
]

interface TaskDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: any // In a real app, you would define a proper Task type
}

export function TaskDetailModal({ open, onOpenChange, task }: TaskDetailModalProps) {
  const [title, setTitle] = useState("Giao nhiệm vụ Market Research cho bên ASO")
  const [description, setDescription] = useState("")
  const [subTasks, setSubTasks] = useState([
    { id: "st1", title: "Nghiên cứu user insight", completed: false },
    { id: "st2", title: "Nghiên cứu market insight", completed: false },
    { id: "st3", title: "Nghiên cứu ngách sản phẩm để đánh (bám theo các tiêu chí từng giai đoạn)", completed: false },
  ])
  const [newSubTask, setNewSubTask] = useState("")
  const [comments, setComments] = useState([
    {
      id: "c1",
      user: mockUsers[0],
      date: new Date(2025, 2, 27, 15, 29),
      content: `Tổng quan có các việc:
- Nghiên cứu user insight
- Nghiên cứu market insight
- Nghiên cứu ngách sản phẩm để đánh (bám theo các tiêu chí từng giai đoạn)
- Nghiên cứu tổng quan thị trường game
- Nghiên cứu các đối thủ trong ngành
- Nghiên cứu trending`,
    },
  ])
  const [newComment, setNewComment] = useState("")
  const [selectedProject, setSelectedProject] = useState(mockProjects[1])
  const [selectedAssignee, setSelectedAssignee] = useState<(typeof mockUsers)[0] | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedDeadline, setSelectedDeadline] = useState<Date | null>(null)
  const [selectedPriority, setSelectedPriority] = useState(mockPriorities[3])
  const [selectedLabels, setSelectedLabels] = useState<typeof mockLabels>([])
  const [reminders, setReminders] = useState<string[]>([])
  const [location, setLocation] = useState("")
  const [selectedTaskType, setSelectedTaskType] = useState(mockTaskTypes[0])
  const [selectedWorkflowStatus, setSelectedWorkflowStatus] = useState(mockWorkflowSteps[0])
  const [customFields, setCustomFields] = useState({
    budgetAmount: "$5,000",
    approver: mockUsers[1],
    department: "Engineering",
    complexity: "Medium",
  })

  const commentInputRef = useRef<HTMLTextAreaElement>(null)

  const handleAddSubTask = () => {
    if (newSubTask.trim()) {
      setSubTasks([
        ...subTasks,
        {
          id: `st${subTasks.length + 1}`,
          title: newSubTask,
          completed: false,
        },
      ])
      setNewSubTask("")
    }
  }

  const handleToggleSubTask = (id: string) => {
    setSubTasks(
      subTasks.map((st) =>
        st.id === id
          ? {
              ...st,
              completed: !st.completed,
            }
          : st,
      ),
    )
  }

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([
        ...comments,
        {
          id: `c${comments.length + 1}`,
          user: mockUsers[0], // Current user
          date: new Date(),
          content: newComment,
        },
      ])
      setNewComment("")
    }
  }

  const formatCommentContent = (content: string) => {
    // Simple markdown-like formatting
    const lines = content.split("\n")
    return lines.map((line, i) => {
      if (line.startsWith("- ")) {
        return (
          <li key={i} className="ml-5 list-disc">
            {line.substring(2)}
          </li>
        )
      }
      return <p key={i}>{line}</p>
    })
  }

  // Focus comment input when clicking on the comment area
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (commentInputRef.current && !commentInputRef.current.contains(event.target as Node)) {
        // Click outside the comment input
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Metadata item component for right sidebar
  const MetadataItem = ({
    label,
    children,
    onClick,
  }: {
    label: string
    children: React.ReactNode
    onClick?: () => void
  }) => (
    <div className="mb-6">
      <div className="text-xs font-medium text-gray-500 uppercase mb-2">{label}</div>
      <div
        className={cn("flex items-center", onClick && "cursor-pointer hover:bg-gray-50 rounded-md p-1 -ml-1")}
        onClick={onClick}
      >
        {children}
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 flex flex-col">
        <div className="flex flex-1 min-h-0">
          {/* Main content */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Fixed Header */}
            <div className="flex-shrink-0 p-6 pb-0">
              <DialogHeader className="mb-6">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <span className="flex items-center gap-1">
                    <span className="text-sm">{selectedProject.icon}</span> {selectedProject.name}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 pr-4">
                    <button className="mt-1 flex-shrink-0 h-5 w-5 rounded border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors">
                      <Check className="h-3 w-3 text-gray-500 opacity-0" />
                    </button>
                    <textarea
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full text-xl font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 resize-none overflow-hidden"
                      rows={1}
                      style={{ height: "auto" }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement
                        target.style.height = "auto"
                        target.style.height = `${target.scrollHeight}px`
                      }}
                    />
                  </div>
                  <DialogClose className="h-6 w-6 rounded-md hover:bg-gray-100 inline-flex items-center justify-center">
                    <X className="h-4 w-4" />
                  </DialogClose>
                </div>
              </DialogHeader>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {/* Description */}
              <div className="mb-6">
                <div className="flex items-center gap-2 text-xs uppercase font-medium text-gray-500 mb-2">
                  <span>Description</span>
                </div>
                <Textarea
                  placeholder="Add a description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px] resize-none border-none bg-gray-50 focus:bg-white transition-colors"
                />
              </div>

              {/* Custom Fields */}
              <div className="mb-6">
                <div className="flex items-center gap-2 text-xs uppercase font-medium text-gray-500 mb-4">
                  <span>Custom Fields</span>
                </div>

                <div className="space-y-4">
                  {/* Budget Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="budget-amount" className="text-sm font-medium text-gray-700">
                      Budget Amount
                    </Label>
                    <Input
                      id="budget-amount"
                      value={customFields.budgetAmount}
                      onChange={(e) => setCustomFields({ ...customFields, budgetAmount: e.target.value })}
                      className="bg-gray-50 focus:bg-white transition-colors"
                      placeholder="Enter budget amount"
                    />
                  </div>

                  {/* Approver */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Approver</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start bg-gray-50 hover:bg-white">
                          {customFields.approver ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage
                                  src={customFields.approver.avatar || "/placeholder.svg"}
                                  alt={customFields.approver.name}
                                />
                                <AvatarFallback>{customFields.approver.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{customFields.approver.name}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Select approver</span>
                          )}
                          <ChevronDown className="h-4 w-4 ml-auto text-gray-400" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-1">
                        <div className="space-y-1">
                          {mockUsers.map((user) => (
                            <div
                              key={user.id}
                              className={cn(
                                "flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-100",
                                customFields.approver?.id === user.id && "bg-gray-100",
                              )}
                              onClick={() => setCustomFields({ ...customFields, approver: user })}
                            >
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{user.name}</span>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Department */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Department</Label>
                    <Select
                      value={customFields.department}
                      onValueChange={(value) => setCustomFields({ ...customFields, department: value })}
                    >
                      <SelectTrigger className="bg-gray-50 focus:bg-white">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Support">Support</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Complexity */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Complexity</Label>
                    <Select
                      value={customFields.complexity}
                      onValueChange={(value) => setCustomFields({ ...customFields, complexity: value })}
                    >
                      <SelectTrigger className="bg-gray-50 focus:bg-white">
                        <SelectValue placeholder="Select complexity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Very High">Very High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Subtasks */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs uppercase font-medium text-gray-500 mb-2">
                  <span>Subtasks</span>
                  <span className="text-gray-400">
                    {subTasks.filter((st) => st.completed).length}/{subTasks.length}
                  </span>
                </div>
                <div className="space-y-2 mb-3">
                  {subTasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-start gap-2 p-2 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <button
                        onClick={() => handleToggleSubTask(subtask.id)}
                        className="mt-0.5 flex-shrink-0 h-4 w-4 rounded-full border border-gray-300 flex items-center justify-center"
                      >
                        {subtask.completed && <Check className="h-3 w-3 text-gray-500" />}
                      </button>
                      <span className={cn("text-sm", subtask.completed && "line-through text-gray-400")}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 text-gray-500 hover:text-gray-700"
                    onClick={() => {
                      const input = document.getElementById("new-subtask-input") as HTMLInputElement
                      if (input) input.focus()
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add subtask</span>
                  </Button>
                </div>
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <input
                      id="new-subtask-input"
                      type="text"
                      placeholder="New subtask"
                      value={newSubTask}
                      onChange={(e) => setNewSubTask(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddSubTask()
                        }
                      }}
                      className="flex-1 text-sm border-none bg-gray-50 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-200 focus:bg-white"
                    />
                    <Button
                      size="sm"
                      className="h-8 bg-gray-900 hover:bg-gray-800"
                      onClick={handleAddSubTask}
                      disabled={!newSubTask.trim()}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              {/* Comments */}
              <div>
                <div className="flex items-center justify-between text-xs uppercase font-medium text-gray-500 mb-4">
                  <span>Comments</span>
                  <span className="text-gray-400">{comments.length}</span>
                </div>

                <div className="space-y-6 mb-6">
                  {comments.map((comment) => (
                    <div key={comment.id} className="group">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.user.avatar || "/placeholder.svg"} alt={comment.user.name} />
                          <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{comment.user.name}</span>
                              <span className="text-xs text-gray-500">
                                {format(comment.date, "d MMM, HH:mm", { locale: vi })}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="mt-1 text-sm text-gray-700 space-y-1">
                            {formatCommentContent(comment.content)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* New comment */}
                <div className="flex items-start gap-3 mt-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={mockUsers[0].avatar || "/placeholder.svg"} alt={mockUsers[0].name} />
                    <AvatarFallback>{mockUsers[0].name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <Textarea
                      ref={commentInputRef}
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[80px] resize-none border-none bg-gray-50 focus:bg-white transition-colors"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.ctrlKey) {
                          e.preventDefault()
                          handleAddComment()
                        }
                      }}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                          <Link2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                          <Smile className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        className="h-8 gap-1 bg-gray-900 hover:bg-gray-800"
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Send</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar - metadata */}
          <div className="w-72 flex-shrink-0 border-l border-gray-100 bg-gray-50/50 flex flex-col">
            <div className="flex-1 overflow-y-auto p-6">
              {/* Project */}
              <MetadataItem label="Project">
                <Popover>
                  <PopoverTrigger asChild>
                    <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded-md w-full">
                      <span className="text-base">{selectedProject.icon}</span>
                      <span className="text-sm font-medium flex-1">{selectedProject.name}</span>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-1">
                    <div className="space-y-1">
                      {mockProjects.map((project) => (
                        <div
                          key={project.id}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-100",
                            selectedProject.id === project.id && "bg-gray-100",
                          )}
                          onClick={() => setSelectedProject(project)}
                        >
                          <span className="text-base">{project.icon}</span>
                          <span className="text-sm">{project.name}</span>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </MetadataItem>

              {/* Task Type */}
              <MetadataItem label="Task Type">
                <Popover>
                  <PopoverTrigger asChild>
                    <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded-md w-full">
                      <span className="text-sm flex-1">{selectedTaskType.name}</span>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-1">
                    <div className="space-y-1">
                      {mockTaskTypes.map((taskType) => (
                        <div
                          key={taskType.id}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-100",
                            selectedTaskType.id === taskType.id && "bg-gray-100",
                          )}
                          onClick={() => setSelectedTaskType(taskType)}
                        >
                          <span className="text-sm">{taskType.name}</span>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </MetadataItem>

              {/* Workflow Status */}
              <MetadataItem label="Workflow Status">
                <Popover>
                  <PopoverTrigger asChild>
                    <div
                      className={cn(
                        "flex items-center gap-2 cursor-pointer hover:opacity-80 p-2 rounded-md w-full transition-opacity",
                        selectedWorkflowStatus.id === "todo" && "bg-gray-100",
                        selectedWorkflowStatus.id === "in-progress" && "bg-blue-100",
                        selectedWorkflowStatus.id === "done" && "bg-green-100",
                      )}
                    >
                      <span className="text-sm flex-1 font-medium">{selectedWorkflowStatus.name}</span>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-1">
                    <div className="space-y-1">
                      {mockWorkflowSteps.map((step) => (
                        <div
                          key={step.id}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-md cursor-pointer hover:opacity-80 transition-opacity",
                            selectedWorkflowStatus.id === step.id && "ring-2 ring-blue-500 ring-offset-1",
                            step.id === "todo" && "bg-gray-100",
                            step.id === "in-progress" && "bg-blue-100",
                            step.id === "done" && "bg-green-100",
                          )}
                          onClick={() => setSelectedWorkflowStatus(step)}
                        >
                          <span className="text-sm font-medium">{step.name}</span>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </MetadataItem>

              {/* Assignee */}
              <MetadataItem label="Assignee">
                <Popover>
                  <PopoverTrigger asChild>
                    <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded-md w-full">
                      {selectedAssignee ? (
                        <>
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={selectedAssignee.avatar || "/placeholder.svg"}
                              alt={selectedAssignee.name}
                            />
                            <AvatarFallback>{selectedAssignee.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm flex-1">{selectedAssignee.name}</span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500 flex-1">Unassigned</span>
                      )}
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-1">
                    <div className="space-y-1">
                      <div
                        className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-100"
                        onClick={() => setSelectedAssignee(null)}
                      >
                        <span className="text-sm text-gray-500">Unassigned</span>
                      </div>
                      {mockUsers.map((user) => (
                        <div
                          key={user.id}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-100",
                            selectedAssignee?.id === user.id && "bg-gray-100",
                          )}
                          onClick={() => setSelectedAssignee(user)}
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{user.name}</span>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </MetadataItem>

              {/* Date */}
              <MetadataItem label="Date">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{format(selectedDate, "d MMM", { locale: vi })}</span>
                </div>
              </MetadataItem>

              {/* Deadline */}
              <MetadataItem label="Deadline">
                <Popover>
                  <PopoverTrigger asChild>
                    <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded-md w-full">
                      <Clock className="h-4 w-4 text-gray-500" />
                      {selectedDeadline ? (
                        <span className="text-sm flex-1">{format(selectedDeadline, "d MMM", { locale: vi })}</span>
                      ) : (
                        <span className="text-sm text-gray-500 flex-1">No deadline</span>
                      )}
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-1">
                    <div className="space-y-1">
                      <div
                        className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-100"
                        onClick={() => setSelectedDeadline(null)}
                      >
                        <span className="text-sm text-gray-500">No deadline</span>
                      </div>
                      <div
                        className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-100"
                        onClick={() => setSelectedDeadline(new Date())}
                      >
                        <span className="text-sm">Today</span>
                      </div>
                      <div
                        className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          const tomorrow = new Date()
                          tomorrow.setDate(tomorrow.getDate() + 1)
                          setSelectedDeadline(tomorrow)
                        }}
                      >
                        <span className="text-sm">Tomorrow</span>
                      </div>
                      <div
                        className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          const nextWeek = new Date()
                          nextWeek.setDate(nextWeek.getDate() + 7)
                          setSelectedDeadline(nextWeek)
                        }}
                      >
                        <span className="text-sm">Next week</span>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </MetadataItem>

              {/* Priority */}
              <MetadataItem label="Priority">
                <Popover>
                  <PopoverTrigger asChild>
                    <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded-md w-full">
                      <Flag
                        className={cn(
                          "h-4 w-4",
                          selectedPriority.id === "p1" && "text-red-500",
                          selectedPriority.id === "p2" && "text-orange-500",
                          selectedPriority.id === "p3" && "text-yellow-500",
                          selectedPriority.id === "p4" && "text-blue-500",
                        )}
                      />
                      <span className="text-sm flex-1">{selectedPriority.name}</span>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-1">
                    <div className="space-y-1">
                      {mockPriorities.map((priority) => (
                        <div
                          key={priority.id}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-100",
                            selectedPriority.id === priority.id && "bg-gray-100",
                          )}
                          onClick={() => setSelectedPriority(priority)}
                        >
                          <Flag
                            className={cn(
                              "h-4 w-4",
                              priority.id === "p1" && "text-red-500",
                              priority.id === "p2" && "text-orange-500",
                              priority.id === "p3" && "text-yellow-500",
                              priority.id === "p4" && "text-blue-500",
                            )}
                          />
                          <span className="text-sm">{priority.name}</span>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </MetadataItem>

              {/* Labels */}
              <MetadataItem label="Labels">
                <Popover>
                  <PopoverTrigger asChild>
                    <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded-md w-full">
                      <Tag className="h-4 w-4 text-gray-500" />
                      {selectedLabels.length > 0 ? (
                        <div className="flex flex-wrap gap-1 flex-1">
                          {selectedLabels.map((label) => (
                            <Badge
                              key={label.id}
                              className={cn(
                                "text-xs px-1.5 py-0 h-5 font-normal",
                                label.color === "red" && "bg-red-50 text-red-700 hover:bg-red-50 border-red-200",
                                label.color === "yellow" &&
                                  "bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200",
                                label.color === "blue" && "bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200",
                                label.color === "purple" &&
                                  "bg-purple-50 text-purple-700 hover:bg-purple-50 border-purple-200",
                              )}
                            >
                              {label.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 flex-1">No labels</span>
                      )}
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-1">
                    <div className="space-y-1">
                      {mockLabels.map((label) => (
                        <div
                          key={label.id}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-100",
                            selectedLabels.some((l) => l.id === label.id) && "bg-gray-100",
                          )}
                          onClick={() => {
                            if (selectedLabels.some((l) => l.id === label.id)) {
                              setSelectedLabels(selectedLabels.filter((l) => l.id !== label.id))
                            } else {
                              setSelectedLabels([...selectedLabels, label])
                            }
                          }}
                        >
                          <div
                            className={cn(
                              "h-3 w-3 rounded-full",
                              label.color === "red" && "bg-red-500",
                              label.color === "yellow" && "bg-amber-500",
                              label.color === "blue" && "bg-blue-500",
                              label.color === "purple" && "bg-purple-500",
                            )}
                          />
                          <span className="text-sm flex-1">{label.name}</span>
                          {selectedLabels.some((l) => l.id === label.id) && <Check className="h-4 w-4 text-gray-500" />}
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </MetadataItem>

              {/* Reminders */}
              <MetadataItem label="Reminders">
                <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded-md w-full">
                  <Bell className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500 flex-1">No reminders</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </MetadataItem>

              {/* Location */}
              <MetadataItem label="Location">
                <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded-md w-full">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  {location ? (
                    <span className="text-sm flex-1">{location}</span>
                  ) : (
                    <span className="text-sm text-gray-500 flex-1">Add location</span>
                  )}
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </MetadataItem>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
