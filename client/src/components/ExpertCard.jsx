<<<<<<< HEAD
<<<<<<< HEAD
import React, { useState } from 'react'
=======
import { useState } from 'react'
import { motion as Motion } from 'framer-motion'
import { Users, Award } from 'lucide-react'
>>>>>>> 056910e (solve lint errors)
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
<<<<<<< HEAD
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
=======
      await apiRequest(API_ENDPOINTS.users.follow(id), {
        method: isFollowing ? 'DELETE' : 'POST',
      })
      setIsFollowing((prev) => !prev)
    } catch (error) {
      const msg = (error?.data?.error ?? error?.message ?? '').toLowerCase()
      if (msg.includes('already following')) {
        setIsFollowing(true)
        return
      }
      if (msg.includes('not following')) {
        setIsFollowing(false)
        return
      }
      console.error('Follow toggle failed', error)
>>>>>>> 056910e (solve lint errors)
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
=======
import { Users } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ExpertCard({
  name,
  specialty,
  followers,
  avatar,
  glass = false,
  isFollowing,
  onToggleFollow,
}) {
  const baseStyles =
    'flex items-center gap-4 rounded-2xl p-4 border transition'

  const glassStyles =
    'bg-white/10 backdrop-blur-xl border-white/10 text-white'

  const solidStyles =
    'bg-white border-gray-100 text-gray-900'

  return (
    <Motion.div
      whileHover={{ y: -2 }}
      className={`${baseStyles} ${glass ? glassStyles : solidStyles}`}
    >
<<<<<<< HEAD
      <img
        src={avatar}
        alt={name}
        className="h-12 w-12 rounded-xl object-cover"
      />

      <div className="flex-1">
        <h3 className="font-semibold">{name}</h3>
        <p
          className={`text-sm ${
=======
      <Avatar src={avatar} fallback={name} size="lg" />

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate">{name}</h3>

        <div
          className={`flex items-center gap-1 text-sm ${
>>>>>>> 056910e (solve lint errors)
            glass ? 'text-white/70' : 'text-gray-500'
          }`}
        >
          {specialty}
        </p>

        <div
          className={`flex items-center gap-1 text-xs mt-2 ${
            glass ? 'text-white/60' : 'text-gray-400'
          }`}
        >
          <Users size={14} />
          {followers} followers
        </div>
      </div>

<<<<<<< HEAD
      {/* Instagram-style Follow / Following */}
      <motion.button
=======
      <Motion.button
>>>>>>> 056910e (solve lint errors)
        whileTap={{ scale: 0.95 }}
        onClick={onToggleFollow}
        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
          isFollowing
            ? glass
              ? 'bg-white/20 text-white hover:bg-white/30'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            : glass
            ? 'bg-green-600 hover:bg-green-500 text-white'
            : 'bg-green-100 text-green-700 hover:bg-green-200'
        }`}
>>>>>>> f03fbaf (Modified Community page)
      >
        {isFollowing ? 'Following' : 'Follow'}
      </Motion.button>
    </Motion.div>
  )
}
