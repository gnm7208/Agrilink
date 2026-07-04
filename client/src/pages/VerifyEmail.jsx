import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/input'
import { Sprout, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
/* eslint-disable-next-line no-unused-vars -- motion used in JSX */
import { motion } from 'framer-motion'
import { apiRequest, API_ENDPOINTS } from '../config/api'

import bgImage from '../assets/auth-bg.jpeg'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [isVerifying, setIsVerifying] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [resendEmail, setResendEmail] = useState('')
  const [resendStatus, setResendStatus] = useState('') // 'idle' | 'loading' | 'sent' | 'error'

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('Invalid verification link. No token provided.')
        setIsVerifying(false)
        return
      }

      try {
        await apiRequest(API_ENDPOINTS.auth.verifyEmail, {
          method: 'POST',
          body: JSON.stringify({ token }),
        })
        setSuccess(true)
      } catch {
        setError('Invalid or expired verification link. You can request a new one below.')
      } finally {
        setIsVerifying(false)
      }
    }

    verifyToken()
  }, [token])

  const handleResend = async () => {
    setResendStatus('loading')
    setError('')
    try {
      const body = resendEmail.trim() ? { email: resendEmail.trim().toLowerCase() } : {}
      await apiRequest(API_ENDPOINTS.auth.resendVerification, {
        method: 'POST',
        body: JSON.stringify(body),
      })
      setResendStatus('sent')
    } catch (err) {
      setResendStatus('error')
      setError(err.message || 'Could not send verification email.')
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="fixed inset-0 bg-gradient-to-br from-black/70 via-black/40 to-black/70" />

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
        <div className="text-center mb-6">
          <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-2xl bg-green-600 text-white shadow-md">
            <Sprout size={26} />
          </div>
          <h1 className="text-2xl font-semibold mt-3">Verify your email</h1>
          <p className="text-sm text-white/80">
            We sent you a link to verify your AgriLink account
          </p>
        </div>

        {isVerifying ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <div className="w-12 h-12 border-4 border-white/30 border-t-green-400 rounded-full animate-spin mx-auto" />
            <p className="text-white/80 text-sm mt-4">Verifying your email...</p>
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
                <p className="font-semibold">Email verified successfully</p>
                <p className="text-white/80 text-xs mt-1">
                  You can now sign in and use AgriLink.
                </p>
              </div>
            </div>
            <Link to="/login" className="block w-full">
              <Button fullWidth>Go to Login</Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            {error && (
              <div className="flex gap-2 p-4 rounded-lg bg-red-500/20 border border-red-400/30">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold">Invalid or expired link</p>
                  <p className="text-white/80 text-xs mt-1">{error}</p>
                </div>
              </div>
            )}

            <p className="text-sm text-white/80">
              Request a new verification link (you must be logged in, or we’ll send to the email on file).
            </p>
            <Input
              label="Email (if not logged in)"
              type="email"
              placeholder="you@example.com"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
            />
            <Button
              fullWidth
              onClick={handleResend}
              isLoading={resendStatus === 'loading'}
              disabled={resendStatus === 'loading'}
            >
              {resendStatus === 'sent' ? 'Link sent — check your email' : 'Resend verification email'}
            </Button>
            {resendStatus === 'sent' && (
              <p className="text-xs text-green-400 text-center">Check your inbox and spam folder.</p>
            )}

            <div className="pt-4 border-t border-white/10 space-y-3">
              <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-white/80 hover:text-white transition-colors">
                <ArrowLeft size={16} />
                Back to login
              </Link>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
