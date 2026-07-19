import React from 'react'
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom'

import BottomNav from './components/BottomNav'
import SideNav from './components/SideNav'
import { OutboxBanner } from './components/OutboxBanner'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'
import { AdminLayout } from './components/admin/AdminLayout'

import { LoginPage } from './pages/Login'
import { RegisterPage } from './pages/Register'
import { ForgotPasswordPage } from './pages/ForgotPassword'
import { ResetPasswordPage } from './pages/ResetPassword'
import { VerifyEmailPage } from './pages/VerifyEmail'
import { HomeFeed } from './pages/Home'
import { PostDetails } from './pages/PostDetails'
import { CreatePost } from './pages/Createpost'
import { ProfilePage } from './pages/Profile'
import { CommunitiesPage } from './pages/Communites'
import { CommunityDetail } from './pages/CommunityDetail'
import { CommunityChat } from './pages/CommunityChat'
import { MessagesList } from './pages/Messages'
import  {ChatInterface}  from './pages/Chatinterface'
import { MarketPrices } from './pages/MarketPrices'
import { AdminOverview } from './pages/admin/AdminOverview'
import { AdminUsers } from './pages/admin/AdminUsers'
import { AdminUserDetail } from './pages/admin/AdminUserDetail'
import { AdminCommunities } from './pages/admin/AdminCommunities'
import { AdminContent } from './pages/admin/AdminContent'
import { AdminReports } from './pages/admin/AdminReports'
import { AdminAuditLog } from './pages/admin/AdminAuditLog'


function MainLayout() {
  return (
    <div className="flex flex-col h-screen lg:flex-row">
     
      <SideNav />

      
      <main className="flex-1 lg:ml-64 overflow-y-auto pb-16 lg:pb-0">
  <OutboxBanner />
  <Outlet />
</main>

      <BottomNav />
    </div>
  )
}


function FullScreenLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-0 lg:p-4">
      <div className="w-full max-w-md bg-white min-h-screen lg:min-h-0 lg:h-auto lg:rounded-2xl lg:shadow-xl overflow-hidden relative">
        <Outlet />
      </div>
    </div>
  )
}

export function App() {
  return (
    <Router>
      <Routes>
      
        <Route element={<FullScreenLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/post/:id" element={<PostDetails />} />
          <Route path="/create" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
          <Route path="/chat/:userId" element={<ProtectedRoute><ChatInterface /></ProtectedRoute>} />
          <Route path="/communities/:id/chat" element={<ProtectedRoute><CommunityChat /></ProtectedRoute>} />
        </Route>

        <Route element={<MainLayout />}>
          <Route path="/" element={<HomeFeed />} />
          <Route path="/communities" element={<ProtectedRoute><CommunitiesPage /></ProtectedRoute>} />
          <Route path="/communities/:id" element={<ProtectedRoute><CommunityDetail /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><MessagesList /></ProtectedRoute>} />
          <Route path="/market" element={<ProtectedRoute><MarketPrices /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        </Route>

        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:id" element={<AdminUserDetail />} />
          <Route path="communities" element={<AdminCommunities />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="audit-log" element={<AdminAuditLog />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}
