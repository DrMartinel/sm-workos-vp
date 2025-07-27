"use client"

import { useState } from "react"
import Link from "next/link"
import { Bell, Calendar, Clock, FileText, AlertCircle, Search, Filter, ChevronDown, MapPin, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function NewsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedPriority, setSelectedPriority] = useState("all")

  const announcements = [
    {
      id: 1,
      title: "Company Retreat Thường Niên 2024",
      message:
        "Hãy tham gia cùng chúng tôi trong chuyến đi nghỉ dưỡng hàng năm của công ty tại Thung lũng Napa! Chủ đề năm nay là 'Đổi mới và Tăng trưởng' với các hoạt động xây dựng đội ngũ, các phiên lập kế hoạch chiến lược và cơ hội kết nối. Chuyến đi sẽ có sự tham gia của các diễn giả chính từ các nhà lãnh đạo trong ngành, các buổi hội thảo tương tác về các công nghệ mới nổi và nhiều thời gian để gắn kết đồng đội. Mọi bữa ăn và chỗ ở đều được cung cấp. Vui lòng xác nhận tham dự trước ngày 15 tháng 3.",
      time: "2 giờ trước",
      type: "event",
      priority: "high",
      author: "Phòng Nhân sự",
      eventDate: "15-17 tháng 4, 2024",
      eventLocation: "Napa Valley Resort & Spa",
      coverImage: "/placeholder.svg?height=200&width=800",
    },
    {
      id: 2,
      title: "Cập Nhật Chính Sách Mới Của Công Ty",
      message:
        "Vui lòng xem lại chính sách làm việc từ xa được cập nhật có hiệu lực vào tháng tới. Các thay đổi chính bao gồm giờ làm việc linh hoạt, phụ cấp thiết bị mới và hướng dẫn liên lạc được cập nhật. Tất cả nhân viên phải xác nhận đã nhận được bản cập nhật chính sách này thông qua cổng thông tin Nhân sự trước cuối tuần này.",
      time: "4 giờ trước",
      type: "policy",
      priority: "high",
      author: "Ban Chính sách",
    },
    {
      id: 3,
      title: "Hội Thảo Đổi Mới Công Nghệ",
      message:
        "Hội thảo chuyên sâu kéo dài hai ngày về các ứng dụng AI và Học máy trong ngành của chúng ta. Tìm hiểu về các xu hướng, công cụ và kỹ thuật mới nhất từ các giảng viên chuyên gia. Hội thảo này được thiết kế cho cả nhân viên kỹ thuật và phi kỹ thuật. Bữa trưa và tài liệu sẽ được cung cấp. Số lượng có hạn - hãy đăng ký ngay!",
      time: "6 giờ trước",
      type: "event",
      priority: "medium",
      author: "Đội Công nghệ",
      eventDate: "25-26 tháng 3, 2024",
      eventLocation: "Trung tâm Hội nghị, Tòa nhà A",
      coverImage: "/placeholder.svg?height=200&width=800",
    },
    {
      id: 4,
      title: "Lịch Họp Nhóm",
      message:
        "Cuộc họp toàn thể dự kiến vào thứ Sáu lúc 2 giờ chiều tại Phòng họp A. Chúng ta sẽ thảo luận về kết quả Quý 1, các dự án sắp tới và cập nhật của nhóm. Vui lòng chuẩn bị sẵn báo cáo tình hình dự án và bất kỳ câu hỏi nào bạn muốn giải quyết.",
      time: "1 ngày trước",
      type: "meeting",
      priority: "medium",
      author: "Ban Quản lý",
    },
    {
      id: 5,
      title: "Thông Báo Bảo Trì Hệ Thống",
      message:
        "Bảo trì theo lịch trình vào Chủ Nhật từ 2-4 giờ sáng. Các dịch vụ có thể tạm thời không khả dụng trong thời gian này. Chúng tôi xin lỗi vì bất kỳ sự bất tiện nào và đánh giá cao sự kiên nhẫn của bạn trong khi chúng tôi làm việc để cải thiện hiệu suất hệ thống.",
      time: "1 ngày trước",
      type: "system",
      priority: "low",
      author: "Đội IT",
    },
    {
      id: 6,
      title: "Thử Thách Thoát Khỏi Phòng Kín Xây Dựng Đội Ngũ",
      message:
        "Hãy tham gia cùng chúng tôi trong một sự kiện xây dựng đội ngũ vui nhộn tại phòng thoát hiểm địa phương! Cùng nhau giải các câu đố, phá mã và thoát ra trong thời gian giới hạn. Đây là một cơ hội tuyệt vời để tăng cường mối quan hệ đồng đội và vui vẻ bên ngoài văn phòng. Đồ ăn nhẹ và đồ uống sẽ được cung cấp sau đó.",
      time: "2 ngày trước",
      type: "event",
      priority: "medium",
      author: "Phòng Nhân sự",
      eventDate: "30 tháng 3, 2024",
      eventLocation: "Escape Quest Downtown",
      coverImage: "/placeholder.svg?height=200&width=800",
    },
    {
      id: 7,
      title: "Thông Báo Lịch Nghỉ Lễ",
      message:
        "Lịch nghỉ lễ của công ty trong Quý 2 đã được công bố. Kiểm tra lịch để biết chi tiết và lên kế hoạch nghỉ ngơi cho phù hợp. Nhớ gửi yêu cầu nghỉ phép trước ít nhất hai tuần.",
      time: "2 ngày trước",
      type: "announcement",
      priority: "medium",
      author: "Phòng Nhân sự",
    },
  ]

  const priorityTranslations: { [key: string]: string } = {
    high: "Cao",
    medium: "Trung bình",
    low: "Thấp",
    all: "Tất cả"
  };

  const typeTranslations: { [key: string]: string } = {
    policy: "Chính sách",
    meeting: "Họp",
    system: "Hệ thống",
    announcement: "Thông báo",
    event: "Sự kiện",
    all: "Tất cả"
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "policy":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "meeting":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "system":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "announcement":
        return "bg-indigo-100 text-indigo-800 border-indigo-200"
      case "event":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "policy":
        return <FileText className="h-4 w-4" />
      case "meeting":
        return <Calendar className="h-4 w-4" />
      case "system":
        return <AlertCircle className="h-4 w-4" />
      case "announcement":
        return <Bell className="h-4 w-4" />
      case "event":
        return <Calendar className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.message.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === "all" || announcement.type === selectedType
    const matchesPriority = selectedPriority === "all" || announcement.priority === selectedPriority

    return matchesSearch && matchesType && matchesPriority
  })

  return (
    <div className="p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thông báo</h1>
          <p className="text-gray-600">Luôn cập nhật những tin tức và thông báo mới nhất từ công ty</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm thông báo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Filter className="h-4 w-4" />
                  Loại: {typeTranslations[selectedType]}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedType("all")}>Tất cả các loại</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedType("policy")}>Chính sách</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedType("meeting")}>Cuộc họp</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedType("system")}>Hệ thống</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedType("announcement")}>Thông báo</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedType("event")}>Sự kiện</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  Ưu tiên: {priorityTranslations[selectedPriority]}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedPriority("all")}>Tất cả mức độ</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedPriority("high")}>Cao</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedPriority("medium")}>Trung bình</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedPriority("low")}>Thấp</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Announcements List */}
        <div className="space-y-8">
          {filteredAnnouncements.map((announcement) => (
            <div key={announcement.id} className="mb-6">
              <Link href={`/news/${announcement.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
                  {/* Event Cover Image */}
                  {announcement.type === "event" && announcement.coverImage && (
                    <div className="relative">
                      <img
                        src={announcement.coverImage || "/placeholder.svg"}
                        alt={announcement.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <Badge className={cn("border", getTypeColor(announcement.type))}>
                          {getTypeIcon(announcement.type)}
                          <span className="ml-1 capitalize">{typeTranslations[announcement.type as keyof typeof typeTranslations]}</span>
                        </Badge>
                        <Badge className={cn("border", getPriorityColor(announcement.priority))}>
                          <span className="capitalize">{priorityTranslations[announcement.priority as keyof typeof priorityTranslations]}</span>
                        </Badge>
                      </div>
                    </div>
                  )}

                  <CardHeader className={announcement.type === "event" && announcement.coverImage ? "pb-3" : ""}>
                    {/* Badges for non-event announcements */}
                    {!(announcement.type === "event" && announcement.coverImage) && (
                      <div className="flex gap-2 mb-3">
                        <Badge className={cn("border", getTypeColor(announcement.type))}>
                          {getTypeIcon(announcement.type)}
                          <span className="ml-1 capitalize">{typeTranslations[announcement.type as keyof typeof typeTranslations]}</span>
                        </Badge>
                        <Badge className={cn("border", getPriorityColor(announcement.priority))}>
                           <span className="capitalize">{priorityTranslations[announcement.priority as keyof typeof priorityTranslations]}</span>
                        </Badge>
                      </div>
                    )}

                    <CardTitle className="text-xl font-semibold text-gray-900 mb-2">{announcement.title}</CardTitle>

                    {/* Event-specific information */}
                    {announcement.type === "event" && (
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        {announcement.eventDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{announcement.eventDate}</span>
                          </div>
                        )}
                        {announcement.eventLocation && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{announcement.eventLocation}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <CardDescription className="text-gray-600 line-clamp-3">{announcement.message}</CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{announcement.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>Bởi {announcement.author}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>

        {filteredAnnouncements.length === 0 && (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy thông báo nào</h3>
            <p className="text-gray-600">Hãy thử điều chỉnh lại từ khóa tìm kiếm hoặc bộ lọc của bạn</p>
          </div>
        )}
      </div>
    </div>
  )
}
