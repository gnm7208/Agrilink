import React, { useState } from 'react'
import { Search } from 'lucide-react'
import { motion } from 'framer-motion'
import ExpertCard from '../components/ExpertCard'
import CommunityCard from '../components/CommunityCard'
import { experts, communities } from '../data/mockData'

export function CommunitiesPage() {
  const [activeTab, setActiveTab] = useState('experts')
  const [searchQuery, setSearchQuery] = useState('')

  const [followedExperts, setFollowedExperts] = useState({})
  const [followedCommunities, setFollowedCommunities] = useState({})

  const toggleFollowExpert = (id) => {
    setFollowedExperts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const toggleFollowCommunity = (id) => {
    setFollowedCommunities((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

 
  const query = searchQuery.toLowerCase()

  
  const filteredExperts = experts.filter(
    (expert) =>
      expert.name.toLowerCase().includes(query) ||
      expert.specialty.toLowerCase().includes(query)
  )


  const filteredCommunities = communities.filter(
    (community) =>
      community.name.toLowerCase().includes(query) ||
      community.category.toLowerCase().includes(query) ||
      community.description.toLowerCase().includes(query)
  )

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          'url(https://images.unsplash.com/photo-1500382017468-9049fed747ef)',
      }}
    >
      <div className="min-h-screen bg-black/40 backdrop-blur-sm pb-24 ml-20">
        <div className="w-full pt-10">
          <div className="mx-auto px-7 lg:px-8 max-w-2xl lg:ml-[320px]">
          
            <div className="mb-6">
              <h1 className="text-xl font-bold text-white mb-4 ml-60">
                Discover
              </h1>

              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50"
                />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${
                    activeTab === 'experts'
                      ? 'experts'
                      : 'communities'
                  }...`}
                  className="w-full rounded-xl bg-white/10 backdrop-blur-xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/40"
                />
              </div>
            </div>

           
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

          
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
             
              {activeTab === 'experts' &&
                (filteredExperts.length ? (
                  filteredExperts.map((expert) => (
                    <ExpertCard
                      key={expert.id}
                      {...expert}
                      glass
                      isFollowing={!!followedExperts[expert.id]}
                      onToggleFollow={() =>
                        toggleFollowExpert(expert.id)
                      }
                    />
                  ))
                ) : (
                  <p className="text-center text-white/60 text-sm">
                    No experts found
                  </p>
                ))}

              
              {activeTab === 'communities' &&
                (filteredCommunities.length ? (
                  filteredCommunities.map((community) => (
                    <CommunityCard
                      key={community.id}
                      {...community}
                      isFollowing={!!followedCommunities[community.id]}
                      onToggleFollow={() =>
                        toggleFollowCommunity(community.id)
                      }
                    />
                  ))
                ) : (
                  <p className="text-center text-white/60 text-sm">
                    No communities found
                  </p>
                ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
