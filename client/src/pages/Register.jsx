import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/input'
import {
  ArrowLeft,
  Tractor,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
/* eslint-disable-next-line no-unused-vars -- motion used in JSX */
import { motion } from 'framer-motion'
import { apiRequest, API_ENDPOINTS, setToken } from '../config/api'

// 👉 Change path if needed
import bgImage from '../assets/reg.jpeg'

export function RegisterPage() {
  const navigate = useNavigate()
  const [role, setRole] = useState('Farmer')
  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [passwordErrors, setPasswordErrors] = useState([])

  const handleRegister = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setPasswordErrors([])

    try {
      const data = await apiRequest(API_ENDPOINTS.auth.register, {
        method: 'POST',
        body: JSON.stringify({
          username,
          email,
          password,
          role,
        }),
      })

      if (data.token) {
        setToken(data.token)
      }

      navigate('/login', {
        state: { message: 'Account created. Please check your email to verify your account, then log in.' },
      })
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.')

      if (error.data && error.data.requirements) {
        setPasswordErrors(error.data.requirements)
      }
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

      {/* Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-black/70 via-black/40 to-black/70" />

      {/* Back Button */}
      <Link
        to="/login"
        className="absolute top-6 left-6 flex items-center gap-2 text-white/80 hover:text-white z-10"
      >
        <ArrowLeft size={18} />
        Back
      </Link>

      {/* Glass Register Card */}
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="relative w-full max-w-md p-8 rounded-3xl
                   bg-white/10 backdrop-blur-2xl
                   border border-white/20
                   shadow-2xl
                   text-white"
      >
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold">Create Account</h1>
          <p className="text-sm text-white/80">
            Join our agricultural community
          </p>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            type="button"
            onClick={() => setRole('Farmer')}
            className={`p-4 rounded-xl border text-sm flex flex-col items-center gap-1 transition
              ${
                role === 'Farmer'
                  ? 'bg-green-600/80 border-green-400 text-white'
                  : 'border-white/20 bg-white/5 hover:bg-white/10'
              }`}
          >
            <Tractor size={22} />
            I&apos;m a Farmer
          </button>

          <button
            type="button"
            onClick={() => setRole('Expert')}
            className={`p-4 rounded-xl border text-sm flex flex-col items-center gap-1 transition
              ${
                role === 'Expert'
                  ? 'bg-blue-600/80 border-blue-400 text-white'
                  : 'border-white/20 bg-white/5 hover:bg-white/10'
              }`}
          >
            <GraduationCap size={22} />
            I&apos;m an Expert
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex gap-2 p-3 mb-4 rounded-lg bg-red-500/20 border border-red-400/30">
            <AlertCircle className="w-4 h-4 mt-0.5" />
            <div className="text-xs">
              <p>{error}</p>
              {passwordErrors.length > 0 && (
                <ul className="mt-1 space-y-1">
                  {passwordErrors.map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

      
        <form onSubmit={handleRegister} className="space-y-4">

          <Input
            label="Username"
            placeholder="Huey"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="Huey@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Password Requirements */}
          <div className="text-xs text-white/80 bg-white/5 border border-white/10 rounded-lg p-3">
            <p className="mb-1 font-medium">Password must contain:</p>
            <ul className="space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={12} /> At least 12 characters
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={12} /> Uppercase & lowercase letter
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={12} /> Number & special character
              </li>
            </ul>
          </div>

          <Button type="submit" fullWidth isLoading={isLoading}>
            Create Account
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-white/80 mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-green-400 font-semibold hover:underline"
          >
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
