import { RrCalendarDay } from 'icons/rr/fi-rr-calendar-day'
import { useState } from 'react'
import { formatMMDDYY } from 'ui/date-utils'
import { Popover, PopoverContent, PopoverTrigger } from 'ui/interactive/popover'
import { Calendar } from 'ui/utils/calendar'
import { Button } from '../basic/button'

export function DatePicker() {
  const [date, setDate] = useState<Date>()

  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-60 justify-start text-left font-normal">
            <RrCalendarDay className="mr-2 size-4 text-gray-700" />
            {date ? formatMMDDYY(date) : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar selected={date} onSelect={setDate} />
        </PopoverContent>
      </Popover>
    </div>
  )
}
