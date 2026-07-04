import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
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
    // App brings its own Router; provide the query client it expects from main.jsx
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    )
    // Basic smoke test - just verify it renders
    expect(document.body).toBeTruthy()
  })
})
