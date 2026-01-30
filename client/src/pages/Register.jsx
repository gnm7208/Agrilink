import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/input'
import { ArrowLeft, Tractor, GraduationCap, AlertCircle, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { apiRequest, API_ENDPOINTS } from '../config/api'

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

      // Registration successful, redirect to login
      navigate('/login', {
        state: { message: 'Account created successfully! Please log in.' }
      })
    } catch (error) {
      // Display error message
      setError(error.message || 'Registration failed. Please try again.')

      // If password requirements weren't met, display them
      if (error.data && error.data.requirements) {
        setPasswordErrors(error.data.requirements)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <Link
        to="/login"
        className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-8"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Login
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm mx-auto space-y-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Account
          </h1>
          <p className="text-gray-500">
            Join our agricultural community.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setRole('Farmer')}
            className={`p-4 rounded-xl border-2 flex flex-col items-center ${
              role === 'Farmer'
                ? 'border-green-600 bg-green-50 text-green-700'
                : 'border-gray-200'
            }`}
          >
            <Tractor size={24} />
            <span>I&apos;m a Farmer</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('Expert')}
            className={`p-4 rounded-xl border-2 flex flex-col items-center ${
              role === 'Expert'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-200'
            }`}
          >
            <GraduationCap size={24} />
            <span>I&apos;m an Expert</span>
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800 font-medium">{error}</p>
                {passwordErrors.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {passwordErrors.map((err, idx) => (
                      <li key={idx} className="text-xs text-red-700 flex items-start gap-1">
                        <span className="text-red-500">•</span>
                        <span>{err}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          <Input
            label="Username"
            placeholder="johndoe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div>
            <Input
              label="Password"
              type="password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="mt-2 p-3 rounded-lg bg-gray-50 border border-gray-200">
              <p className="text-xs font-medium text-gray-700 mb-2">Password requirements:</p>
              <ul className="space-y-1 text-xs text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-gray-400" />
                  At least 12 characters
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-gray-400" />
                  One uppercase and one lowercase letter
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-gray-400" />
                  One number and one special character
                </li>
              </ul>
            </div>
          </div>

          <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
            Create Account
          </Button>
        </form>
      </motion.div>
    </div>
  )
}