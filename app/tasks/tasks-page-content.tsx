"use client"

import { useState, useEffect, Suspense } from "react"
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

export default function TasksPageContent() {
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

  const handleAddTask = () => {
    const newTaskWithId = { ...newTask, id: `task${tasks.length + 1}`, completed: false }
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

  const handleOpenTaskDetail = (task: (typeof mockTasks)[0]) => {
    setSelectedTask(task)
    setTaskDetailOpen(true)
  }

  // Filter tasks based on selected project or task type
  const filteredTasks = tasks.filter((task) => {
    if (selectedProject) return task.project === selectedProject
    if (selectedTaskType) return task.taskType === selectedTaskType
    return true
  })

  // Kanban Board component
  const KanbanBoard = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kanbanColumns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={filteredTasks.filter((task) => task.workflowStep === column.id)}
          />
        ))}
      </div>
    )
  }

  const KanbanTaskCard = ({ task }: { task: (typeof tasks)[0] }) => {
    const project = getProject(task.project)
    const taskType = getTaskType(task.taskType)

    return (
      <Card
        className="mb-4 bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => handleOpenTaskDetail(task)}
      >
        <CardContent className="p-0">
          <div className="flex items-center justify-between mb-2">
            <Badge
              variant="outline"
              className={cn(
                task.completed ? "text-gray-500" : "text-gray-700",
                "font-normal"
              )}
            >
              {taskType?.name}
            </Badge>
            <MoreHorizontal className="h-4 w-4 text-gray-400" />
          </div>
          <p
            className={cn(
              "font-medium mb-2",
              task.completed ? "line-through text-gray-500" : "text-gray-900",
            )}
          >
            {task.title}
          </p>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1.5" />
              <span>{format(task.dueDate, "dd/MM")}</span>
            </div>
            <div className="flex items-center">
              <Flag className={cn("h-4 w-4 mr-1.5", priorityColors[task.priority as keyof typeof priorityColors])} />
              <div className={`h-6 w-6 rounded-full bg-${project?.color}-200 flex items-center justify-center text-xs font-bold text-${project?.color}-700`}>
                {project?.name.charAt(0)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const KanbanColumn = ({ column, tasks: columnTasks }: { column: any; tasks: any[] }) => {
    return (
      <div className={cn("rounded-lg p-4", column.color)}>
        <h3 className="font-semibold text-lg mb-4 text-gray-800">{column.title} ({columnTasks.length})</h3>
        <div>
          {columnTasks.map((task) => (
            <KanbanTaskCard key={task.id} task={task} />
          ))}
        </div>
        <Button variant="ghost" className="w-full mt-4 text-gray-500">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>
    )
  }


  // TaskItem for list views
  const TaskItem = ({ task }: { task: (typeof tasks)[0] }) => {
    const project = getProject(task.project)
    const taskType = getTaskType(task.taskType)

    return (
      <div
        className="flex items-center py-3 px-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
        onClick={() => handleOpenTaskDetail(task)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleTaskCompletion(task.id)
          }}
          className="mr-4"
        >
          {task.completed ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <Circle className="h-5 w-5 text-gray-300" />
          )}
        </button>
        <div className="flex-1">
          <p
            className={cn(
              "text-sm font-medium",
              task.completed ? "line-through text-gray-500" : "text-gray-900",
            )}
          >
            {task.title}
          </p>
          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
            {project && (
              <div className="flex items-center">
                <Folder className="h-3 w-3 mr-1.5" />
                <span>{project.name}</span>
              </div>
            )}
            {taskType && (
              <div className="flex items-center">
                <Tag className="h-3 w-3 mr-1.5" />
                <span>{taskType.name}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <Badge
            variant="outline"
            className={cn(
              priorityColors[task.priority as keyof typeof priorityColors],
              "border-current",
            )}
          >
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </Badge>
          <div className="flex items-center text-gray-500">
            <Calendar className="h-4 w-4 mr-1.5" />
            <span>{format(task.dueDate, "dd MMM", { locale: vi })}</span>
          </div>
          <MoreHorizontal className="h-5 w-5 text-gray-400" />
        </div>
      </div>
    )
  }

  const SectionHeader = ({ title, className }: { title: string; className?: string }) => (
    <h2 className={cn("text-lg font-semibold text-gray-800 px-4 py-2 mt-6 mb-2 border-b-2 border-gray-100", className)}>
      {title}
    </h2>
  )

  // Calendar View
  const CalendarView = () => {
    const week = eachDayOfInterval({
      start: startOfWeek(new Date(), { locale: vi }),
      end: endOfWeek(new Date(), { locale: vi }),
    })

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200">
        {week.map((day) => (
          <div key={day.toISOString()} className="bg-white p-2">
            <div className="text-center text-sm font-medium text-gray-700">
              {format(day, "eee", { locale: vi })}
            </div>
            <div className="text-center text-2xl font-bold text-gray-900">
              {format(day, "d")}
            </div>
            <div className="mt-2 space-y-1">
              {tasks
                .filter((task) => format(task.dueDate, "yyyy-MM-dd") === format(day, "yyyy-MM-dd"))
                .map((task) => (
                  <div key={task.id} className="text-xs bg-blue-100 text-blue-800 p-1 rounded truncate">
                    {task.title}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Render content based on active view
  const renderContent = () => {
    switch (activeView) {
      case "kanban":
        return <KanbanBoard />
      case "calendar":
        return <CalendarView />
      case "project":
      case "tasktype":
        return (
          <div>
            {filteredTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        )
      case "upcoming":
        const upcomingTasks = tasks.filter((task) => isFuture(task.dueDate) && !isToday(task.dueDate) && !task.completed)
        return (
          <div>
            {upcomingTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        )
      case "completed":
        return (
            <div>
              {completedTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )
      case "today":
      default:
        return (
          <div>
            {overdueTasks.length > 0 && (
              <>
                <SectionHeader title={`Quá hạn (${overdueTasks.length})`} className="text-red-600" />
                {overdueTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </>
            )}
            <SectionHeader title={`Hôm nay (${todayTasks.length})`} />
            {todayTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        )
    }
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Nhiệm vụ</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
            <Button
              variant={activeView === "today" ? "secondary" : "ghost"}
              onClick={() => (window.location.href = "/tasks?view=today")}
              className="h-8"
            >
              Hôm nay
            </Button>
            <Button
              variant={activeView === "upcoming" ? "secondary" : "ghost"}
              onClick={() => (window.location.href = "/tasks?view=upcoming")}
              className="h-8"
            >
              Sắp tới
            </Button>
            <Button
              variant={activeView === "calendar" ? "secondary" : "ghost"}
              onClick={() => (window.location.href = "/tasks?view=calendar")}
              className="h-8"
            >
              Lịch
            </Button>
            <Button
              variant={activeView === "kanban" ? "secondary" : "ghost"}
              onClick={() => (window.location.href = "/tasks?view=kanban")}
              className="h-8"
            >
              Kanban
            </Button>
            <Button
              variant={activeView === "completed" ? "secondary" : "ghost"}
              onClick={() => (window.location.href = "/tasks?view=completed")}
              className="h-8"
            >
              Hoàn thành
            </Button>
          </div>
          <Button onClick={() => setAddTaskOpen(true)} className="h-9">
            <Plus className="h-4 w-4 mr-2" />
            Thêm nhiệm vụ
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-gray-200 p-4 overflow-y-auto">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Dự án</h2>
          <nav className="space-y-1">
            {mockProjects.map((project) => (
              <a
                key={project.id}
                href={`/tasks?view=project&id=${project.id}`}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  selectedProject === project.id
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50",
                )}
              >
                <span className={`h-2 w-2 rounded-full bg-${project.color}-500 mr-3`}></span>
                <span className="flex-1">{project.name}</span>
                <span className="text-gray-500">{project.count}</span>
              </a>
            ))}
          </nav>

          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-8 mb-4">Loại nhiệm vụ</h2>
          <nav className="space-y-1">
            {mockTaskTypes.map((taskType) => (
              <a
                key={taskType.id}
                href={`/tasks?view=tasktype&id=${taskType.id}`}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  selectedTaskType === taskType.id
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50",
                )}
              >
                <span className="flex-1">{taskType.name}</span>
              </a>
            ))}
          </nav>
        </aside>

        {/* Task list */}
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </main>

      {/* Add Task Dialog */}
      <Dialog open={addTaskOpen} onOpenChange={setAddTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm nhiệm vụ mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Tiêu đề nhiệm vụ"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <Textarea
              placeholder="Mô tả chi tiết"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <Calendar className="mr-2 h-4 w-4" />
                  {format(newTask.dueDate, "PPP", { locale: vi })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                {/* <Calendar
                  mode="single"
                  selected={newTask.dueDate}
                  onSelect={(date) => date && setNewTask({ ...newTask, dueDate: date })}
                  initialFocus
                /> */}
              </PopoverContent>
            </Popover>
            <div className="grid grid-cols-2 gap-4">
              <Select value={newTask.project} onValueChange={(value) => setNewTask({ ...newTask, project: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Dự án" />
                </SelectTrigger>
                <SelectContent>
                  {mockProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={newTask.taskType} onValueChange={(value) => setNewTask({ ...newTask, taskType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Loại nhiệm vụ" />
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
            <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Độ ưu tiên" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Thấp</SelectItem>
                <SelectItem value="medium">Vừa</SelectItem>
                <SelectItem value="high">Cao</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddTaskOpen(false)}>Hủy</Button>
            <Button onClick={handleAddTask}>Thêm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {selectedTask && (
        <TaskDetailModal
          open={taskDetailOpen}
          onOpenChange={setTaskDetailOpen}
          task={selectedTask}
        />
      )}
    </div>
  )
} 