import { RrComputer } from 'icons/rr/fi-rr-computer'
import { RrMobileNotch } from 'icons/rr/fi-rr-mobile-notch'
import { RrSignInAlt } from 'icons/rr/fi-rr-sign-in-alt'
import { useEffect, useMemo, useState } from 'react'
import { Button } from 'ui/basic/button'

function isMobileDevice(): boolean {
  const viewportWidth = Math.min(window.innerWidth, window.screen.width)
  return viewportWidth < 768 // Common breakpoint for tablets
}

const ignoreWarningKey = 'z_ss-ignore'

export function SmallScreenWarning() {
  const smallScreen = useMemo(() => {
    return new URLSearchParams(window.location.search).get('ss')
  }, [])

  const [isMobile, setIsMobile] = useState(false)
  const [ignore, setIgnore] = useState(sessionStorage.getItem(ignoreWarningKey) != null)

  useEffect(() => {
    function checkIfMobile() {
      setIsMobile(isMobileDevice())
    }

    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)

    return () => {
      window.removeEventListener('resize', checkIfMobile)
    }
  }, [])

  function continueAnyway() {
    setIgnore(true)
    sessionStorage.setItem(ignoreWarningKey, 'true')
  }

  if (ignore || smallScreen != null || !isMobile) return null

  return (
    <div className="background fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center p-6 text-gray-900">
      <div className="foreground w-full max-w-md rounded-xl p-8 shadow-lg">
        <div className="flex flex-col items-center">
          <div className="rounded-full bg-green-100 p-4">
            <RrComputer className="size-10 text-green-500" />
          </div>
          <p className="mt-2 text-sm text-gray-500">Recommended</p>
        </div>

        <h1 className="mb-2 text-center text-2xl font-semibold">Desktop Only</h1>

        <p className="mb-6 text-center text-gray-600">
          This website is optimized for desktop & tablet experience only. Please visit us using a tablet, laptop or
          desktop.
        </p>

        <div className="mb-8 flex items-center justify-center gap-2 space-x-4">
          <div className="rounded-full bg-red-100 p-3">
            <RrMobileNotch className="size-6 text-red-400" />
          </div>
          <p className="mt-2 text-sm text-gray-500">Not Supported</p>
        </div>

        <Button className="w-full" onClick={continueAnyway}>
          <RrSignInAlt className="mr-2 size-4" />
          Continue Anyway
        </Button>

        <p className="mt-4 text-center text-xs text-gray-500">
          Note: The site may not function or display correctly on mobile devices.
        </p>
      </div>
    </div>
  )
}
