const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// IANA timezone for the US Eastern Seaboard
const EASTERN_ZONE = 'America/New_York';

// Utility: produce an ISO-like timestamp *in the given IANA zone* including the numeric offset.
// This uses Intl.DateTimeFormat.formatToParts to get the zone-local components (including fractional seconds),
// then computes the offset by comparing the assumed-UTC epoch of that local string to the original UTC epoch.
function toIsoWithOffsetInZone(date, timeZone) {
  // Format parts in the target zone
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
    hour12: false
  });

  const parts = dtf.formatToParts(date).reduce((acc, p) => {
    if (p.type !== 'literal') acc[p.type] = p.value;
    return acc;
  }, {});

  // Build local ISO-like datetime (no timezone)
  // parts.month, parts.day, parts.hour, parts.minute, parts.second are zero-padded by Intl
  // fractionalSecond may be missing in very old runtimes; default to "000" if absent
  const frac = parts.fractionalSecond ?? '000';
  const localIso = `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}.${frac}`;

  // Compute offset:
  // Interpret localIso as if it were UTC by appending "Z" and turning it into epoch ms,
  // then compare with the real UTC epoch of the original date to determine how many minutes the zone differs.
  const assumedUtcMs = new Date(localIso + 'Z').getTime();
  const actualUtcMs = date.getTime();
  // offsetMinutes = (assumedUtc - actualUtc) / 60000
  const offsetMinutes = Math.round((assumedUtcMs - actualUtcMs) / 60000);

  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absMin = Math.abs(offsetMinutes);
  const hh = String(Math.floor(absMin / 60)).padStart(2, '0');
  const mm = String(absMin % 60).padStart(2, '0');

  return `${localIso}${sign}${hh}:${mm}`;
}

// Serve static files from public directory
app.use(express.static('public'));

// Basic route: timestamp only shown in US Eastern (America/New_York)
app.get('/api/status', (req, res) => {
  const nowUtc = new Date(); // created in UTC
  const easternIso = toIsoWithOffsetInZone(nowUtc, EASTERN_ZONE);

  res.json({
    status: 'running',
    message: 'Docker containerization successful!',
    // timestamp is guaranteed to be the Eastern seaboard local time (ISO-like with numeric offset)
    timestamp: easternIso,
    port: PORT
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Application successfully containerized with Docker!');
});
