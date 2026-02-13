import React from 'react'

export function Avatar({
  src,
  alt,
  fallback = '??', 
  size = 'md',
  className = '',
}) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base',
    xl: 'h-24 w-24 text-xl',
  }

  
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return '??'
    const words = name.trim().split(' ')
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
    return (words[0][0] + words[1][0]).toUpperCase()
  }

  const initials = getInitials(fallback)

  return (
    <div
      className={`relative inline-block rounded-full overflow-hidden bg-gray-100 ${sizes[size]} ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={alt || initials}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-green-100 text-green-800 font-semibold">
          {initials}
        </div>
      )}
    </div>
  )
}
