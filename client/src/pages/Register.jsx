import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { ArrowLeft, Tractor, GraduationCap } from 'lucide-react'
import { motion } from 'framer-motion'

const API_URL = 'BACKEND LINK'

export function RegisterPage() {
  const navigate = useNavigate()
  const [role, setRole] = useState('Farmer')
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      navigate('/login')
    } catch (error) {
      console.error(error.message)
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
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
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

          <Input
            label="Password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
            Create Account
          </Button>
        </form>
      </motion.div>
    </div>
  )
}