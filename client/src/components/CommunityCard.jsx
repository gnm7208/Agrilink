import { Users } from 'lucide-react'
import { motion } from 'framer-motion'

export default function CommunityCard({
  name,
  category,
  members,
  description,
  avatar,
  isFollowing,
  onToggleFollow,
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="flex gap-4 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-white"
    >
      {/* Avatar */}
      <img
        src={avatar}
        alt={name}
        className="h-12 w-12 rounded-xl object-cover"
      />

      {/* Content */}
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{name}</h3>
          <span className="text-xs bg-green-600/20 text-green-300 px-2 py-0.5 rounded-full">
            {category}
          </span>
        </div>

        <p className="text-sm text-white/70 mt-1 line-clamp-2">
          {description}
        </p>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1 text-xs text-white/60">
            <Users size={14} />
            {members} members
          </div>

          {/* Instagram-style Follow / Following */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onToggleFollow}
            className={`text-xs font-semibold px-4 py-1.5 rounded-lg transition ${
              isFollowing
                ? 'bg-white/20 text-white hover:bg-white/30'
                : 'bg-green-600 hover:bg-green-500 text-white'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
