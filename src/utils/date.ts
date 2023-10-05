// get exact date of current day [midnight time]
export function getCurrentDay(date?: Date): Date{
    const now = date || new Date();
    const utcDate = new Date(Date.UTC(now.getUTCFullYear(),
      now.getUTCMonth(), now.getUTCDate(), 0, 
      0, 0, 0));
    return utcDate
}

export function dateToUTCDate(date?: Date): Date {
  if (!date) date = new Date()
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(),
    date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(),
    date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds()))
  return utcDate
}

export function isEqualDates(date1: Date, date2: Date){
  return date1.getTime() === date2.getTime()
}