import React, { useState } from 'react'
import { Avatar } from './ui/Avatar'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { Users, Award } from 'lucide-react'

const ExpertCard = ({ name, specialty, followers, avatar }) => {
  const [isFollowing, setIsFollowing] = useState(false)

  return (
    <Card className="flex items-center justify-between p-4">
      <div className="flex items-center space-x-4">
        <Avatar src={avatar} fallback={name} size="lg" />

        <div>
          <h3 className="font-bold text-gray-900">{name}</h3>

          <div className="flex items-center text-sm text-gray-500 mb-1">
            <Award size={14} className="mr-1 text-green-600" />
            <span>{specialty}</span>
          </div>

          <div className="flex items-center text-xs text-gray-400">
            <Users size={12} className="mr-1" />
            <span>{followers} followers</span>
          </div>
        </div>
      </div>

      <Button
        variant={isFollowing ? 'outline' : 'primary'}
        size="sm"
        onClick={() => setIsFollowing(!isFollowing)}
        className={isFollowing ? '!bg-transparent' : ''}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </Button>
    </Card>
  )
}

export default ExpertCard