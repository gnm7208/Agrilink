import { useState } from 'react'
import { motion as Motion } from 'framer-motion'
import { Users, Award } from 'lucide-react'
import { Avatar } from './ui/Avatar'
import { apiRequest, API_ENDPOINTS } from '../config/api'

export default function ExpertCard({
  id,
  name,
  specialty,
  followers = 0,
  avatar,
  glass = false,
  initiallyFollowing = false,
}) {
  const [isFollowing, setIsFollowing] = useState(initiallyFollowing)
  const [loading, setLoading] = useState(false)

  const toggleFollow = async () => {
    if (!id || loading) return

    setLoading(true)
    try {
      await apiRequest(API_ENDPOINTS.users.follow(id), {
        method: isFollowing ? 'DELETE' : 'POST',
      })
      setIsFollowing((prev) => !prev)
    } catch (error) {
      console.error('Follow toggle failed', error)
    } finally {
      setLoading(false)
    }
  }

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
      <Avatar src={avatar} fallback={name} size="lg" />

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate">{name}</h3>

        <div
          className={`flex items-center gap-1 text-sm ${
            glass ? 'text-white/70' : 'text-gray-500'
          }`}
        >
          <Award size={14} className="text-green-500" />
          {specialty}
        </div>

        <div
          className={`flex items-center gap-1 text-xs mt-1 ${
            glass ? 'text-white/60' : 'text-gray-400'
          }`}
        >
          <Users size={13} />
          {followers} followers
        </div>
      </div>

      <Motion.button
        whileTap={{ scale: 0.95 }}
        disabled={loading}
        onClick={toggleFollow}
        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
          isFollowing
            ? glass
              ? 'bg-white/20 text-white hover:bg-white/30'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            : glass
            ? 'bg-green-600 hover:bg-green-500 text-white'
            : 'bg-green-100 text-green-700 hover:bg-green-200'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </Motion.button>
    </Motion.div>
  )
}
