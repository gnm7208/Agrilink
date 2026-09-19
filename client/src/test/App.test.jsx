import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders } from './renderWithProviders'
import { App } from '../App'

// Mock AuthProvider
vi.mock('../context/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  AuthContext: {
    Provider: ({ children }) => children,
  },
}))

// Components consume auth via the useAuth hook - stub a logged-out state
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    refreshUser: vi.fn(),
    logout: vi.fn(),
  }),
}))

describe('App', () => {
  it('renders without crashing', () => {
    // App brings its own Router; renderWithProviders supplies the same
    // provider tree main.jsx wraps it in (query client, theme, auth, outbox)
    renderWithProviders(<App />)
    // Basic smoke test - just verify it renders
    expect(document.body).toBeTruthy()
  })
})
