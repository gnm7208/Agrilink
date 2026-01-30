import React from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'

  const variants = {
    primary:
      'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm shadow-green-200',
    secondary:
      'bg-amber-100 text-amber-900 hover:bg-amber-200 focus:ring-amber-500',
    outline:
      'border-2 border-green-600 text-green-700 hover:bg-green-50 focus:ring-green-500',
    ghost:
      'text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500',
  }

  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-6 text-base',
    lg: 'h-14 px-8 text-lg',
  }

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </motion.button>
  )
}