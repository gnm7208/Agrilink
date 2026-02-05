import React, { useState } from 'react'
import { Search } from 'lucide-react'
import { motion } from 'framer-motion'
import ExpertCard from '../components/ExpertCard'
import { experts } from '../data/mockData'

export function CommunitiesPage() {
  const [activeTab, setActiveTab] = useState('experts')

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          'url(https://images.unsplash.com/photo-1500382017468-9049fed747ef)',
      }}
    >
      {/* Overlay */}
      <div className="min-h-screen bg-black/40 backdrop-blur-sm pb-24">
        {/* CONTENT WRAPPER */}
        <div className="w-full pt-6">
          {/* This is the magic container */}
          <div className="mx-auto px-4 lg:px-8 max-w-2xl lg:ml-[320px]">
            
            {/* HEADER */}
            <div className="mb-6">
              <h1 className="text-xl font-bold text-white mb-4">
                Discover
              </h1>

              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50"
                />
                <input
                  placeholder="Search experts, topics, or communities..."
                  className="w-full rounded-xl bg-white/10 backdrop-blur-xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/40"
                />
              </div>
            </div>

            {/* TABS */}
            <div className="flex bg-white/10 backdrop-blur-xl rounded-xl p-1 mb-6">
              <button
                onClick={() => setActiveTab('experts')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
                  activeTab === 'experts'
                    ? 'bg-green-600 text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Experts
              </button>

              <button
                onClick={() => setActiveTab('communities')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
                  activeTab === 'communities'
                    ? 'bg-green-600 text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Communities
              </button>
            </div>

            {/* CONTENT */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {activeTab === 'experts' &&
                experts.map((expert) => (
                  <ExpertCard
                    key={expert.id}
                    {...expert}
                    glass
                  />
                ))}

              {activeTab === 'communities' && (
                <div className="text-center py-20">
                  <p className="text-white/70 text-lg">
                    Communities launching soon 🌱
                  </p>
                  <p className="text-white/40 text-sm mt-2 max-w-sm mx-auto">
                    Spaces for farmers, cooperatives, and experts to grow
                    together.
                  </p>
                </div>
              )}
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  )
}
