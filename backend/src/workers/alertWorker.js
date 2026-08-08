const cron = require('node-cron');
const AlertProcessor = require('../services/AlertProcessor');
const logger = require('../utils/logger');

// Run every 5 minutes
const start = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      await AlertProcessor.processAll();
    } catch (err) {
      logger.error(`[AlertWorker] Error: ${err.message}`);
    }
  });
  logger.info('⚙️  AlertWorker scheduled (every 5 min)');
};

module.exports = { start };
