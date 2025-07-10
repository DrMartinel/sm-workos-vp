"use client"

import { useState, useEffect } from "react"
import { format, isToday, isPast, isFuture, addDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns"
import { vi } from "date-fns/locale"
import { Calendar, CheckCircle2, Circle, Flag, Tag, AlertCircle, Plus, MoreHorizontal, Folder } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useSearchParams } from "next/navigation"
import { TaskDetailModal } from "@/components/task-detail-modal"

// Mock data
const mockProjects = [
  { id: "chatbot-ai", name: "Chatbot AI", color: "blue", count: 5 },
  { id: "fashion-game", name: "Fashion Game", color: "purple", count: 8 },
  { id: "ai-note-taker", name: "AI Note Taker", color: "green", count: 3 },
]

const mockTaskTypes = [
  { id: "design", name: "Design UI/UX", color: "default" },
  { id: "development", name: "Development", color: "default" },
  { id: "documentation", name: "Documentation", color: "default" },
  { id: "bugfix", name: "Bug Fix", color: "default" },
  { id: "testing", name: "Testing", color: "default" },
  { id: "review", name: "Review", color: "default" },
]

const mockWorkflowSteps = [
  { id: "todo", name: "To Do", color: "gray" },
  { id: "in-progress", name: "In Progress", color: "blue" },
  { id: "done", name: "Done", color: "green" },
]

const mockTasks = [
  {
    id: "task1",
    title: "Thiết kế màn hình paywall cho Chatbot AI",
    description: "Tạo wireframe và mockup cho màn hình thanh toán premium",
    dueDate: new Date(new Date().setDate(new Date().getDate() - 2)),
    project: "chatbot-ai",
    taskType: "design",
    priority: "high",
    completed: false,
    workflowStep: "in-progress",
  },
  {
    id: "task2",
    title: "Phát triển API đăng nhập cho Fashion Game",
    description: "Xây dựng endpoint authentication với JWT",
    dueDate: new Date(),
    project: "fashion-game",
    taskType: "development",
    priority: "medium",
    completed: false,
    workflowStep: "in-progress",
  },
  {
    id: "task3",
    title: "Viết tài liệu hướng dẫn sử dụng AI Note Taker",
    description: "Tạo user manual cho tính năng mới",
    dueDate: new Date(),
    project: "ai-note-taker",
    taskType: "documentation",
    priority: "medium",
    completed: true,
    workflowStep: "done",
  },
  {
    id: "task4",
    title: "Fix bug hiển thị dashboard Fashion Game",
    description: "Sửa lỗi layout bị vỡ trên mobile",
    dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    project: "fashion-game",
    taskType: "bugfix",
    priority: "high",
    completed: false,
    workflowStep: "todo",
  },
  {
    id: "task5",
    title: "Test tính năng thanh toán Chatbot AI",
    description: "Kiểm tra flow thanh toán end-to-end",
    dueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
    project: "chatbot-ai",
    taskType: "testing",
    priority: "high",
    completed: false,
    workflowStep: "in-progress",
  },
  {
    id: "task6",
    title: "Review code pull request AI Note Taker",
    description: "Xem xét và phê duyệt PR #123",
    dueDate: new Date(new Date().setDate(new Date().getDate() + 3)),
    project: "ai-note-taker",
    taskType: "review",
    priority: "medium",
    completed: false,
    workflowStep: "todo",
  },
  {
    id: "task7",
    title: "Thiết kế UI cho tính năng chat Fashion Game",
    description: "Tạo giao diện chat trong game",
    dueDate: new Date(new Date().setDate(new Date().getDate() - 1)),
    project: "fashion-game",
    taskType: "design",
    priority: "low",
    completed: false,
    workflowStep: "todo",
  },
  {
    id: "task8",
    title: "Cập nhật thuật toán AI cho Note Taker",
    description: "Cải thiện độ chính xác của AI",
    dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
    project: "ai-note-taker",
    taskType: "development",
    priority: "low",
    completed: false,
    workflowStep: "todo",
  },
  {
    id: "task9",
    title: "Test performance Chatbot AI",
    description: "Kiểm tra tốc độ phản hồi của bot",
    dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    project: "chatbot-ai",
    taskType: "testing",
    priority: "medium",
    completed: false,
    workflowStep: "todo",
  },
  {
    id: "task10",
    title: "Viết documentation API Fashion Game",
    description: "Tài liệu hóa các API endpoints",
    dueDate: new Date(new Date().setDate(new Date().getDate() + 4)),
    project: "fashion-game",
    taskType: "documentation",
    priority: "low",
    completed: false,
    workflowStep: "todo",
  },
]

// Kanban columns configuration
const kanbanColumns = [
  { id: "todo", title: "To Do", color: "bg-gray-100" },
  { id: "in-progress", title: "In Progress", color: "bg-blue-100" },
  { id: "done", title: "Done", color: "bg-green-100" },
]

// Helper function to get project by ID
const getProject = (projectId: string) => {
  return mockProjects.find((project) => project.id === projectId)
}

// Helper function to get task type by ID
const getTaskType = (taskTypeId: string) => {
  return mockTaskTypes.find((taskType) => taskType.id === taskTypeId)
}

// Helper function to get workflow step by ID
const getWorkflowStep = (workflowStepId: string) => {
  return mockWorkflowSteps.find((workflowStep) => workflowStep.id === workflowStepId)
}

// Priority colors
const priorityColors = {
  low: "text-blue-500",
  medium: "text-yellow-500",
  high: "text-red-500",
}

export default function TasksPage() {
  const searchParams = useSearchParams()
  const viewParam = searchParams.get("view") || "today"
  const idParam = searchParams.get("id")

  const [activeView, setActiveView] = useState(viewParam)
  const [selectedProject, setSelectedProject] = useState<string | null>(viewParam === "project" ? idParam : null)
  const [selectedTaskType, setSelectedTaskType] = useState<string | null>(viewParam === "tasktype" ? idParam : null)
  const [addTaskOpen, setAddTaskOpen] = useState(false)
  const [taskDetailOpen, setTaskDetailOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<(typeof mockTasks)[0] | null>(null)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: new Date(),
    project: "chatbot-ai",
    taskType: "design",
    priority: "medium",
    workflowStep: "todo",
  })
  const [tasks, setTasks] = useState(mockTasks)

  // Update state when URL params change
  useEffect(() => {
    setActiveView(viewParam)
    if (viewParam === "project" && idParam) {
      setSelectedProject(idParam)
      setSelectedTaskType(null)
    } else if (viewParam === "tasktype" && idParam) {
      setSelectedTaskType(idParam)
      setSelectedProject(null)
    } else {
      setSelectedProject(null)
      setSelectedTaskType(null)
    }
  }, [viewParam, idParam])

  // Get overdue tasks
  const overdueTasks = tasks.filter((task) => isPast(task.dueDate) && !isToday(task.dueDate) && !task.completed)

  // Get today's tasks
  const todayTasks = tasks.filter((task) => isToday(task.dueDate) && !task.completed)

  // Get completed tasks
  const completedTasks = tasks.filter((task) => task.completed)

  // Toggle task completion
  const toggleTaskCompletion = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
              workflowStep: !task.completed ? "done" : "todo",
            }
          : task,
      ),
    )
  }

  // Move task between columns
  const moveTask = (taskId: string, newWorkflowStep: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              workflowStep: newWorkflowStep,
              completed: newWorkflowStep === "done",
            }
          : task,
      ),
    )
  }

  // Add new task
  const handleAddTask = () => {
    const newTaskWithId = {
      ...newTask,
      id: `task${tasks.length + 1}`,
      completed: false,
    }
    setTasks([...tasks, newTaskWithId])
    setAddTaskOpen(false)
    setNewTask({
      title: "",
      description: "",
      dueDate: new Date(),
      project: "chatbot-ai",
      taskType: "design",
      priority: "medium",
      workflowStep: "todo",
    })
  }

  // Open task detail
  const handleOpenTaskDetail = (task: (typeof mockTasks)[0]) => {
    setSelectedTask(task)
    setTaskDetailOpen(true)
  }

  // Get week days for upcoming view
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // Group tasks by date for upcoming view
  const tasksByDate = weekDays.map((day) => {
    return {
      date: day,
      tasks: tasks.filter(
        (task) => format(task.dueDate, "yyyy-MM-dd") === format(day, "yyyy-MM-dd") && !task.completed,
      ),
    }
  })

  // Kanban Task Card Component
  const KanbanTaskCard = ({ task }: { task: (typeof tasks)[0] }) => {
    const project = getProject(task.project)
    const taskType = getTaskType(task.taskType)
    const workflowStep = getWorkflowStep(task.workflowStep)

    return (
      <Card
        className="mb-3 cursor-pointer hover:shadow-md transition-shadow bg-white"
        onClick={() => handleOpenTaskDetail(task)}
      >
        <CardContent className="p-3">
          {/* Project - separate line with folder icon */}
          {project && (
            <div className="mb-2">
              <div className="flex items-center gap-1">
                <Folder className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-600 font-medium">{project.name}</span>
              </div>
            </div>
          )}

          <div className="flex items-start justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{task.title}</h4>
            <div className="flex items-center gap-1 ml-2">
              {task.priority && (
                <Flag className={cn("h-3 w-3", priorityColors[task.priority as keyof typeof priorityColors])} />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-3 w-3 text-gray-400" />
              </button>
            </div>
          </div>

          {task.description && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{task.description}</p>}

          {/* Task Type and Workflow Step on same line */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {taskType && (
              <Badge variant="outline" className="text-xs px-2 py-0.5 h-5 bg-gray-50 text-gray-700 border-gray-300">
                {taskType.name}
              </Badge>
            )}
            {taskType && workflowStep && <span className="text-gray-400 text-xs">/</span>}
            {workflowStep && (
              <Badge
                className={cn(
                  "text-xs px-2 py-0.5 h-5 font-medium text-white",
                  workflowStep.color === "gray" && "bg-gray-500",
                  workflowStep.color === "blue" && "bg-blue-500",
                  workflowStep.color === "green" && "bg-green-500",
                )}
              >
                {workflowStep.name}
              </Badge>
            )}
          </div>

          {/* Due Date */}
          <div className="flex items-center">
            <div
              className={cn(
                "text-xs flex items-center",
                isPast(task.dueDate) && !task.completed ? "text-red-500" : "text-gray-500",
              )}
            >
              {isPast(task.dueDate) && !isToday(task.dueDate) && !task.completed && (
                <AlertCircle className="h-3 w-3 mr-1" />
              )}
              <span>{format(task.dueDate, "d MMM", { locale: vi })}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Kanban Column Component
  const KanbanColumn = ({ column, tasks: columnTasks }: { column: any; tasks: any[] }) => {
    return (
      <div className="flex-1 min-w-80">
        <div className={cn("rounded-lg p-4 h-full", column.color)}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">{column.title}</h3>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {columnTasks.length}
              </Badge>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
            {columnTasks.map((task) => (
              <div key={task.id} className="group">
                <KanbanTaskCard task={task} />
              </div>
            ))}
            {columnTasks.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">No tasks</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Render task item for list views
  const TaskItem = ({ task }: { task: (typeof tasks)[0] }) => {
    const project = getProject(task.project)
    const taskType = getTaskType(task.taskType)
    const workflowStep = getWorkflowStep(task.workflowStep)

    return (
      <div
        className={cn(
          "flex items-start gap-3 p-4 transition-all duration-200 hover:bg-gray-50 group cursor-pointer",
          task.completed && "opacity-70",
        )}
        onClick={() => handleOpenTaskDetail(task)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleTaskCompletion(task.id)
          }}
          className="mt-0.5 flex-shrink-0"
        >
          {task.completed ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <Circle className="h-5 w-5 text-gray-300 group-hover:text-gray-400" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          {/* Project - separate line with folder icon and different styling */}
          {project && (
            <div className="mb-2">
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md w-fit">
                <Folder className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-700 font-medium">{project.name}</span>
              </div>
            </div>
          )}

          <div className="flex items-start justify-between">
            <p className={cn("text-sm font-medium text-gray-900", task.completed && "line-through text-gray-500")}>
              {task.title}
            </p>
            <div className="flex items-center gap-2 ml-2">
              {task.priority && (
                <Flag className={cn("h-3.5 w-3.5", priorityColors[task.priority as keyof typeof priorityColors])} />
              )}
            </div>
          </div>

          {/* Task Type and Workflow Step on same line */}
          <div className="flex flex-wrap items-center gap-2 mt-2 mb-1.5">
            {taskType && (
              <Badge variant="outline" className="text-xs px-2 py-0.5 h-5 bg-gray-50 text-gray-700 border-gray-300">
                {taskType.name}
              </Badge>
            )}
            {taskType && workflowStep && <span className="text-gray-400 text-xs">/</span>}
            {workflowStep && (
              <Badge
                className={cn(
                  "text-xs px-2 py-0.5 h-5 font-medium text-white",
                  workflowStep.color === "gray" && "bg-gray-500",
                  workflowStep.color === "blue" && "bg-blue-500",
                  workflowStep.color === "green" && "bg-green-500",
                )}
              >
                {workflowStep.name}
              </Badge>
            )}
          </div>

          {/* Due Date */}
          <div className="flex items-center">
            <div
              className={cn(
                "text-xs flex items-center",
                isPast(task.dueDate) && !task.completed ? "text-red-500" : "text-gray-500",
              )}
            >
              {isPast(task.dueDate) && !isToday(task.dueDate) && !task.completed && (
                <>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  <span className="mr-1">Quá hạn:</span>
                </>
              )}
              <span>{format(task.dueDate, "d MMM", { locale: vi })}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Section header component for consistent styling
  const SectionHeader = ({ title, className }: { title: string; className?: string }) => (
    <h2 className={cn("text-xs uppercase font-medium text-gray-500 mb-3", className)}>{title}</h2>
  )

  return (
    <>
      {/* Main Content */}
      <div className="bg-gray-50 min-h-screen">
        {/* Today View */}
        {activeView === "today" && (
          <div className="p-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Today</h1>
              <p className="text-sm text-gray-500">{format(new Date(), "EEEE, d MMMM", { locale: vi })}</p>
            </div>

            {overdueTasks.length > 0 && (
              <div className="mb-8">
                <SectionHeader title="Quá hạn" className="text-red-500" />
                <div className="divide-y divide-gray-100 rounded-lg bg-white shadow-sm">
                  {overdueTasks.map((task) => (
                    <TaskItem key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8">
              <SectionHeader title="Hôm nay" />
              {todayTasks.length > 0 ? (
                <div className="divide-y divide-gray-100 rounded-lg bg-white shadow-sm">
                  {todayTasks.map((task) => (
                    <TaskItem key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white shadow-sm rounded-lg">
                  <p className="text-gray-500">Không có công việc nào cho hôm nay</p>
                </div>
              )}
            </div>

            {completedTasks.length > 0 && (
              <div>
                <SectionHeader title="Đã hoàn thành" />
                <div className="divide-y divide-gray-100 rounded-lg bg-white shadow-sm">
                  {completedTasks
                    .filter((task) => isToday(task.dueDate))
                    .map((task) => (
                      <TaskItem key={task.id} task={task} />
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Upcoming View */}
        {activeView === "upcoming" && (
          <div className="p-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Upcoming</h1>
            </div>

            <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
              <div className="flex space-x-2">
                {weekDays.map((day) => {
                  const isCurrentDay = isToday(day)
                  return (
                    <div
                      key={day.toString()}
                      className={cn(
                        "flex flex-col items-center justify-center p-2 min-w-[60px] rounded-md",
                        isCurrentDay ? "bg-red-50 border border-red-200" : "hover:bg-gray-100",
                      )}
                    >
                      <span className="text-xs text-gray-500">{format(day, "EEE", { locale: vi })}</span>
                      <span className={cn("text-lg font-medium", isCurrentDay ? "text-red-500" : "text-gray-900")}>
                        {format(day, "d")}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="space-y-8">
              {tasksByDate.map((dayData) => {
                const tasksForDay = dayData.tasks
                if (tasksForDay.length === 0) return null

                return (
                  <div key={dayData.date.toString()}>
                    <h2 className="text-xs uppercase font-medium mb-3 flex items-center">
                      {isToday(dayData.date) ? (
                        <span className="text-red-500">Hôm nay</span>
                      ) : (
                        <span className="text-gray-500">{format(dayData.date, "EEEE, d MMMM", { locale: vi })}</span>
                      )}
                    </h2>
                    <div className="divide-y divide-gray-100 rounded-lg bg-white shadow-sm">
                      {tasksForDay.map((task) => (
                        <TaskItem key={task.id} task={task} />
                      ))}
                    </div>
                  </div>
                )
              })}

              {/* Future tasks (beyond this week) */}
              {tasks.filter(
                (t) =>
                  isFuture(t.dueDate) &&
                  !t.completed &&
                  !weekDays.some((day) => format(day, "yyyy-MM-dd") === format(t.dueDate, "yyyy-MM-dd")),
              ).length > 0 && (
                <div>
                  <SectionHeader title="Sắp tới" />
                  <div className="divide-y divide-gray-100 rounded-lg bg-white shadow-sm">
                    {tasks
                      .filter(
                        (t) =>
                          isFuture(t.dueDate) &&
                          !t.completed &&
                          !weekDays.some((day) => format(day, "yyyy-MM-dd") === format(t.dueDate, "yyyy-MM-dd")),
                      )
                      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
                      .map((task) => (
                        <TaskItem key={task.id} task={task} />
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Project View - Kanban Board */}
        {activeView === "project" && selectedProject && (
          <div className="p-6 h-screen flex flex-col">
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
              <h1 className="text-2xl font-bold text-gray-900">{getProject(selectedProject)?.name || "Project"}</h1>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 flex gap-6 overflow-x-auto pb-6">
              {kanbanColumns.map((column) => {
                const columnTasks = tasks.filter(
                  (task) => task.project === selectedProject && task.workflowStep === column.id,
                )
                return <KanbanColumn key={column.id} column={column} tasks={columnTasks} />
              })}
            </div>
          </div>
        )}

        {/* Task Type View - Kanban Board */}
        {activeView === "tasktype" && selectedTaskType && (
          <div className="p-6 h-screen flex flex-col">
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Tag className="h-5 w-5 text-gray-600" />
                {getTaskType(selectedTaskType)?.name || "Task Type"}
              </h1>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 flex gap-6 overflow-x-auto pb-6">
              {kanbanColumns.map((column) => {
                const columnTasks = tasks.filter(
                  (task) => task.taskType === selectedTaskType && task.workflowStep === column.id,
                )
                return <KanbanColumn key={column.id} column={column} tasks={columnTasks} />
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add Task Dialog */}
      <Dialog open={addTaskOpen} onOpenChange={setAddTaskOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Task name"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="col-span-2"
            />
            <Textarea
              placeholder="Description (optional)"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="col-span-2"
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Due Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <Calendar className="mr-2 h-4 w-4" />
                      {format(newTask.dueDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    {/* Calendar component would go here */}
                    <div className="p-3">
                      <Select
                        value={format(newTask.dueDate, "yyyy-MM-dd")}
                        onValueChange={(value) => {
                          setNewTask({
                            ...newTask,
                            dueDate: new Date(value),
                          })
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select date" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={format(new Date(), "yyyy-MM-dd")}>Today</SelectItem>
                          <SelectItem value={format(addDays(new Date(), 1), "yyyy-MM-dd")}>Tomorrow</SelectItem>
                          <SelectItem value={format(addDays(new Date(), 7), "yyyy-MM-dd")}>Next week</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Priority</label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) => {
                    setNewTask({
                      ...newTask,
                      priority: value,
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Project</label>
                <Select
                  value={newTask.project}
                  onValueChange={(value) => {
                    setNewTask({
                      ...newTask,
                      project: value,
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Task Type</label>
                <Select
                  value={newTask.taskType}
                  onValueChange={(value) => {
                    setNewTask({
                      ...newTask,
                      taskType: value,
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTaskTypes.map((taskType) => (
                      <SelectItem key={taskType.id} value={taskType.id}>
                        {taskType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Workflow Step</label>
              <Select
                value={newTask.workflowStep}
                onValueChange={(value) => {
                  setNewTask({
                    ...newTask,
                    workflowStep: value,
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select workflow step" />
                </SelectTrigger>
                <SelectContent>
                  {mockWorkflowSteps.map((workflowStep) => (
                    <SelectItem key={workflowStep.id} value={workflowStep.id}>
                      {workflowStep.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddTaskOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTask} disabled={!newTask.title} className="bg-red-500 hover:bg-red-600">
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Detail Modal */}
      <TaskDetailModal open={taskDetailOpen} onOpenChange={setTaskDetailOpen} task={selectedTask} />

      {/* Hidden button for Add Task */}
      <button data-add-task="true" className="hidden" onClick={() => setAddTaskOpen(true)} />
    </>
  )
}
