import React from 'react'
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'

import  BottomNav  from './components/BottomNav'
import  SideNav  from './components/SideNav'

import { LoginPage } from './pages/Login'
import { RegisterPage } from './pages/Register'
import { HomeFeed } from './pages/Home'
import { PostDetails } from './pages/PostDetails'
import { CreatePost } from './pages/Createpost'
import { ProfilePage } from './pages/Profile'
import { CommunitiesPage } from './pages/Communites'
import { MessagesList } from './pages/Messages'
import  {ChatInterface}  from './pages/Chatinterface'


function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
     
      <SideNav />

      
      <main className="flex-1 lg:ml-64 min-h-screen relative">
        <div className="max-w-md mx-auto lg:max-w-2xl xl:max-w-3xl w-full pb-20 lg:pb-8 lg:pt-6">
          <Outlet />
        </div>
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
          <Route path="/post/:id" element={<PostDetails />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/chat/:id" element={<ChatInterface />} />
        </Route>

        <Route element={<MainLayout />}>
          <Route path="/" element={<HomeFeed />} />
          <Route path="/communities" element={<CommunitiesPage />} />
          <Route path="/messages" element={<MessagesList />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </Router>
  )
}
