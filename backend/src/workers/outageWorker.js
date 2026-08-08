const cron = require('node-cron');
const OutageDetector = require('../services/OutageDetector');
const logger = require('../utils/logger');

// Run every 2 minutes
const start = () => {
  cron.schedule('*/2 * * * *', async () => {
    try {
      await OutageDetector.detectAll();
    } catch (err) {
      logger.error(`[OutageWorker] Error: ${err.message}`);
    }
  });
  logger.info('⚙️  OutageWorker scheduled (every 2 min)');
};

module.exports = { start };
