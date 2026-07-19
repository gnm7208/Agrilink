import React from 'react'
/* eslint-disable-next-line no-unused-vars -- motion used in JSX */
import { motion } from 'framer-motion'

export function Card({
  children,
  className = '',
  noPadding = false,
  surface = true,
  ...props
}) {
  // `surface = false` lets a caller (e.g. a "glass" card over a dark image
  // backdrop) fully own the background/border via className, instead of
  // fighting Card's own bg-white/dark:bg-slate-800 for cascade priority.
  const surfaceClass = surface
    ? 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm'
    : ''
  return (
    <motion.div
      className={`rounded-2xl overflow-hidden ${surfaceClass} ${
        !noPadding ? 'p-4' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}