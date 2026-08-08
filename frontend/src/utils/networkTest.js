export async function measureLatency(pingUrl = 'http://localhost:5000/api/health/ping') {
  const start = performance.now();
  try {
    await fetch(pingUrl, { cache: 'no-store', mode: 'cors' });
    return Math.round(performance.now() - start);
  } catch {
    return null;
  }
}

export async function measureDownloadSpeed() {
  const BYTES = 5 * 1024 * 1024; // 5MB test
  const start = performance.now();
  try {
    const res = await fetch(`http://localhost:5000/api/health/speed-test`, { cache: 'no-store' });
    const buffer = await res.arrayBuffer();
    const durationSec = (performance.now() - start) / 1000;
    const bitsLoaded = buffer.byteLength * 8;
    return parseFloat((bitsLoaded / durationSec / 1024 / 1024).toFixed(1)); // Mbps
  } catch {
    return null;
  }
}

export async function measurePacketLoss(pingUrl = 'http://localhost:5000/api/health/ping', count = 5) {
  let failures = 0;
  for (let i = 0; i < count; i++) {
    try {
      await fetch(pingUrl, { cache: 'no-store', signal: AbortSignal.timeout(2000) });
    } catch {
      failures++;
    }
  }
  return failures / count;
}

export function detectNetworkType() {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  return conn?.effectiveType?.toUpperCase() || 'UNKNOWN';
}
