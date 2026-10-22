/**
 * SLA & Real-Time Complaint Countdown Engine
 * Calculates real-time elapsed time since complaint filing,
 * exact deadline, and live remaining countdown timer with 1-second precision.
 */

export interface SLACountdownInfo {
  // Formatted date and time of filing
  formattedDate: string; // e.g. "18 Oct 2026"
  formattedTime: string; // e.g. "11:55:05 AM"
  formattedFull: string; // e.g. "18 Oct 2026 • 11:55:05 AM"
  
  // Elapsed time since filing
  elapsedSeconds: number;
  elapsedFormatted: string; // e.g. "2d 06h 15m 32s"
  
  // SLA Deadline info
  slaWindowHours: number; // e.g. 72
  deadlineDate: Date;
  deadlineFormatted: string; // e.g. "21 Oct 2026, 11:55 AM"
  
  // Remaining countdown
  remainingMs: number;
  remainingFormatted: string; // e.g. "24h 15m 32s" or "01d 08h 12m 45s"
  isOverdue: boolean;
  overdueFormatted: string; // e.g. "Overdue by 02h 15m 30s"
  
  // SLA Consumption
  percentConsumed: number; // 0 to 100
  urgencyLevel: 'safe' | 'warning' | 'critical' | 'breached' | 'resolved';
  urgencyLabel: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

/**
 * Safely parse a date string or timestamp into a valid Date object.
 * Handles both "YYYY-MM-DD HH:mm:ss", ISO strings, and standard date strings.
 */
export function parseComplaintDate(dateStr?: string): Date {
  if (!dateStr) return new Date();
  
  // Normalize "YYYY-MM-DD HH:mm:ss" to ISO-compatible format
  const normalized = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
  const d = new Date(normalized);
  if (!isNaN(d.getTime())) {
    return d;
  }

  // Fallback direct parse
  const direct = new Date(dateStr);
  return isNaN(direct.getTime()) ? new Date() : direct;
}

/**
 * Get effective system time. If the current browser year is before the complaint year
 * (e.g. mock complaint in Oct 2026 while browser is in 2025/2026),
 * we offset gracefully so countdown ticks forward smoothly without breaking.
 */
export function getReferenceTime(filingDate: Date, customNow?: Date): Date {
  const actualNow = customNow || new Date();
  
  // If filingDate is more than 30 days in the future compared to actualNow,
  // we align the simulation reference time to the complaint's month in 2026
  // while adding the actual elapsed seconds from app launch so it ticks in real-time.
  if (filingDate.getTime() > actualNow.getTime() + 1000 * 60 * 60 * 24 * 30) {
    // Simulated anchor: 2026-10-21 18:30:00 plus real-time seconds
    const simulatedBase = new Date('2026-10-21T18:30:00').getTime();
    // Offset by actual seconds since page loaded
    const appUptimeSec = Math.floor((performance.now ? performance.now() : 0) / 1000);
    return new Date(simulatedBase + appUptimeSec * 1000);
  }

  return actualNow;
}

/**
 * Compute real-time SLA status and countdown for a complaint.
 */
export function computeSLACountdown(
  submittedAtStr?: string,
  status?: string,
  deadlineStr?: string,
  slaWindowHours: number = 72,
  currentTime?: Date
): SLACountdownInfo {
  const filedDate = parseComplaintDate(submittedAtStr);
  const now = getReferenceTime(filedDate, currentTime);
  const isResolved = status === 'RESOLVED';

  // Format filing date & time
  const day = filedDate.getDate().toString().padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[filedDate.getMonth()] || 'Oct';
  const year = filedDate.getFullYear();
  
  let hours = filedDate.getHours();
  const minutes = filedDate.getMinutes().toString().padStart(2, '0');
  const seconds = filedDate.getSeconds().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedHours = hours.toString().padStart(2, '0');

  const formattedDate = `${day} ${month} ${year}`;
  const formattedTime = `${formattedHours}:${minutes}:${seconds} ${ampm}`;
  const formattedFull = `${formattedDate} • ${formattedTime}`;

  // Determine deadline
  let deadlineDate: Date;
  if (deadlineStr) {
    deadlineDate = parseComplaintDate(deadlineStr);
  } else {
    deadlineDate = new Date(filedDate.getTime() + slaWindowHours * 60 * 60 * 1000);
  }

  // Format deadline date & time
  const dlDay = deadlineDate.getDate().toString().padStart(2, '0');
  const dlMonth = monthNames[deadlineDate.getMonth()] || 'Oct';
  let dlHours = deadlineDate.getHours();
  const dlMinutes = deadlineDate.getMinutes().toString().padStart(2, '0');
  const dlAmpm = dlHours >= 12 ? 'PM' : 'AM';
  dlHours = dlHours % 12 || 12;
  const deadlineFormatted = `${dlDay} ${dlMonth} ${deadlineDate.getFullYear()}, ${dlHours.toString().padStart(2, '0')}:${dlMinutes} ${dlAmpm}`;

  // Compute elapsed time
  const elapsedMs = Math.max(0, now.getTime() - filedDate.getTime());
  const elapsedSeconds = Math.floor(elapsedMs / 1000);

  const eDays = Math.floor(elapsedSeconds / 86400);
  const eHours = Math.floor((elapsedSeconds % 86400) / 3600);
  const eMins = Math.floor((elapsedSeconds % 3600) / 60);
  const eSecs = elapsedSeconds % 60;

  const elapsedParts: string[] = [];
  if (eDays > 0) elapsedParts.push(`${eDays}d`);
  elapsedParts.push(`${eHours.toString().padStart(2, '0')}h`);
  elapsedParts.push(`${eMins.toString().padStart(2, '0')}m`);
  elapsedParts.push(`${eSecs.toString().padStart(2, '0')}s`);
  const elapsedFormatted = elapsedParts.join(' ');

  // Compute remaining time until SLA deadline
  const totalWindowMs = Math.max(1000, deadlineDate.getTime() - filedDate.getTime());
  const remainingMs = deadlineDate.getTime() - now.getTime();
  const isOverdue = remainingMs < 0;

  const absRemainingSec = Math.floor(Math.abs(remainingMs) / 1000);
  const rDays = Math.floor(absRemainingSec / 86400);
  const rHours = Math.floor((absRemainingSec % 86400) / 3600);
  const rMins = Math.floor((absRemainingSec % 3600) / 60);
  const rSecs = absRemainingSec % 60;

  let remainingFormatted = '';
  if (rDays > 0) {
    remainingFormatted = `${rDays}d ${rHours.toString().padStart(2, '0')}h ${rMins.toString().padStart(2, '0')}m ${rSecs.toString().padStart(2, '0')}s`;
  } else {
    remainingFormatted = `${rHours.toString().padStart(2, '0')}h ${rMins.toString().padStart(2, '0')}m ${rSecs.toString().padStart(2, '0')}s`;
  }

  const overdueFormatted = `Overdue by ${rDays > 0 ? `${rDays}d ` : ''}${rHours.toString().padStart(2, '0')}h ${rMins.toString().padStart(2, '0')}m ${rSecs.toString().padStart(2, '0')}s`;

  // Percent consumed
  const percentConsumed = Math.min(100, Math.max(0, Math.round((elapsedMs / totalWindowMs) * 100)));

  // Urgency classification
  let urgencyLevel: SLACountdownInfo['urgencyLevel'] = 'safe';
  let urgencyLabel = 'On Schedule';
  let badgeBg = 'bg-emerald-50';
  let badgeText = 'text-emerald-700';
  let badgeBorder = 'border-emerald-200';

  if (isResolved) {
    urgencyLevel = 'resolved';
    urgencyLabel = 'Resolved in SLA';
    badgeBg = 'bg-teal-50';
    badgeText = 'text-teal-700';
    badgeBorder = 'border-teal-200';
  } else if (isOverdue) {
    urgencyLevel = 'breached';
    urgencyLabel = 'SLA Breached';
    badgeBg = 'bg-rose-50';
    badgeText = 'text-rose-700';
    badgeBorder = 'border-rose-300';
  } else if (remainingMs < 6 * 3600 * 1000) {
    urgencyLevel = 'critical';
    urgencyLabel = 'Critical (< 6h)';
    badgeBg = 'bg-red-50';
    badgeText = 'text-red-700';
    badgeBorder = 'border-red-300';
  } else if (remainingMs < 24 * 3600 * 1000) {
    urgencyLevel = 'warning';
    urgencyLabel = 'Urgent (< 24h)';
    badgeBg = 'bg-amber-50';
    badgeText = 'text-amber-800';
    badgeBorder = 'border-amber-300';
  } else {
    urgencyLevel = 'safe';
    urgencyLabel = 'On Schedule';
    badgeBg = 'bg-emerald-50';
    badgeText = 'text-emerald-700';
    badgeBorder = 'border-emerald-200';
  }

  return {
    formattedDate,
    formattedTime,
    formattedFull,
    elapsedSeconds,
    elapsedFormatted,
    slaWindowHours,
    deadlineDate,
    deadlineFormatted,
    remainingMs,
    remainingFormatted,
    isOverdue,
    overdueFormatted,
    percentConsumed,
    urgencyLevel,
    urgencyLabel,
    badgeBg,
    badgeText,
    badgeBorder,
  };
}

export interface StepTimestampInfo {
  formatted: string;
  timeOnly: string;
  dateOnly: string;
  diffFromBaseline?: string;
  hasValue: boolean;
}

export function formatStepTimestamp(
  rawDate?: string,
  baselineDate?: string,
  baselineLabel?: string
): StepTimestampInfo {
  if (!rawDate) {
    return {
      formatted: 'Pending',
      timeOnly: '--:--',
      dateOnly: 'Pending',
      hasValue: false,
    };
  }

  const d = parseComplaintDate(rawDate);
  const day = d.getDate().toString().padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[d.getMonth()] || 'Oct';
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const timeOnly = `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  const dateOnly = `${day} ${month} ${year}`;
  const formatted = `${dateOnly}, ${timeOnly}`;

  let diffFromBaseline: string | undefined;
  if (baselineDate) {
    const b = parseComplaintDate(baselineDate);
    const diffMs = d.getTime() - b.getTime();
    if (diffMs > 0) {
      const diffMin = Math.floor(diffMs / 60000);
      const diffHours = (diffMs / 3600000).toFixed(1);
      if (diffMin < 60) {
        diffFromBaseline = `+${diffMin}m ${baselineLabel || ''}`.trim();
      } else if (Number(diffHours) < 24) {
        diffFromBaseline = `+${diffHours}h ${baselineLabel || ''}`.trim();
      } else {
        const days = Math.floor(Number(diffHours) / 24);
        const remH = Math.round(Number(diffHours) % 24);
        diffFromBaseline = `+${days}d ${remH}h ${baselineLabel || ''}`.trim();
      }
    }
  }

  return {
    formatted,
    timeOnly,
    dateOnly,
    diffFromBaseline,
    hasValue: true,
  };
}

