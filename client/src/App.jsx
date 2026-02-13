import React from 'react'
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom'

import BottomNav from './components/BottomNav'
import SideNav from './components/SideNav'
import { ProtectedRoute } from './components/ProtectedRoute'
import { useAuth } from './context/authContext'

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
import { MessagesList } from './pages/Messages'
import  {ChatInterface}  from './pages/Chatinterface'


function MainLayout() {
  return (
    <div className="min-h-screen bg-black flex flex-col lg:flex-row">
     
      <SideNav />

      
      <main className="flex-1   min-h-screen ">
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

// Redirect authenticated users away from auth pages
function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }
  
  return user ? <Navigate to="/" replace /> : children
}

export function App() {
  return (
    <Router>
      <Routes>
      
        {/* Public routes - redirect to home if already logged in */}
        <Route element={<FullScreenLayout />}>
          <Route path="/login" element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          } />
          <Route path="/register" element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          } />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          
          {/* Protected routes that use full screen layout */}
          <Route path="/post/:id" element={
            <ProtectedRoute>
              <PostDetails />
            </ProtectedRoute>
          } />
          <Route path="/create" element={
            <ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>
          } />
          <Route path="/chat/:id" element={
            <ProtectedRoute>
              <ChatInterface />
            </ProtectedRoute>
          } />
        </Route>

        {/* Protected routes with MainLayout (SideNav + BottomNav) */}
        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="/" element={<HomeFeed />} />
          <Route path="/communities" element={<CommunitiesPage />} />
          <Route path="/messages" element={<MessagesList />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Catch all - redirect to home (which will redirect to login if not authenticated) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}
