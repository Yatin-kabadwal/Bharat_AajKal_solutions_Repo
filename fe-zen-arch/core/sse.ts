import { useCallback, useEffect, useRef, useState } from 'react'

const retryDelay = 3000
const maxRetries = 3
const connectionTimeout = 15000

interface SSELogsHook {
  endpoint: string
  onMessage: (e: MessageEvent) => void
  onClose?: (e: MessageEvent) => void
  onError?: (error: Error) => void
}

export function useSSE({ endpoint, onMessage, onClose, onError }: SSELogsHook) {
  const [isConnected, setIsConnected] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const eventSourceRef = useRef<EventSource | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearConnection = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const handleError = useCallback((error: Error) => {
    clearConnection()
    setIsConnected(false)
    onError?.(error)
  }, [])

  const setupEventSource = useCallback(() => {
    clearConnection()
    setIsConnected(false)

    const eventSource = new EventSource(endpoint, { withCredentials: true })
    eventSourceRef.current = eventSource

    // Set connection timeout
    timeoutRef.current = setTimeout(() => {
      handleError(new Error('Connection timeout'))
    }, connectionTimeout)

    eventSource.onopen = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      setIsConnected(true)
      setRetryCount(0)
    }

    eventSource.onmessage = onMessage

    eventSource.addEventListener('close', (e) => {
      clearConnection()
      setIsConnected(false)
      onClose?.(e)
    })

    eventSource.onerror = () => {
      if (eventSource.readyState === EventSource.CLOSED) {
        // Server closed the connection (likely task completed)
        clearConnection()
        setIsConnected(false)
        return
      }

      // Connection error - attempt to reconnect
      handleError(new Error('Connection error'))
      if (retryCount < maxRetries) {
        setTimeout(() => {
          setRetryCount((prev) => prev + 1)
          setupEventSource()
        }, retryDelay)
      }
    }

    return () => clearConnection()
  }, [endpoint])

  useEffect(() => {
    setupEventSource()
    return clearConnection
  }, [])

  return { isConnected, retryCount }
}
