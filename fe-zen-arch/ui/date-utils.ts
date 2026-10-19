export function getDaysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

export function getFirstDayOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
}

export function formatMonth(date: Date) {
  return date.toLocaleString('default', { month: 'long', year: 'numeric' })
}

// Format - July 23rd, 2024
export function formatMMDDYY(date: Date) {
  const day = date.getDate()
  const year = date.getFullYear()
  const month = months[date.getMonth()]

  return `${month} ${day}${suffix(day)}, ${year}`
}

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

function suffix(day: number) {
  if (day > 3 && day < 21) return 'th' // Covers 11th to 19th
  switch (day % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}
