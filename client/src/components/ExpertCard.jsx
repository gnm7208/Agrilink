import React, { useState } from 'react'
import { Avatar } from './ui/Avatar'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { Users, Award } from 'lucide-react'
import { apiRequest, API_ENDPOINTS } from '../config/api'

const ExpertCard = ({ id, name, specialty, followers, avatar, glass }) => {
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleFollowToggle = async () => {
    if (!id || loading) return
    setLoading(true)
    try {
      if (isFollowing) {
        await apiRequest(API_ENDPOINTS.users.follow(id), {
          method: 'DELETE',
        })
      } else {
        await apiRequest(API_ENDPOINTS.users.follow(id), {
          method: 'POST',
        })
      }
      setIsFollowing(!isFollowing)
    } catch {
      // Keep state on error
    } finally {
      setLoading(false)
    }
  }

  const cardClass = glass
    ? 'flex items-center justify-between p-4 bg-white/10 backdrop-blur-xl text-white'
    : 'flex items-center justify-between p-4'

  return (
    <Card className={cardClass}>
      <div className="flex items-center space-x-4">
        <Avatar src={avatar} fallback={name} size="lg" />

        <div>
          <h3 className={`font-bold ${glass ? 'text-white' : 'text-gray-900'}`}>
            {name}
          </h3>

          <div
            className={`flex items-center text-sm mb-1 ${
              glass ? 'text-white/80' : 'text-gray-500'
            }`}
          >
            <Award size={14} className="mr-1 text-green-600" />
            <span>{specialty}</span>
          </div>

          <div
            className={`flex items-center text-xs ${
              glass ? 'text-white/60' : 'text-gray-400'
            }`}
          >
            <Users size={12} className="mr-1" />
            <span>{followers} followers</span>
          </div>
        </div>
      </div>

      <Button
        variant={isFollowing ? 'outline' : 'primary'}
        size="sm"
        onClick={handleFollowToggle}
        disabled={loading}
        className={isFollowing ? '!bg-transparent' : ''}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </Button>
    </Card>
  )
}

export default ExpertCard