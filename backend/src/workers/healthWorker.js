const cron = require('node-cron');
const NetworkHealthEngine = require('../services/NetworkHealthEngine');
const logger = require('../utils/logger');

// Run every 5 minutes
const start = () => {
  cron.schedule('*/5 * * * *', async () => {
    logger.info('⚙️  [HealthWorker] Recalculating network health scores...');
    try {
      const count = await NetworkHealthEngine.recalculateAll();
      logger.info(`⚙️  [HealthWorker] Done. Processed ${count} cells.`);
    } catch (err) {
      logger.error(`[HealthWorker] Error: ${err.message}`);
    }
  });
  logger.info('⚙️  HealthWorker scheduled (every 5 min)');
};

module.exports = { start };
