import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { DashboardSidebar } from './DashboardSidebar'
import { DashboardHeader } from './DashboardHeader'
import { DashboardMobileSidebar } from './DashboardMobileSidebar'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <DashboardSidebar />

        {/* Mobile Sidebar */}
        <DashboardMobileSidebar
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        {/* Main Content */}
        <div className="lg:pl-64">
          <DashboardHeader onMenuClick={() => setMobileMenuOpen(true)} />

          <main className="p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
