import { useEffect, useRef, useState } from 'react'
import { clsxJoin } from 'ui/utils'

// TODO: UNUSED COMPONENT

type AnimationDuration = 75 | 100 | 150 | 200 | 300 | 500 | 700 | 1000
type AnimationState = 'visible' | 'hidden'

interface TransitionProps {
  children: React.ReactNode
  className?: string
  show?: boolean
  enterTo?: string
  leaveTo?: string
  duration?: AnimationDuration
}

// Component to control the transition styles of conditionally rendered elements using CSS classes
export function Transition({ show = true, enterTo, leaveTo, duration = 300, className, children }: TransitionProps) {
  const [state, setState] = useState<AnimationState>(show ? 'visible' : 'hidden')
  const [displayNone, setDisplayNone] = useState(!show)
  const initialRender = useRef(true)

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false
      return
    }

    let frameId: number
    let timeout: ReturnType<typeof setTimeout> | undefined
    if (show) {
      setDisplayNone(false)
      // First frame: Apply initial state
      frameId = requestAnimationFrame(() => {
        setState('hidden')
        // Second frame: Start transition to visible
        frameId = requestAnimationFrame(() => {
          setState('visible')
        })
      })
    } else {
      setState('hidden')
      timeout = setTimeout(() => {
        setDisplayNone(true)
      }, duration)
    }

    return () => {
      if (frameId) cancelAnimationFrame(frameId)
      if (timeout) clearTimeout(timeout)
    }
  }, [show])

  return (
    <div
      className={clsxJoin(state === 'visible' ? enterTo : leaveTo, className)}
      style={{
        display: displayNone ? 'none' : undefined,
        transitionDuration: duration.toString() // converts duration in number to string
      }}>
      {children}
    </div>
  )
}
