const listeners = new Map()

export function useEventBus() {
  function on(event, handler) {
    if (!listeners.has(event)) listeners.set(event, [])
    listeners.get(event).push(handler)
  }

  function off(event, handler) {
    if (!listeners.has(event)) return
    listeners.set(event, listeners.get(event).filter(h => h !== handler))
  }

  function emit(event, payload) {
    if (!listeners.has(event)) return
    for (const handler of listeners.get(event)) handler(payload)
  }

  return { on, off, emit }
}
