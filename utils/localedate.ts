export function toLocalTimeDate(dateStr: string, timeStr: string) {
  const date = new Date(`${dateStr}T${timeStr}:00`);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
}
