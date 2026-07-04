import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/input'
import { Sprout, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
/* eslint-disable-next-line no-unused-vars -- motion used in JSX */
import { motion } from 'framer-motion'
import { apiRequest, API_ENDPOINTS } from '../config/api'

import bgImage from '../assets/auth-bg.jpeg'

export function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleRequestReset = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await apiRequest(API_ENDPOINTS.auth.requestPasswordReset, {
        method: 'POST',
        body: JSON.stringify({ email }),
      })

      setSuccess(true)
      setEmail('')
    } catch (error) {
      setError(error.message || 'Failed to send reset email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      />

      {/* Dark Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-black/70 via-black/40 to-black/70" />

      {/* Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="relative w-full max-w-sm p-8 rounded-3xl 
                   bg-white/10 backdrop-blur-2xl 
                   border border-white/20 
                   shadow-2xl 
                   text-white"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-2xl bg-green-600 text-white shadow-md">
            <Sprout size={26} />
          </div>

          <h1 className="text-2xl font-semibold mt-3">Reset Password</h1>
          <p className="text-sm text-white/80">
            Enter your email to receive a password reset link
          </p>
        </div>

        {/* Success Message */}
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="flex gap-2 p-4 rounded-lg bg-green-500/20 border border-green-400/30">
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold">Email sent successfully!</p>
                <p className="text-white/80 text-xs mt-1">
                  Check your email for a password reset link. The link will expire in 1 hour.
                </p>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <p className="text-xs text-white/70 text-center">Didn't receive the email?</p>
              <button
                onClick={() => {
                  setSuccess(false)
                  setEmail('')
                }}
                className="w-full text-sm text-green-400 hover:text-green-300 font-semibold transition-colors"
              >
                Try another email
              </button>
            </div>

            <div className="pt-4 border-t border-white/10">
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
              >
                <ArrowLeft size={16} />
                Back to login
              </Link>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Error */}
            {error && (
              <div className="flex gap-2 p-3 mb-4 rounded-lg bg-red-500/20 border border-red-400/30">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <p className="text-xs">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleRequestReset} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="farmer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button type="submit" fullWidth isLoading={isLoading}>
                Send Reset Link
              </Button>
            </form>

            {/* Footer */}
            <div className="flex gap-4 pt-4 border-t border-white/10">
              <Link
                to="/login"
                className="flex-1 text-center text-sm text-white/80 hover:text-white transition-colors"
              >
                Back to login
              </Link>
              <span className="text-white/40">•</span>
              <Link
                to="/register"
                className="flex-1 text-center text-sm text-green-400 font-semibold hover:text-green-300 transition-colors"
              >
                Create account
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
