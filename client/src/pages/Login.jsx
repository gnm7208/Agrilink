import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/input'
import { Sprout, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { apiRequest, API_ENDPOINTS } from '../config/api'

import bgImage from '../assets/Agriculture Sprayers Market Size, Share, and Growth Analysis 2024-2032.jpeg'

export function LoginPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const data = await apiRequest(API_ENDPOINTS.auth.login, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user))
      }

      navigate('/')
    } catch (error) {
      setError(error.message || 'Invalid email or password')
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

      {/* Glass Login Card */}
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

          <h1 className="text-2xl font-semibold mt-3">Agrilink</h1>
          <p className="text-sm text-white/80">Sign in to your account</p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex gap-2 p-3 mb-4 rounded-lg bg-red-500/20 border border-red-400/30">
            <AlertCircle className="w-4 h-4 mt-0.5" />
            <p className="text-xs">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">

          <Input
            label="Email Address"
            type="email"
            placeholder="farmer@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" fullWidth isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-white/80 mt-6">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="text-green-400 font-semibold hover:underline"
          >
            Create Account
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
