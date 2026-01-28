import React, { forwardRef } from 'react'

export const Input = forwardRef(
  ({ label, error, className = '', textarea = false, ...props }, ref) => {
    const baseStyles = `
      w-full rounded-xl border bg-white px-4 py-3 text-gray-900 placeholder-gray-400
      focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20
      disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200
      ${
        error
          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
          : 'border-gray-200'
      }
      ${className}
    `

    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="text-sm font-medium text-gray-700 leading-none">
            {label}
          </label>
        )}

        {textarea ? (
          <textarea
            ref={ref}
            className={`${baseStyles} min-h-[120px] resize-y`}
            {...props}
          />
        ) : (
          <input
            ref={ref}
            className={baseStyles}
            {...props}
          />
        )}

        {error && (
          <p className="text-sm text-red-500 animate-in slide-in-from-top-1 fade-in">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'