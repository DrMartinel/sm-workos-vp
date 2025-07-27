"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Calendar, Clock, Users, MapPin, Plus, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/utils/supabase/client"
import { formatDateTime } from "./utils/formatDateTime"
import { useToast, toast } from "@/hooks/use-toast"
import MeetingBookingLoading from "./loading"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

interface MeetingRoom {
  id: string
  name: string
  capacity: number
  location: string
  equipment: string[]
}

interface Meeting {
  id: string
  title: string
  startTime: string
  endTime: string
  organizer_id: string
  organizer_name: string | null
  roomId: string
  status: string
}

export default function MeetingBookingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedRoom, setSelectedRoom] = useState<MeetingRoom | null>(null)
  const [meetingRooms, setMeetingRooms] = useState<MeetingRoom[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    startTime: "",
    endTime: "",
    organizer_id: "Current User",
    status: "Scheduled",
  })
  const [user, setUser] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [meetingToCancel, setMeetingToCancel] = useState<string | null>(null);

  useEffect(() => {
    fetchData()
  }, [])
  
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      }
    };
    fetchUser();
  }, []);

  const handleRoomSelect = (room: MeetingRoom) => {
    setSelectedRoom(room)
    setCurrentStep(2)
  }
  
  const fetchData = async () => {
    setLoading(true)
    const supabase = createClient()
    // Fetch meeting rooms
    const { data: rooms, error: roomsError } = await supabase
      .from('meeting_rooms')
      .select('id, name, capacity, location, equipment')
    // Fetch meetings
    const { data: meetingsData, error: meetingsError } = await supabase
      .from('meetings')
      .select('id, title, start_time, end_time, organizer_id, organizer_name, room_id, status')
      .order('start_time', { ascending: true });
    if (roomsError) toast({
      title: 'Lỗi khi tải danh sách phòng họp',
      description: roomsError.message || String(roomsError),
      variant: 'destructive',
    });
    if (meetingsError) toast({
      title: 'Lỗi khi tải danh sách cuộc họp',
      description: meetingsError.message || String(meetingsError),
      variant: 'destructive',
    });
    setMeetingRooms(rooms || [])
    setMeetings(
      (meetingsData || []).map((m: any) => ({
        id: m.id,
        title: m.title,
        startTime: m.start_time,
        endTime: m.end_time,
        organizer_id: m.organizer_id,
        organizer_name: m.organizer_name,
        roomId: m.room_id,
        status: m.status,
      }))
    )
    setLoading(false)
  }

  const handleCreateMeeting = async () => {
    if (!selectedRoom || !newMeeting.title || !newMeeting.startTime || !newMeeting.endTime) {
      toast({
        title: 'Thiếu thông tin bắt buộc',
        description: 'Vui lòng điền đầy đủ tất cả các trường bắt buộc',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true)
    const supabase = createClient();

    const startUTC = localToUTCISOString(newMeeting.startTime);
    const endUTC = localToUTCISOString(newMeeting.endTime);

    const { data, error } = await supabase.rpc('create_meeting', {
      p_room_id: selectedRoom.id,
      p_title: newMeeting.title,
      p_start_time: startUTC,
      p_end_time: endUTC,
    });
    
    if (error) {
      toast({
        title: 'Không thể đặt phòng họp',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false)
      return;
    }
    
    // Optionally, refetch meetings from Supabase or append the new one
    fetchData()
    
    setNewMeeting({
      title: "",
      startTime: "",
      endTime: "",
      organizer_id: user?.id || "Current User",
      status: "Scheduled",
    });

    setCurrentStep(2);
    setLoading(false)
    toast({
      title: 'Đặt phòng họp thành công!',
      description: 'Cuộc họp của bạn đã được tạo.',
    });
  }

  const handleCancelMeeting = async () => {
    if (!meetingToCancel) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.rpc('cancel_meeting', { p_meeting_id: meetingToCancel });
    if (error) {
      toast({
        title: 'Không thể hủy cuộc họp',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
      setCancelDialogOpen(false);
      setMeetingToCancel(null);
      return;
    }
    toast({
      title: 'Đã hủy cuộc họp',
      description: 'Cuộc họp đã được hủy thành công.',
    });
    await fetchData();
    setLoading(false);
    setCancelDialogOpen(false);
    setMeetingToCancel(null);
  };

  const toDatetimeLocal = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Pad month, day, hour, minute with leading zeros
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const handleEditClick = (meeting: Meeting) => {
    setNewMeeting({
      title: meeting.title,
      startTime: toDatetimeLocal(meeting.startTime),
      endTime: toDatetimeLocal(meeting.endTime),
      organizer_id: meeting.organizer_id,
      status: meeting.status,
    });
    setEditing(true);
    setEditingMeetingId(meeting.id);
    setCurrentStep(3);
  };

  const handleEditMeeting = async () => {
    if (!selectedRoom || !newMeeting.title || !newMeeting.startTime || !newMeeting.endTime) {
      toast({
        title: 'Thiếu thông tin bắt buộc',
        description: 'Vui lòng điền đầy đủ tất cả các trường bắt buộc',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const rpcResult: { data: any; error: any } = await supabase.rpc('update_meeting', {
      p_meeting_id: editingMeetingId,
      p_title: newMeeting.title,
      p_start_time: localToUTCISOString(newMeeting.startTime),
      p_end_time: localToUTCISOString(newMeeting.endTime),
    });
    if (rpcResult.error) {
      toast({
        title: 'Không thể cập nhật cuộc họp',
        description: rpcResult.error.message,
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }
    toast({
      title: 'Đã cập nhật cuộc họp',
      description: 'Cuộc họp đã được cập nhật thành công.',
    });
    await fetchData();
    setNewMeeting({
      title: "",
      startTime: "",
      endTime: "",
      organizer_id: user?.id || "Current User",
      status: "Scheduled",
    });
    setEditing(false);
    setEditingMeetingId(null);
    setCurrentStep(2);
    setLoading(false);
  };

  const getRoomMeetings = (roomId: string) => {
    return meetings.filter((meeting) => meeting.roomId === roomId)
  }

  const steps = [
    { number: 1, title: "Chọn phòng", icon: MapPin },
    { number: 2, title: "Xem lịch", icon: Calendar },
    { number: 3, title: "Book phòng", icon: Plus },
  ]

  // In the render, show a loading spinner or message if loading is true
  if (loading) {
    return (
      <MeetingBookingLoading />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Đặt phòng họp</h1>
          <p className="text-gray-500 mt-1">Đặt phòng họp cho nhóm của bạn</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center w-full max-w-2xl">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.number
              const isCompleted = currentStep > step.number

              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                        isActive && "border-blue-500 bg-blue-500 text-white",
                        isCompleted && "border-green-500 bg-green-500 text-white",
                        !isActive && !isCompleted && "border-gray-300 bg-white text-gray-400",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      className={cn(
                        "text-sm mt-2 font-medium text-center",
                        isActive && "text-blue-600",
                        isCompleted && "text-green-600",
                        !isActive && !isCompleted && "text-gray-400",
                      )}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "flex-1 h-0.5 mx-4 transition-colors",
                        currentStep > step.number ? "bg-green-500" : "bg-gray-300",
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step 1: Select Room */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Chọn phòng họp</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {meetingRooms.map((room) => (
                <Card
                  key={room.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-300"
                  onClick={() => handleRoomSelect(room)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{room.name}</span>
                      <Badge variant="outline">
                        <Users className="h-3 w-3 mr-1" />
                        {room.capacity}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {room.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Thiết bị:</h4>
                      <div className="flex flex-wrap gap-1">
                        {room.equipment.map((item) => (
                          <Badge key={item} variant="secondary" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: View Room Schedule */}
        {currentStep === 2 && selectedRoom && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">{selectedRoom.name} - Lịch Trình</h2>
                <p className="text-gray-500">
                  {selectedRoom.location} • Sức chứa: {selectedRoom.capacity} người
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại
                </Button>
                <Button onClick={() => setCurrentStep(3)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Cuộc Họp Mới
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Cuộc Họp Hôm Nay</CardTitle>
                <CardDescription>Lịch đặt hiện tại cho {selectedRoom.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getRoomMeetings(selectedRoom.id).length > 0 ? (
                    getRoomMeetings(selectedRoom.id).map((meeting) => (
                      <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{meeting.title}</h3>
                            <Badge
                              className={
                                meeting.status === "Scheduled"
                                  ? "bg-blue-100 text-blue-800"
                                  : meeting.status === "Completed"
                                  ? "bg-green-100 text-green-800"
                                  : meeting.status === "Cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {meeting.status === "Scheduled" ? "Đã lên lịch" : 
                               meeting.status === "Completed" ? "Hoàn thành" :
                               meeting.status === "Cancelled" ? "Đã hủy" : meeting.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatDateTime(meeting.startTime)} - {formatDateTime(meeting.endTime)}
                            </span>
                            <span className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {meeting.organizer_name || meeting.organizer_id}
                            </span>
                          </div>
                        </div>
                        {(meeting.organizer_id === user?.id && meeting.status === "Scheduled") && (
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditClick(meeting)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Dialog open={cancelDialogOpen && meetingToCancel === meeting.id} onOpenChange={(open) => { if (!open) { setCancelDialogOpen(false); setMeetingToCancel(null); } }}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => { setCancelDialogOpen(true); setMeetingToCancel(meeting.id); }}
                                  disabled={loading}
                                  aria-label="Hủy cuộc họp"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Hủy Cuộc Họp</DialogTitle>
                                  <DialogDescription>
                                    Bạn có chắc chắn muốn hủy cuộc họp này không? Hành động này không thể hoàn tác.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <DialogClose asChild>
                                    <Button variant="outline">Không, giữ cuộc họp</Button>
                                  </DialogClose>
                                  <Button variant="destructive" onClick={handleCancelMeeting} disabled={loading}>
                                    Có, hủy cuộc họp
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Không có cuộc họp nào được lên lịch cho phòng này hôm nay</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Create Meeting */}
        {currentStep === 3 && selectedRoom && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">{editing ? 'Chỉnh Sửa Cuộc Họp' : 'Tạo Cuộc Họp Mới'}</h2>
                <p className="text-gray-500">{editing ? `Chỉnh sửa cuộc họp của bạn tại ${selectedRoom.name}` : `Đặt ${selectedRoom.name} cho cuộc họp của bạn`}</p>
              </div>
              <Button variant="outline" onClick={() => { setCurrentStep(2); setEditing(false); setEditingMeetingId(null); }}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Chi Tiết Cuộc Họp</CardTitle>
                <CardDescription>{editing ? 'Chỉnh sửa thông tin cuộc họp của bạn' : 'Điền thông tin cho cuộc họp của bạn'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="title">Tiêu Đề Cuộc Họp *</Label>
                    <Input
                      id="title"
                      placeholder="Nhập tiêu đề cuộc họp"
                      value={newMeeting.title}
                      onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="startTime">Thời Gian Bắt Đầu *</Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      value={newMeeting.startTime}
                      onChange={(e) => setNewMeeting({ ...newMeeting, startTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">Thời Gian Kết Thúc *</Label>
                    <Input
                      id="endTime"
                      type="datetime-local"
                      value={newMeeting.endTime}
                      onChange={(e) => setNewMeeting({ ...newMeeting, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Thông Tin Phòng</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <strong>Phòng:</strong> {selectedRoom.name}
                    </p>
                    <p>
                      <strong>Vị trí:</strong> {selectedRoom.location}
                    </p>
                    <p>
                      <strong>Sức chứa:</strong> {selectedRoom.capacity} người
                    </p>
                    <p>
                      <strong>Thiết bị:</strong> {selectedRoom.equipment.join(", ")}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-4">
                  <Button variant="outline" onClick={() => { setCurrentStep(2); setEditing(false); setEditingMeetingId(null); }}>
                    Hủy
                  </Button>
                  <Button
                    onClick={editing ? handleEditMeeting : handleCreateMeeting}
                    className={editing ? "bg-yellow-600 hover:bg-yellow-700" : "bg-green-600 hover:bg-green-700"}
                    disabled={creating || loading}
                  >
                    {creating || loading ? (
                      <span className="flex items-center"><span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></span>{editing ? 'Đang lưu...' : 'Đang tạo...'}</span>
                    ) : (
                      <>{editing ? <Edit className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}{editing ? 'Lưu Thay Đổi' : 'Tạo Cuộc Họp'}</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

function localToUTCISOString(localDateTimeString: string) {
  if (!localDateTimeString) return "";
  const localDate = new Date(localDateTimeString);
  return localDate.toISOString(); // Always UTC
}
