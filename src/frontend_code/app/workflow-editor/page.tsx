"use client"

import type React from "react"

import { useState, useCallback, useMemo } from "react"
import ReactFlow, {
  type Node,
  type Edge,
  type Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MarkerType,
  type NodeTypes,
  Handle,
  Position,
} from "reactflow"
import "reactflow/dist/style.css"
import { Plus, GitBranch, Zap, Save, Settings, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// Custom Status Node Component with optimized design
const StatusNode = ({ data, selected }: { data: any; selected: boolean }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "yêu cầu":
        return "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
      case "đang phê duyệt":
        return "bg-blue-50 border-blue-300 text-blue-700 hover:border-blue-400"
      case "nghiệm thu":
        return "bg-blue-50 border-blue-300 text-blue-700 hover:border-blue-400"
      case "đồng ý":
        return "bg-green-50 border-green-300 text-green-700 hover:border-green-400"
      case "từ chối":
        return "bg-red-50 border-red-300 text-red-700 hover:border-red-400"
      default:
        return "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
    }
  }

  return (
    <div className="relative group">
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 !bg-blue-500 !border-2 !border-white opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ left: -4 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 !bg-blue-500 !border-2 !border-white opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ right: -4 }}
      />
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 !bg-blue-500 !border-2 !border-white opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ top: -4 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 !bg-blue-500 !border-2 !border-white opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ bottom: -4 }}
      />

      {/* Node Content - Optimized Design */}
      <div
        className={cn(
          "px-3 py-1.5 rounded-md border text-center font-medium text-xs min-w-[80px] transition-all duration-200 shadow-sm",
          getStatusColor(data.label),
          selected && "ring-2 ring-blue-500 ring-offset-1",
          "cursor-pointer",
        )}
      >
        {data.label}
      </div>
    </div>
  )
}

// Start Node Component with optimized design
const StartNode = ({ selected }: { selected: boolean }) => {
  return (
    <div className="relative group">
      {/* Connection Handles */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 !bg-blue-500 !border-2 !border-white opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ right: -4 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 !bg-blue-500 !border-2 !border-white opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ bottom: -4 }}
      />
      <Handle
        type="source"
        position={Position.Top}
        className="w-2 h-2 !bg-blue-500 !border-2 !border-white opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ top: -4 }}
      />

      {/* Node Content - Optimized Design */}
      <div
        className={cn(
          "w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-[10px] transition-all duration-200 shadow-sm",
          selected && "ring-2 ring-blue-500 ring-offset-1",
          "cursor-pointer",
        )}
      >
        START
      </div>
    </div>
  )
}

const nodeTypes: NodeTypes = {
  status: StatusNode,
  start: StartNode,
}

// Mock data
const initialStatuses = ["YÊU CẦU", "ĐANG PHÊ DUYỆT", "NGHIỆM THU", "ĐỒNG Ý", "TỪ CHỐI"]

const initialNodes: Node[] = [
  {
    id: "start",
    type: "start",
    position: { x: 100, y: 200 },
    data: { label: "START" },
  },
  {
    id: "yeu-cau",
    type: "status",
    position: { x: 250, y: 200 },
    data: { label: "YÊU CẦU" },
  },
  {
    id: "dang-phe-duyet",
    type: "status",
    position: { x: 400, y: 150 },
    data: { label: "ĐANG PHÊ DUYỆT" },
  },
  {
    id: "nghiem-thu",
    type: "status",
    position: { x: 550, y: 100 },
    data: { label: "NGHIỆM THU" },
  },
  {
    id: "dong-y",
    type: "status",
    position: { x: 550, y: 250 },
    data: { label: "ĐỒNG Ý" },
  },
]

const initialEdges: Edge[] = [
  {
    id: "start-yeu-cau",
    source: "start",
    target: "yeu-cau",
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: "#6b7280", strokeWidth: 2 },
  },
  {
    id: "yeu-cau-dang-phe-duyet",
    source: "yeu-cau",
    target: "dang-phe-duyet",
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: "#6b7280", strokeWidth: 2 },
    label: "Gửi phê duyệt",
  },
  {
    id: "dang-phe-duyet-nghiem-thu",
    source: "dang-phe-duyet",
    target: "nghiem-thu",
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: "#6b7280", strokeWidth: 2 },
    label: "Phê duyệt",
  },
  {
    id: "nghiem-thu-dong-y",
    source: "nghiem-thu",
    target: "dong-y",
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: "#6b7280", strokeWidth: 2 },
    label: "Hoàn thành",
  },
  {
    id: "nghiem-thu-dang-phe-duyet",
    source: "nghiem-thu",
    target: "dang-phe-duyet",
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: "#ef4444", strokeWidth: 2 },
    label: "Yêu cầu sửa đổi",
  },
  {
    id: "yeu-cau-nghiem-thu",
    source: "yeu-cau",
    target: "nghiem-thu",
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: "#10b981", strokeWidth: 2 },
    label: "Bỏ qua phê duyệt",
  },
]

export default function WorkflowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [showTransitionLabels, setShowTransitionLabels] = useState(true)

  // Selection and sidebar states
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Modal states
  const [addStatusOpen, setAddStatusOpen] = useState(false)
  const [addTransitionOpen, setAddTransitionOpen] = useState(false)
  const [addRuleOpen, setAddRuleOpen] = useState(false)

  // Form states
  const [newStatusName, setNewStatusName] = useState("")
  const [selectedExistingStatus, setSelectedExistingStatus] = useState("")
  const [transitionFrom, setTransitionFrom] = useState("")
  const [transitionTo, setTransitionTo] = useState("")
  const [transitionName, setTransitionName] = useState("")

  // Edit states
  const [editNodeName, setEditNodeName] = useState("")
  const [editTransitionName, setEditTransitionName] = useState("")
  const [editTransitionFrom, setEditTransitionFrom] = useState("")
  const [editTransitionTo, setEditTransitionTo] = useState("")

  // Connection state for drag & drop transitions
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null)

  const onConnect = useCallback((params: Connection) => {
    setPendingConnection(params)
    setTransitionFrom(params.source || "")
    setTransitionTo(params.target || "")
    setTransitionName("")
    setAddTransitionOpen(true)
  }, [])

  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
    setSelectedEdge(null)
    setEditNodeName(node.data.label)
    setSidebarOpen(true)
  }, [])

  // Handle edge selection
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge)
    setSelectedNode(null)
    setEditTransitionName(edge.label || "")
    setEditTransitionFrom(edge.source)
    setEditTransitionTo(edge.target)
    setSidebarOpen(true)
  }, [])

  // Get available statuses for dropdowns
  const availableStatuses = useMemo(() => {
    return nodes
      .filter((node) => node.type === "status" || node.type === "start")
      .map((node) => ({
        id: node.id,
        label: node.data.label,
      }))
  }, [nodes])

  const handleAddStatus = () => {
    const statusName = newStatusName || selectedExistingStatus
    if (!statusName) return

    const newNode: Node = {
      id: `status-${Date.now()}`,
      type: "status",
      position: { x: Math.random() * 400 + 200, y: Math.random() * 300 + 100 },
      data: { label: statusName },
    }

    setNodes((nds) => [...nds, newNode])
    setAddStatusOpen(false)
    setNewStatusName("")
    setSelectedExistingStatus("")
  }

  const handleAddTransition = () => {
    if (!transitionFrom || !transitionTo) return

    const newEdge: Edge = {
      id: `${transitionFrom}-${transitionTo}-${Date.now()}`,
      source: transitionFrom,
      target: transitionTo,
      type: "smoothstep",
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#6b7280", strokeWidth: 2 },
      label: transitionName || undefined,
    }

    setEdges((eds) => [...eds, newEdge])
    setAddTransitionOpen(false)
    setTransitionFrom("")
    setTransitionTo("")
    setTransitionName("")
    setPendingConnection(null)
  }

  const handleCancelTransition = () => {
    setAddTransitionOpen(false)
    setTransitionFrom("")
    setTransitionTo("")
    setTransitionName("")
    setPendingConnection(null)
  }

  // Update node
  const handleUpdateNode = () => {
    if (!selectedNode) return

    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode.id
          ? {
              ...node,
              data: { ...node.data, label: editNodeName },
            }
          : node,
      ),
    )
  }

  // Update edge
  const handleUpdateEdge = () => {
    if (!selectedEdge) return

    setEdges((eds) =>
      eds.map((edge) =>
        edge.id === selectedEdge.id
          ? {
              ...edge,
              label: editTransitionName || undefined,
              source: editTransitionFrom,
              target: editTransitionTo,
            }
          : edge,
      ),
    )
  }

  // Delete selected object
  const handleDelete = () => {
    if (selectedNode && selectedNode.type !== "start") {
      // Delete node and all connected edges
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id))
      setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id))
      setSelectedNode(null)
      setSidebarOpen(false)
    } else if (selectedEdge) {
      // Delete edge
      setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdge.id))
      setSelectedEdge(null)
      setSidebarOpen(false)
    }
  }

  const handleSaveWorkflow = () => {
    console.log("Saving workflow...", { nodes, edges })
  }

  // Update edges visibility based on showTransitionLabels
  const visibleEdges = useMemo(() => {
    return edges.map((edge) => ({
      ...edge,
      label: showTransitionLabels ? edge.label : undefined,
      labelStyle: showTransitionLabels
        ? {
            fontSize: 11,
            fontWeight: 500,
            fill: "#374151",
            backgroundColor: "white",
            padding: "2px 6px",
            borderRadius: "4px",
            border: "1px solid #e5e7eb",
          }
        : undefined,
      style: {
        ...edge.style,
        strokeWidth: selectedEdge?.id === edge.id ? 3 : 2,
      },
    }))
  }, [edges, showTransitionLabels, selectedEdge])

  // Get node label by id
  const getNodeLabel = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId)
    return node?.data.label || nodeId
  }

  // Close sidebar
  const closeSidebar = () => {
    setSidebarOpen(false)
    setSelectedNode(null)
    setSelectedEdge(null)
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Workflow Editor</h1>
              <p className="text-sm text-gray-500 mt-1">
                Workflow for <span className="text-blue-600 font-medium">Fashion Show</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setAddStatusOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Status
              </Button>
              <Button variant="outline" size="sm" onClick={() => setAddTransitionOpen(true)}>
                <GitBranch className="h-4 w-4 mr-2" />
                Add Transition
              </Button>
              <Button variant="outline" size="sm" onClick={() => setAddRuleOpen(true)}>
                <Zap className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleSaveWorkflow}>
                <Save className="h-4 w-4 mr-2" />
                Update Workflow
              </Button>
              <Button variant="outline" size="sm">
                Discard changes
              </Button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-labels"
                checked={showTransitionLabels}
                onCheckedChange={(checked) => setShowTransitionLabels(checked as boolean)}
              />
              <Label htmlFor="show-labels" className="text-sm font-medium">
                Show transition labels
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {nodes.length - 1} statuses
              </Badge>
              <Badge variant="outline" className="text-xs">
                {edges.length} transitions
              </Badge>
            </div>
            <div className="text-xs text-gray-500">
              💡 Click on nodes or transitions to edit, hover to see connection points
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={visibleEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-50"
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            connectionLineStyle={{ stroke: "#3b82f6", strokeWidth: 2 }}
            connectionLineType="smoothstep"
          >
            <Background color="#e5e7eb" gap={20} />
            <Controls className="bg-white border border-gray-200 rounded-lg shadow-sm" />
          </ReactFlow>
        </div>
      </div>

      {/* Right Sidebar */}
      {sidebarOpen && (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedNode ? "Status" : selectedEdge ? "Transition" : "Properties"}
              </h2>
              <Button variant="ghost" size="icon" onClick={closeSidebar}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {selectedNode
                ? "Configure status properties and settings"
                : selectedEdge
                  ? "Transitions connect statuses as actions that move work through your flow"
                  : "Select an object to edit"}
            </p>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {selectedNode && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="node-name">Name</Label>
                  <Input
                    id="node-name"
                    value={editNodeName}
                    onChange={(e) => setEditNodeName(e.target.value)}
                    onBlur={handleUpdateNode}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Type</Label>
                  <div className="text-sm text-gray-600">
                    {selectedNode.type === "start" ? "Start Status" : "Regular Status"}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Properties</Label>
                  <div className="text-sm text-gray-500">Configure additional properties for this status</div>
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Property
                  </Button>
                </div>
              </>
            )}

            {selectedEdge && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="transition-name">Name</Label>
                  <Input
                    id="transition-name"
                    value={editTransitionName}
                    onChange={(e) => setEditTransitionName(e.target.value)}
                    onBlur={handleUpdateEdge}
                    placeholder="Enter transition name"
                  />
                </div>

                <div className="space-y-4">
                  <Label>Path</Label>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-gray-500">From status</Label>
                      <Select value={editTransitionFrom} onValueChange={setEditTransitionFrom}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableStatuses.map((status) => (
                            <SelectItem key={status.id} value={status.id}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">To status</Label>
                      <Select value={editTransitionTo} onValueChange={setEditTransitionTo}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableStatuses.map((status) => (
                            <SelectItem key={status.id} value={status.id}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Rules</Label>
                  <div className="text-sm text-gray-500">Rules help you save time when moving an issue</div>
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Rule
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Properties</Label>
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Property
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Sidebar Footer */}
          {(selectedNode || selectedEdge) && (
            <div className="p-4 border-t border-gray-200">
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={handleDelete}
                disabled={selectedNode?.type === "start"}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {selectedNode
                  ? selectedNode.type === "start"
                    ? "Cannot delete start status"
                    : "Delete status"
                  : "Delete transition"}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Add Status Modal */}
      <Dialog open={addStatusOpen} onOpenChange={setAddStatusOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Status</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="existing-status">Select existing status</Label>
              <Select value={selectedExistingStatus} onValueChange={setSelectedExistingStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose from existing statuses" />
                </SelectTrigger>
                <SelectContent>
                  {initialStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-500 font-medium">OR</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-status">Create new status</Label>
              <Input
                id="new-status"
                placeholder="Enter status name"
                value={newStatusName}
                onChange={(e) => setNewStatusName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddStatusOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStatus} disabled={!newStatusName && !selectedExistingStatus}>
              Add Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Transition Modal */}
      <Dialog open={addTransitionOpen} onOpenChange={setAddTransitionOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Transition</DialogTitle>
            {pendingConnection && (
              <p className="text-sm text-gray-500">
                Creating transition from <span className="font-medium">{getNodeLabel(pendingConnection.source!)}</span>{" "}
                to <span className="font-medium">{getNodeLabel(pendingConnection.target!)}</span>
              </p>
            )}
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="from-status">From Status</Label>
              <Select value={transitionFrom} onValueChange={setTransitionFrom}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source status" />
                </SelectTrigger>
                <SelectContent>
                  {availableStatuses.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="to-status">To Status</Label>
              <Select value={transitionTo} onValueChange={setTransitionTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target status" />
                </SelectTrigger>
                <SelectContent>
                  {availableStatuses.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transition-name">Transition Name (Optional)</Label>
              <Input
                id="transition-name"
                placeholder="Enter transition name"
                value={transitionName}
                onChange={(e) => setTransitionName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelTransition}>
              Cancel
            </Button>
            <Button onClick={handleAddTransition} disabled={!transitionFrom || !transitionTo}>
              Add Transition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Rule Modal (Placeholder) */}
      <Dialog open={addRuleOpen} onOpenChange={setAddRuleOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Rule</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Rules Coming Soon</h3>
              <p className="text-sm text-gray-500">
                This feature will allow you to add conditions and validations to your workflow transitions.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddRuleOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
