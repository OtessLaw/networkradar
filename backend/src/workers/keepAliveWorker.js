const cron = require('node-cron');
const https = require('https');
const http = require('http');

/**
 * Self-ping worker to prevent Render free instance from sleeping
 * Pings every 14 minutes (Render sleeps after 15 minutes of inactivity)
 */
const startKeepAliveWorker = () => {
  cron.schedule('*/14 * * * *', () => {
    const renderUrl = process.env.RENDER_EXTERNAL_URL;
    const localPort = process.env.PORT || 5005;
    const targetUrl = renderUrl ? `${renderUrl.replace(/\/$/, '')}/api/health/ping` : `http://localhost:${localPort}/api/health/ping`;

    const client = targetUrl.startsWith('https') ? https : http;

    client.get(targetUrl, (res) => {
      console.log(`⏰ Render Keep-Alive Self-Ping: status ${res.statusCode}`);
    }).on('error', (err) => {
      console.warn(`⚠️ Keep-Alive Self-Ping error: ${err.message}`);
    });
  });

  console.log('🚀 Render Keep-Alive worker initialized (14-minute interval)');
};

module.exports = startKeepAliveWorker;
