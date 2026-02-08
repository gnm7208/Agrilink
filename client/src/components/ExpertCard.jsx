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
    <motion.div
      whileHover={{ y: -2 }}
      className={`${baseStyles} ${
        glass ? glassStyles : solidStyles
      }`}
    >
      <img
        src={avatar}
        alt={name}
        className="h-12 w-12 rounded-xl object-cover"
      />

      <div className="flex-1">
        <h3 className="font-semibold">{name}</h3>
        <p
          className={`text-sm ${
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

      {/* Instagram-style Follow / Following */}
      <motion.button
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
      >
        {isFollowing ? 'Following' : 'Follow'}
      </motion.button>
    </motion.div>
  )
}
