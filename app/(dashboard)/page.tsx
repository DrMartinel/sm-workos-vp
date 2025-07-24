"use client"

import {
  CheckSquare,
  Target,
  GitBranch,
  BarChart3,
  Megaphone,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const announcements = [
  {
    title: "Chính sách nghỉ lễ mới của công ty",
    content: "Chúng tôi vui mừng thông báo lịch nghỉ lễ được cập nhật với nhiều tùy chọn thời gian nghỉ linh hoạt hơn.",
    date: "2 giờ trước",
  },
  {
    title: "Cuộc họp toàn thể Q3 tuần tới",
    content: "Tham gia cùng chúng tôi trong cuộc họp toàn thể hàng quý để thảo luận về tiến độ và mục tiêu tương lai.",
    date: "1 ngày trước",
  },
  {
    title: "Chào mừng Trưởng phòng Kỹ thuật mới!",
    content: "Hãy chào đón nồng nhiệt Sarah Johnson, người sẽ dẫn dắt đội ngũ kỹ thuật của chúng ta.",
    date: "2 ngày trước",
  },
  {
    title: "Bảo trì máy chủ cuối tuần này",
    content: "Vui lòng lưu ý việc bảo trì máy chủ theo lịch trình vào thứ Bảy từ 2 giờ sáng đến 4 giờ sáng.",
    date: "4 ngày trước",
  },
]

export default function WorkspaceDashboard() {
  return (
    <div className="flex-1 overflow-auto p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Chào mừng đến với Không gian làm việc</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
              <CardDescription>Các công cụ và phím tắt thường dùng</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Link href="#">
                  <Button variant="outline" className="h-20 flex-col justify-center gap-1 w-full bg-transparent">
                    <CheckSquare className="h-5 w-5" />
                    <span>Nhiệm vụ</span>
                  </Button>
                </Link>
                <Link href="/reports/overview">
                  <Button variant="outline" className="h-20 flex-col justify-center gap-1 w-full bg-transparent">
                    <BarChart3 className="h-5 w-5" />
                    <span>Báo cáo</span>
                  </Button>
                </Link>
                <Button variant="outline" className="h-20 flex-col justify-center gap-1 bg-transparent">
                  <Target className="h-5 w-5" />
                  <span>Đặt mục tiêu</span>
                </Button>
                <Link href="/workflow-editor">
                  <Button variant="outline" className="h-20 flex-col justify-center gap-1 w-full bg-transparent">
                    <GitBranch className="h-5 w-5" />
                    <span>Quy trình</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thông báo</CardTitle>
              <CardDescription>Tin tức và cập nhật mới nhất từ công ty.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <Megaphone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-4">
              <Link href="#" className="w-full">
                <Button variant="outline" className="w-full">
                  Xem tất cả
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Tổng quan nhóm</CardTitle>
              <CardDescription>Trạng thái và tiến độ hiện tại của nhóm</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="text-sm font-medium text-gray-500">Nhiệm vụ đang hoạt động</div>
                  <div className="mt-2 text-3xl font-bold">24</div>
                  <div className="mt-1 text-xs text-green-500">+12% so với tuần trước</div>
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="text-sm font-medium text-gray-500">Yêu cầu đang chờ</div>
                  <div className="mt-2 text-3xl font-bold">7</div>
                  <div className="mt-1 text-xs text-amber-500">+3% so với tuần trước</div>
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="text-sm font-medium text-gray-500">Mục tiêu đã hoàn thành</div>
                  <div className="mt-2 text-3xl font-bold">12</div>
                  <div className="mt-1 text-xs text-green-500">+8% so với tuần trước</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
