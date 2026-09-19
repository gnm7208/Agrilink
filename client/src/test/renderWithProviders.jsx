import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../context/AuthContext'
import { ThemeProvider } from '../context/ThemeContext'
import { OutboxProvider } from '../context/OutboxContext'

/**
 * Mirrors the provider tree in src/main.jsx so components that rely on
 * app-wide contexts (theme, auth, outbox, react-query) can be rendered in
 * tests. Retries are disabled so failing queries don't hang the test.
 */
export function AllProviders({ children }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <OutboxProvider>{children}</OutboxProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export function renderWithProviders(ui, options) {
  return render(ui, { wrapper: AllProviders, ...options })
}
