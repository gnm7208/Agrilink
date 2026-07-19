import { useContext } from 'react'
import { OutboxContext } from '../context/outboxContext'

export function useOutbox() {
  const context = useContext(OutboxContext)
  if (!context) {
    throw new Error('useOutbox must be used within OutboxProvider')
  }
  return context
}
