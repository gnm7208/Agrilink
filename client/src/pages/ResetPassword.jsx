import React, { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/input'
import { Sprout, AlertCircle, CheckCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react'
/* eslint-disable-next-line no-unused-vars -- motion used in JSX */
import { motion } from 'framer-motion'
import { apiRequest, API_ENDPOINTS } from '../config/api'

import bgImage from '../assets/auth-bg.jpeg'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState(false)

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('Invalid password reset link. No token provided.')
        setIsVerifying(false)
        return
      }

      try {
        await apiRequest(API_ENDPOINTS.auth.verifyResetToken(token), {
          method: 'GET',
        })
        setTokenValid(true)
        setIsVerifying(false)
      } catch {
        setError('Invalid or expired password reset link. Please request a new one.')
        setIsVerifying(false)
      }
    }

    verifyToken()
  }, [token])

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Validate password strength (at least 12 chars, uppercase, lowercase, number, special)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/
    if (!passwordRegex.test(password)) {
      setError(
        'Password must be at least 12 characters and include uppercase, lowercase, number, and special character'
      )
      return
    }

    setIsLoading(true)

    try {
      await apiRequest(API_ENDPOINTS.auth.resetPassword, {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      })

      setSuccess(true)
      setPassword('')
      setConfirmPassword('')

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (error) {
      setError(error.message || 'Failed to reset password')
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

          <h1 className="text-2xl font-semibold mt-3">Set New Password</h1>
          <p className="text-sm text-white/80">
            Enter a strong password for your account
          </p>
        </div>

        {/* Verifying Token */}
        {isVerifying ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <div className="w-12 h-12 border-4 border-white/30 border-t-green-400 rounded-full animate-spin mx-auto" />
            <p className="text-white/80 text-sm mt-4">Verifying reset link...</p>
          </motion.div>
        ) : !tokenValid ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="flex gap-2 p-4 rounded-lg bg-red-500/20 border border-red-400/30">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold">Invalid or Expired Link</p>
                <p className="text-white/80 text-xs mt-1">{error}</p>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <Link to="/forgot-password" className="block w-full">
                <Button fullWidth>Request New Reset Link</Button>
              </Link>
              <Link to="/login" className="block w-full">
                <Button fullWidth variant="secondary">
                  Back to Login
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="flex gap-2 p-4 rounded-lg bg-green-500/20 border border-green-400/30">
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold">Password Reset Successful!</p>
                <p className="text-white/80 text-xs mt-1">
                  Your password has been changed. Redirecting to login...
                </p>
              </div>
            </div>

            <Link to="/login" className="block w-full">
              <Button fullWidth>Go to Login</Button>
            </Link>
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
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* Password Field */}
              <div className="relative">
                <Input
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-10 text-white/60 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Confirm Password Field */}
              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-10 text-white/60 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password Requirements */}
              <div className="text-xs text-white/60 space-y-1 p-3 rounded-lg bg-white/5">
                <p className="font-semibold text-white/80">Password must have:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>At least 12 characters</li>
                  <li>One uppercase letter</li>
                  <li>One lowercase letter</li>
                  <li>One number</li>
                  <li>One special character (@$!%*?&)</li>
                </ul>
              </div>

              <Button type="submit" fullWidth isLoading={isLoading}>
                Reset Password
              </Button>
            </form>

            {/* Footer */}
            <div className="pt-4 border-t border-white/10">
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
              >
                <ArrowLeft size={16} />
                Back to login
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
