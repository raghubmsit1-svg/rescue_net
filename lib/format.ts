export function formatTimeAgo(date: Date): string {
  const sec = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (sec < 60) return 'Just Now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}M Ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}H Ago`;
  return `${Math.floor(hr / 24)}D Ago`;
}

export function formatElapsed(date: Date): string {
  const sec = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')} Elapsed`;
}

export function formatIstClock(date = new Date()): string {
  return (
    date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata',
    }) + ' IST'
  );
}

export function formatRelativeShort(date: Date): string {
  const sec = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

export function remainingDeadmanSec(lastCheckInAt: Date, timeoutSec: number): number {
  const elapsed = Math.floor((Date.now() - lastCheckInAt.getTime()) / 1000);
  return Math.max(0, timeoutSec - elapsed);
}
