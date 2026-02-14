import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { App } from '../App'

// Mock AuthProvider
vi.mock('../context/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  AuthContext: {
    Provider: ({ children }) => children,
  },
}))

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    // Basic smoke test - just verify it renders
    expect(document.body).toBeTruthy()
  })
})
