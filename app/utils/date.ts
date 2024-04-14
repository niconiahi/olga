export function getYear(date: Date) {
  return String(date.getUTCFullYear())
}

export function getDay(date: Date) {
  return String(date.getUTCDate()).padStart(2, "0")
}

export function getMonth(date: Date) {
  // it's 0 indexed
  return String(date.getUTCMonth() + 1).padStart(2, "0")
}

export function getIsoString(
  day: number,
  month: number,
  year: number
) {
  return new Date(`${year}-${month}-${day}`).toISOString()
}
