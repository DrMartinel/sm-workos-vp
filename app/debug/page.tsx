"use client"

import { DebugAuth } from "@/app/shared-ui/components/debug-auth"
import { UserInfoDisplay } from "@/app/shared-ui/components/user-info-display"
import { AdminOnly } from "@/app/shared-ui/components/role-protection"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ToasterTestButton, 
  SuccessToastButton, 
  ErrorToastButton, 
  WarningToastButton, 
  InfoToastButton 
} from "@/app/shared-ui/components/ui/toaster-test-button"
import Link from "next/link"

export default function DebugPage() {
  return (
    <AdminOnly>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Auth Debug Page</h1>
        <p className="text-gray-600">
          This page helps debug authentication and role management issues.
          Check the browser console for detailed logs.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DebugAuth />
          <UserInfoDisplay showBalance={true} showAvatar={true} compact={false} />
        </div>
        
        {/* Toaster Test Section */}
        <Card>
          <CardHeader>
            <CardTitle>🧪 Toaster Test Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-gray-600">
              Test different types of toast notifications to configure your toaster settings.
            </p>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Test All Toasts (Sequential):</h4>
                <ToasterTestButton variant="outline" />
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Individual Toast Tests:</h4>
                <div className="flex flex-wrap gap-2">
                  <SuccessToastButton />
                  <ErrorToastButton />
                  <WarningToastButton />
                  <InfoToastButton />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Admin Access Test */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Access Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Test if you have admin access to the admin panel.
            </p>
            <div className="flex gap-2">
              <Link href="/admin">
                <Button variant="outline">
                  Test Admin Panel Access
                </Button>
              </Link>
              <AdminOnly>
                <Button className="bg-green-600 hover:bg-green-700">
                  ✅ You have admin access!
                </Button>
              </AdminOnly>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Debug Instructions</h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            <li>Open browser developer tools (F12)</li>
            <li>Go to the Console tab</li>
            <li>Look for logs starting with "Initializing auth check", "Fetching user profile", etc.</li>
            <li>If you see repeated logs, there might still be an infinite loop</li>
            <li>Check the Network tab to see if API calls are being repeated</li>
            <li>Test admin panel access using the button above</li>
            <li>Test toaster notifications using the toaster test section above</li>
          </ul>
        </div>
      </div>
    </AdminOnly>
  )
} 