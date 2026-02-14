import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { LoginPage } from '../pages/Login'

// Mock API
vi.mock('../config/api', () => ({
  apiRequest: vi.fn(),
  API_ENDPOINTS: {
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
    },
  },
}))

// Mock useAuth
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    refreshUser: vi.fn(),
  }),
}))

describe('Auth Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login page', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )
    expect(screen.getByText(/sign in/i)).toBeInTheDocument()
  })

  // Add more auth tests as needed
})
