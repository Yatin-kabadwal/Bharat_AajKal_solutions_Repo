import { RrAngleSmallLeft } from 'icons/rr/fi-rr-angle-small-left'
import { RrAngleSmallRight } from 'icons/rr/fi-rr-angle-small-right'
import { createContext, useCallback, useMemo, useState } from 'react'
import { Button } from 'ui/basic/button'
import { formatMonth, getDaysInMonth, getFirstDayOfMonth } from 'ui/date-utils'
import { clsxJoin, getContext } from 'ui/utils'

interface CalendarContextData {
  currentDate: Date
  selectedDate?: Date
  monthData: {
    date: Date
    isCurrentMonth: boolean
  }[]
  setCurrentDate: React.Dispatch<Date>
  setSelectedDate: (date: Date) => void
}

// Context
const CalendarContext = createContext<CalendarContextData | null>(null)

interface CalendarProps {
  selected?: Date
  onSelect?: (value: Date) => void
}

export function Calendar({ selected = new Date(), onSelect }: CalendarProps) {
  return (
    <div className="space-y-1 rounded-md border p-3 shadow-sm">
      <CalendarProvider value={selected} onChange={onSelect}>
        <Header />
        <Grid />
        <Days />
      </CalendarProvider>
    </div>
  )
}

interface CalendarProviderProps {
  children: React.ReactNode
  value?: Date
  onChange?: (value: Date) => void
}

// Provider component
function CalendarProvider({ children, value, onChange }: CalendarProviderProps) {
  const [currentDate, setCurrentDate] = useState<Date>(value ?? new Date())
  const [selectedDate, setSelectedDate] = useState<Date>()

  const monthData = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Previous month days
    const prevMonthDays = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate()
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthDays - i),
        isCurrentMonth: false
      })
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i),
        isCurrentMonth: true
      })
    }

    // Next month days
    const remainingDays = 42 - days.length // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i),
        isCurrentMonth: false
      })
    }

    return days
  }, [currentDate])

  const contextValue = {
    currentDate,
    selectedDate,
    monthData,
    setCurrentDate,
    setSelectedDate: (date: Date) => {
      setSelectedDate(date)
      onChange?.(date)
    }
  }

  return <CalendarContext.Provider value={contextValue}>{children}</CalendarContext.Provider>
}

type NavDirection = -1 | 1

function Header() {
  const { currentDate, setCurrentDate } = getContext(CalendarContext)

  const navigate = useCallback(
    (direction: NavDirection) => {
      setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + direction)))
    },
    [currentDate, setCurrentDate]
  )

  return (
    <div className="flex items-center justify-between">
      <Button variant="outline" onClick={() => navigate(-1)} size="sm" aria-label="Previous month">
        <RrAngleSmallLeft className="size-4" />
      </Button>
      <div className="text-sm font-semibold">{formatMonth(currentDate)}</div>
      <Button variant="outline" onClick={() => navigate(1)} size="sm" aria-label="Next month">
        <RrAngleSmallRight className="size-4" />
      </Button>
    </div>
  )
}

function Grid() {
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  return (
    <div className="grid grid-cols-7">
      {weekDays.map((day) => (
        <div key={day} className="p-2 text-center text-xs font-medium text-gray-500">
          {day}
        </div>
      ))}
    </div>
  )
}

function Days() {
  const { monthData, selectedDate, setSelectedDate } = getContext(CalendarContext)

  return (
    <div className="grid grid-cols-7 gap-y-1">
      {monthData.map(({ date, isCurrentMonth }, index) => {
        const isSelected = selectedDate?.toDateString() === date.toDateString()
        const isToday = date.toDateString() === new Date().toDateString()

        return (
          <button
            type="button"
            key={index}
            onClick={isCurrentMonth ? () => setSelectedDate(date) : (_) => null}
            className={clsxJoin(
              'relative rounded-md py-1 text-center text-sm',
              !isCurrentMonth && 'text-gray-400',
              !isSelected && isToday && 'bg-gray-50 font-semibold',
              isSelected ? 'bg-primary-500' : 'hover:bg-gray-100'
            )}
            aria-selected={isSelected}
            aria-label={date.toLocaleDateString()}>
            {date.getDate()}
          </button>
        )
      })}
    </div>
  )
}
