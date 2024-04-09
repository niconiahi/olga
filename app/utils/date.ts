export function getDay(date: Date) {
  return date.getUTCDate()
}

export function getMonth(date: Date) {
  // it's 0 indexed
  return date.getUTCMonth() + 1
}

