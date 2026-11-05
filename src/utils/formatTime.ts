export function formatTime(seconds: number, includeHours: boolean = false): string {
  const isNegative = seconds < 0;
  const absSeconds = Math.abs(Math.floor(seconds));

  const hours = Math.floor(absSeconds / 3600);
  const minutes = Math.floor((absSeconds % 3600) / 60);
  const secs = absSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  const prefix = isNegative ? '-' : '';

  if (hours > 0 || includeHours) {
    return `${prefix}${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
  }
  return `${prefix}${pad(minutes)}:${pad(secs)}`;
}

