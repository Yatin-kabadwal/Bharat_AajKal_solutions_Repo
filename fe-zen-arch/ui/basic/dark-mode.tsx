import { RrBrightness } from 'icons/rr/fi-rr-brightness'
import { RrMoon } from 'icons/rr/fi-rr-moon'
import { Button } from 'ui/basic/button'
import { create } from 'zustand'

const DARK_MODE_KEY = 'z-dark'

interface DarkModeState {
  isDarkMode: boolean
  setDarkMode: (mode: boolean) => void
}

const useDarkMode = create<DarkModeState>((set) => {
  const currentMode = getDarkMode()
  applyDarkMode(currentMode)

  return {
    isDarkMode: currentMode,
    setDarkMode: (mode: boolean) => {
      set({ isDarkMode: mode })
      applyDarkMode(mode)
    }
  }
})

function getDarkMode(): boolean {
  const saved = localStorage.getItem(DARK_MODE_KEY)
  if (saved) return saved == 'true'
  // by default if any color mode is not selected, it would be dark mode
  return true
}

function applyDarkMode(isDarkMode: boolean): void {
  if (isDarkMode) {
    document.documentElement.classList.add('dark')
    document.documentElement.style.colorScheme = 'dark'
  } else {
    document.documentElement.classList.remove('dark')
    document.documentElement.style.colorScheme = 'light'
  }
  localStorage.setItem(DARK_MODE_KEY, isDarkMode.toString())
}

export function DarkModeToggle() {
  const { isDarkMode, setDarkMode } = useDarkMode()

  return (
    <Button variant="ghost" size="icon" className="rounded-3xl" onClick={() => setDarkMode(!isDarkMode)}>
      {isDarkMode ? <RrBrightness className="size-4 text-gray-900" /> : <RrMoon className="size-4" />}
    </Button>
  )
}

export function DarkModeToggleFloating() {
  return (
    <div className="fixed right-0 bottom-0 m-4">
      <DarkModeToggle />
    </div>
  )
}
