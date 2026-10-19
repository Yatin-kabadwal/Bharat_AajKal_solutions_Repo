// Helps to sync data between different browsing contexts (that is, windows, tabs, frames, or iframes)
// and workers on the same origin.

type EventCallback<T = any> = (data: T) => void

interface EventMessage<T = any> {
  type: string
  data?: T
}

const CHANNEL_NAME = 'tab-sync'
const channel: BroadcastChannel = new BroadcastChannel(CHANNEL_NAME)
const listeners = new Map<string, Set<EventCallback>>()

channel.onmessage = handleMessage

function handleMessage(event: MessageEvent<EventMessage>): void {
  const { type, data } = event.data
  const callbacks = listeners.get(type)
  if (callbacks) {
    callbacks.forEach((callback) => callback(data))
  }
}

export function addSyncListener<T = any>(eventName: string, callback: EventCallback<T>): void {
  if (!listeners.has(eventName)) {
    listeners.set(eventName, new Set())
  }
  listeners.get(eventName)!.add(callback)
}

export function removeSyncListener<T = any>(eventName: string, callback: EventCallback<T>): void {
  const callbacks = listeners.get(eventName)
  if (callbacks) {
    callbacks.delete(callback)
    if (callbacks.size === 0) {
      listeners.delete(eventName)
    }
  }
}

export function addSyncEvent<T = any>(eventName: string, data?: T): void {
  const message: EventMessage<T> = { type: eventName, data }
  channel.postMessage(message)
}
