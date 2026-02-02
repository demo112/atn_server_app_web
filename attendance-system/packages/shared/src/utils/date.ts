export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDate(str: string): Date {
  return new Date(str);
}

export function calculateWorkHours(
  clockIn: Date, 
  clockOut: Date, 
  breakMinutes: number = 60
): number {
  const diffMs = clockOut.getTime() - clockIn.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const breakHours = breakMinutes / 60;
  return Math.max(0, diffHours - breakHours);
}
