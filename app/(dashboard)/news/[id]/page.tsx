"use client"

import Link from "next/link"
import React from "react"
import { ArrowLeft, Bell, Calendar, Clock, FileText, AlertCircle, MapPin, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function NewsDetailPage({ params }: PageProps) {
  const { id } = React.use(params)

  const announcements = [
    {
      id: 1,
      title: "Company Retreat Thường Niên 2024",
      message:
        "Hãy tham gia cùng chúng tôi trong chuyến đi nghỉ dưỡng hàng năm của công ty tại Thung lũng Napa! Chủ đề năm nay là 'Đổi mới và Tăng trưởng' với các hoạt động xây dựng đội ngũ, các phiên lập kế hoạch chiến lược và cơ hội kết nối. Chuyến đi sẽ có sự tham gia của các diễn giả chính từ các nhà lãnh đạo trong ngành, các buổi hội thảo tương tác về các công nghệ mới nổi và nhiều thời gian để gắn kết đồng đội. Mọi bữa ăn và chỗ ở đều được cung cấp. Vui lòng xác nhận tham dự trước ngày 15 tháng 3.",
      fullContent: `
        <h2>Tổng Quan Sự Kiện</h2>
        <p>Chúng tôi rất vui mừng thông báo về Chuyến đi nghỉ dưỡng hàng năm của công ty năm 2024, diễn ra tại Thung lũng Napa xinh đẹp. Chuyến đi năm nay tập trung vào "Đổi mới và Tăng trưởng" và hứa hẹn sẽ là sự kiện hấp dẫn nhất của chúng ta.</p>
        
        <h3>Lịch Trình</h3>
        <ul>
          <li><strong>Ngày 1 (15 tháng 4):</strong> Đến nơi, tiệc chào mừng và các hoạt động xây dựng đội ngũ</li>
          <li><strong>Ngày 2 (16 tháng 4):</strong> Các phiên lập kế hoạch chiến lược, bài phát biểu chính và hội thảo đổi mới</li>
          <li><strong>Ngày 3 (17 tháng 4):</strong> Các phiên kết nối, lễ bế mạc và khởi hành</li>
        </ul>
        
        <h3>Bao Gồm Những Gì</h3>
        <ul>
          <li>Tất cả các bữa ăn và đồ giải khát</li>
          <li>Chỗ ở tại Napa Valley Resort & Spa</li>
          <li>Phương tiện di chuyển đến và đi từ địa điểm tổ chức</li>
          <li>Tài liệu hội thảo và gói chào mừng</li>
        </ul>
        
        <h3>Đăng Ký</h3>
        <p>Vui lòng xác nhận tham dự trước ngày 15 tháng 3 thông qua cổng thông tin Nhân sự. Số lượng có hạn, vì vậy khuyến khích đăng ký sớm.</p>
      `,
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
      fullContent: `
        <h2>Cập Nhật Chính Sách Làm Việc Từ Xa</h2>
        <p>Có hiệu lực từ ngày 1 tháng 4 năm 2024, chúng tôi đang thực hiện một số cập nhật cho chính sách làm việc từ xa của mình để hỗ trợ tốt hơn cho sự linh hoạt và năng suất của đội ngũ.</p>
        
        <h3>Các Thay Đổi Chính</h3>
        <ul>
          <li><strong>Giờ Làm Việc Linh Hoạt:</strong> Giờ làm việc cốt lõi hiện là 10 giờ sáng - 3 giờ chiều, với sự linh hoạt ngoài những giờ này</li>
          <li><strong>Phụ Cấp Thiết Bị:</strong> Phụ cấp hàng năm 500 đô la cho thiết bị văn phòng tại nhà</li>
          <li><strong>Hướng Dẫn Liên Lạc:</strong> Cập nhật kỳ vọng về thời gian phản hồi và tính sẵn sàng của cuộc họp</li>
          <li><strong>Chỉ Số Hiệu Suất:</strong> Tiêu chí đánh giá hiệu suất dựa trên kết quả mới</li>
        </ul>
        
        <h3>Yêu Cầu Hành Động</h3>
        <p>Tất cả nhân viên phải xác nhận đã nhận được bản cập nhật chính sách này thông qua cổng thông tin Nhân sự trước ngày 22 tháng 3 năm 2024. Việc không xác nhận có thể dẫn đến các hạn chế truy cập tạm thời.</p>
        
        <h3>Câu Hỏi?</h3>
        <p>Nếu bạn có bất kỳ câu hỏi nào về những thay đổi chính sách này, vui lòng liên hệ với phòng Nhân sự hoặc tham dự phiên Hỏi & Đáp dự kiến vào ngày 20 tháng 3 lúc 2 giờ chiều.</p>
      `,
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
        fullContent: `
        <h2>Hội Thảo Đổi Mới Công Nghệ: AI & Học Máy</h2>
        <p>Hãy tham gia cùng chúng tôi trong một hội thảo chuyên sâu kéo dài hai ngày để khám phá những phát triển mới nhất về AI và Học máy cũng như các ứng dụng của chúng trong ngành của chúng ta.</p>
        
        <h3>Chương Trình Hội Thảo</h3>
        <h4>Ngày 1 - 25 tháng 3, 2024</h4>
        <ul>
            <li>9:00 - 10:30: Giới thiệu về Nguyên tắc cơ bản của AI/ML</li>
            <li>11:00 - 12:30: Các ứng dụng trong ngành và nghiên cứu điển hình</li>
            <li>13:30 - 15:00: Hội thảo thực hành: Xây dựng mô hình đầu tiên của bạn</li>
            <li>15:30 - 17:00: Tổng quan về các công cụ và nền tảng</li>
        </ul>
        
        <h4>Ngày 2 - 26 tháng 3, 2024</h4>
        <ul>
            <li>9:00 - 10:30: Các kỹ thuật nâng cao và phương pháp hay nhất</li>
            <li>11:00 - 12:30: Các chiến lược triển khai</li>
            <li>13:30 - 15:00: Dự án nhóm và thuyết trình</li>
            <li>15:30 - 16:30: Hỏi & Đáp và các bước tiếp theo</li>
        </ul>
        
        <h3>Đối Tượng Tham Dự</h3>
        <p>Hội thảo này được thiết kế cho cả nhân viên kỹ thuật và phi kỹ thuật quan tâm đến việc tìm hiểu các ứng dụng AI/ML. Không yêu cầu kinh nghiệm trước.</p>
        
        <h3>Đăng Ký</h3>
        <p>Giới hạn 30 người tham gia. Đăng ký qua cổng thông tin học tập trước ngày 20 tháng 3.</p>
        `,
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
        fullContent: `
        <h2>Cuộc Họp Toàn Thể Nhóm</h2>
        <p>Hãy tham gia cùng chúng tôi trong cuộc họp toàn thể hàng quý để xem xét hiệu suất Quý 1 và thảo luận về các sáng kiến sắp tới.</p>
        
        <h3>Chương Trình Nghị Sự</h3>
        <ul>
            <li>Xem xét kết quả Quý 1 (30 phút)</li>
            <li>Tổng quan về các dự án sắp tới (20 phút)</li>
            <li>Cập nhật và thông báo của nhóm (15 phút)</li>
            <li>Phiên Hỏi & Đáp (15 phút)</li>
        </ul>
        
        <h3>Chuẩn Bị</h3>
        <p>Vui lòng mang theo:</p>
        <ul>
            <li>Báo cáo tình hình dự án của bạn</li>
            <li>Bất kỳ câu hỏi hoặc thắc mắc nào bạn muốn thảo luận</li>
            <li>Ý tưởng cải tiến quy trình</li>
        </ul>
        
        <h3>Chi Tiết Cuộc Họp</h3>
        <p><strong>Ngày:</strong> Thứ Sáu, ngày 22 tháng 3 năm 2024<br>
        <strong>Thời gian:</strong> 2:00 chiều - 3:00 chiều<br>
        <strong>Địa điểm:</strong> Phòng họp A<br>
        <strong>Từ xa:</strong> Liên kết Zoom sẽ được chia sẻ riêng</p>
        `,
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
        fullContent: `
        <h2>Bảo Trì Hệ Thống Theo Lịch Trình</h2>
        <p>Chúng tôi sẽ thực hiện bảo trì theo lịch trình trên các hệ thống của mình để cải thiện hiệu suất và bảo mật.</p>
        
        <h3>Khung Thời Gian Bảo Trì</h3>
        <p><strong>Ngày:</strong> Chủ Nhật, ngày 24 tháng 3 năm 2024<br>
        <strong>Thời gian:</strong> 2:00 sáng - 4:00 sáng theo giờ PST<br>
        <strong>Thời lượng:</strong> Khoảng 2 giờ</p>
        
        <h3>Các Dịch Vụ Bị Ảnh Hưởng</h3>
        <ul>
            <li>Intranet và cổng thông tin của công ty</li>
            <li>Dịch vụ email (có thể bị gián đoạn ngắn)</li>
            <li>Các công cụ chia sẻ tệp và cộng tác</li>
            <li>Hệ thống chấm công và Nhân sự</li>
        </ul>
        
        <h3>Điều Gì Sẽ Xảy Ra</h3>
        <ul>
            <li>Các dịch vụ có thể không khả dụng không liên tục</li>
            <li>Một số tính năng có thể bị vô hiệu hóa tạm thời</li>
            <li>Đồng bộ hóa dữ liệu có thể bị trì hoãn</li>
        </ul>
        
        <h3>Chuẩn Bị</h3>
        <p>Vui lòng lưu lại mọi công việc quan trọng trước khung thời gian bảo trì và tránh lên lịch cho các tác vụ quan trọng trong thời gian này.</p>
        
        <p>Chúng tôi xin lỗi vì bất kỳ sự bất tiện nào và đánh giá cao sự kiên nhẫn của bạn trong khi chúng tôi làm việc để cải thiện hệ thống của mình.</p>
        `,
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
        fullContent: `
        <h2>Thử Thách Thoát Khỏi Phòng Kín Xây Dựng Đội Ngũ</h2>
        <p>Hãy sẵn sàng cho một cuộc phiêu lưu xây dựng đội ngũ thú vị! Chúng ta sẽ đưa cả nhóm đến Escape Quest Downtown để tham gia một thử thách giải đố ly kỳ.</p>
        
        <h3>Chi Tiết Sự Kiện</h3>
        <p><strong>Ngày:</strong> Thứ Bảy, ngày 30 tháng 3 năm 2024<br>
        <strong>Thời gian:</strong> 2:00 chiều - 5:00 chiều<br>
        <strong>Địa điểm:</strong> Escape Quest Downtown<br>
        <strong>Địa chỉ:</strong> 123 Phố Chính, Trung tâm thành phố</p>
        
        <h3>Điều Gì Sẽ Xảy Ra</h3>
        <ul>
            <li>Các đội gồm 4-6 người sẽ làm việc cùng nhau</li>
            <li>Nhiều phòng thoát hiểm theo chủ đề có sẵn</li>
            <li>Các thử thách kéo dài 60 phút với các mức độ khó khác nhau</li>
            <li>Ảnh chuyên nghiệp về cuộc phiêu lưu của nhóm bạn</li>
        </ul>
        
        <h3>Lịch Trình</h3>
        <ul>
            <li>2:00 chiều - Đến nơi và phân công nhóm</li>
            <li>2:30 chiều - Thử thách phòng thoát hiểm đầu tiên</li>
            <li>3:45 chiều - Thử thách phòng thoát hiểm thứ hai</li>
            <li>4:30 chiều - Đồ ăn nhẹ, đồ uống và chụp ảnh nhóm</li>
            <li>5:00 chiều - Tổng kết và khởi hành</li>
        </ul>
        
        <h3>Bao Gồm Những Gì</h3>
        <ul>
            <li>Vé vào cửa phòng thoát hiểm cho tất cả những người tham gia</li>
            <li>Đồ ăn nhẹ và đồ giải khát</li>
            <li>Ảnh và kỷ niệm của nhóm</li>
            <li>Giải thưởng nhỏ cho các đội thành công</li>
        </ul>
        
        <h3>Đăng Ký</h3>
        <p>Vui lòng RSVP trước ngày 25 tháng 3 để chúng tôi có thể hoàn tất việc sắp xếp nhóm và phục vụ ăn uống.</p>
        `,
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
        fullContent: `
        <h2>Lịch Nghỉ Lễ Quý 2 Năm 2024</h2>
        <p>Chúng tôi vui mừng thông báo lịch nghỉ lễ của công ty trong quý hai năm 2024.</p>
        
        <h3>Các Ngày Nghỉ Theo Lịch Trình</h3>
        <ul>
            <li><strong>Ngày Tưởng Niệm:</strong> Thứ Hai, ngày 27 tháng 5 năm 2024</li>
            <li><strong>Ngày Quốc Khánh:</strong> Thứ Năm, ngày 4 tháng 7 năm 2024</li>
            <li><strong>Ngày Quốc Khánh (Nghỉ bù):</strong> Thứ Sáu, ngày 5 tháng 7 năm 2024</li>
        </ul>
        
        <h3>Ngày Nghỉ Phép Linh Hoạt</h3>
        <p>Mỗi nhân viên có 2 ngày nghỉ phép linh hoạt có thể sử dụng theo quyết định của mình trong Quý 2. Những ngày này phải được người quản lý của bạn chấp thuận và lên lịch trước ít nhất một tuần.</p>
        
        <h3>Lên Kế Hoạch Nghỉ Phép</h3>
        <ul>
            <li>Gửi yêu cầu nghỉ phép trước ít nhất 2 tuần</li>
            <li>Các ngày phổ biến xung quanh các ngày lễ sẽ nhanh chóng được đăng ký hết</li>
            <li>Xem xét phạm vi công việc của nhóm khi lên kế hoạch nghỉ phép</li>
            <li>Kiểm tra với người quản lý của bạn về bất kỳ hạn chế nào liên quan đến dự án cụ thể</li>
        </ul>
        
        <h3>Lưu Ý Quan Trọng</h3>
        <ul>
            <li>Văn phòng sẽ đóng cửa vào tất cả các ngày nghỉ theo lịch trình</li>
            <li>Hỗ trợ khẩn cấp sẽ có sẵn cho các vấn đề quan trọng</li>
            <li>Lương ngày lễ áp dụng cho tất cả nhân viên toàn thời gian</li>
            <li>Nhân viên bán thời gian nên kiểm tra với phòng Nhân sự để biết tính đủ điều kiện nhận lương ngày lễ</li>
        </ul>
        
        <p>Đối với các câu hỏi về lịch nghỉ lễ hoặc chính sách nghỉ phép, vui lòng liên hệ với phòng Nhân sự.</p>
        `,
        time: "2 ngày trước",
        type: "announcement",
        priority: "medium",
        author: "Phòng Nhân sự",
    },
]

  const priorityTranslations: { [key: string]: string } = {
    high: "Cao",
    medium: "Trung bình",
    low: "Thấp"
  };

  const typeTranslations: { [key: string]: string } = {
    policy: "Chính sách",
    meeting: "Họp",
    system: "Hệ thống",
    announcement: "Thông báo",
    event: "Sự kiện"
  };

  const announcement = announcements.find((a) => a.id === Number.parseInt(id))

  if (!announcement) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy thông báo</h3>
            <p className="text-gray-600 mb-4">Thông báo bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
            <Link href="/news">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại trang tin tức
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

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

  return (
    <div className="p-6">
      <div className="mx-auto max-w-4xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/news">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Quay lại trang tin tức
            </Button>
          </Link>
        </div>

        {/* Announcement Detail */}
        <Card className="border border-gray-200">
          {/* Event Cover Image */}
          {announcement.type === "event" && announcement.coverImage && (
            <div className="relative">
              <img
                src={announcement.coverImage || "/placeholder.svg"}
                alt={announcement.title}
                className="w-full h-64 object-cover rounded-t-lg"
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

          <CardHeader className={announcement.type === "event" && announcement.coverImage ? "pb-4" : ""}>
            {/* Badges for non-event announcements */}
            {!(announcement.type === "event" && announcement.coverImage) && (
              <div className="flex gap-2 mb-4">
                <Badge className={cn("border", getTypeColor(announcement.type))}>
                  {getTypeIcon(announcement.type)}
                  <span className="ml-1 capitalize">{typeTranslations[announcement.type as keyof typeof typeTranslations]}</span>
                </Badge>
                <Badge className={cn("border", getPriorityColor(announcement.priority))}>
                  <span className="capitalize">{priorityTranslations[announcement.priority as keyof typeof priorityTranslations]}</span>
                </Badge>
              </div>
            )}

            <CardTitle className="text-2xl font-bold text-gray-900 mb-4">{announcement.title}</CardTitle>

            {/* Event-specific information */}
            {announcement.type === "event" && (
              <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-4 p-4 bg-gray-50 rounded-lg">
                {announcement.eventDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span className="font-medium">{announcement.eventDate}</span>
                  </div>
                )}
                {announcement.eventLocation && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span className="font-medium">{announcement.eventLocation}</span>
                  </div>
                )}
              </div>
            )}

            {/* Meta information */}
            <div className="flex items-center gap-6 text-sm text-gray-500 border-b border-gray-200 pb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{announcement.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Bởi {announcement.author}</span>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Full Content */}
            <div
              className="prose prose-gray max-w-none"
              dangerouslySetInnerHTML={{ __html: announcement.fullContent || announcement.message }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
