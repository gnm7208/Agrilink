import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, ShieldAlert, Trash2 } from 'lucide-react'
import { Button } from './ui/Button'
import { useAuth } from '../hooks/useAuth'

/**
 * "Delete my account" — the one irreversible action on the Profile page.
 * App stores require an in-app deletion path; the password is asked again so
 * an unlocked phone cannot wipe an account in one tap, and the first press only
 * arms the button.
 */
export function DeleteAccountCard() {
  const { deleteAccount } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [armed, setArmed] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    if (!armed) {
      setArmed(true)
      return
    }
    setSubmitting(true)
    try {
      await deleteAccount(password)
      navigate('/login', { replace: true })
    } catch (err) {
      setArmed(false)
      setError(
        err?.status === 403
          ? 'That password is not right.'
          : err?.message || 'Could not delete your account. Check your connection and try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section
      aria-labelledby="delete-account-heading"
      className="rounded-xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-slate-800 p-4"
    >
      <div className="flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 mt-0.5 shrink-0 text-red-600" aria-hidden="true" />
        <div>
          <h3 id="delete-account-heading" className="font-bold text-gray-900 dark:text-gray-100">
            Delete my account
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Permanently removes your profile, posts, comments, messages, market price reports and
            any communities you created. This cannot be undone.
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <label className="block text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-300">Confirm with your password</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              setArmed(false)
            }}
            className="mt-1 w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <div className="flex items-center gap-2">
          <Button
            type="submit"
            variant="outline"
            disabled={submitting || !password}
            className="!border-red-600 !text-red-700 hover:!bg-red-50 dark:hover:!bg-red-950/40"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            )}
            {armed ? 'Yes, delete my account' : 'Delete my account'}
          </Button>
          {armed && !submitting && (
            <Button type="button" variant="ghost" onClick={() => setArmed(false)}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </section>
  )
}
