// get exact date of current day [midnight time]
export function getCurrentDay(date?: Date): Date{
    const now = date || new Date();
    const utcDate = new Date(Date.UTC(now.getUTCFullYear(),
      now.getUTCMonth(), now.getUTCDate(), 0, 
      0, 0, 0));
    return utcDate
}