import React from 'react'
/* eslint-disable-next-line no-unused-vars -- motion used in JSX */
import { motion } from 'framer-motion'

export function Card({
  children,
  className = '',
  noPadding = false,
  ...props
}) {
  return (
    <motion.div
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${
        !noPadding ? 'p-4' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}   