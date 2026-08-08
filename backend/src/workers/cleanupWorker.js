const cron = require('node-cron');
const Measurement = require('../models/Measurement');
const ScoringConfig = require('../models/ScoringConfig');
const logger = require('../utils/logger');

// Run every night at 2am
const start = () => {
  cron.schedule('0 2 * * *', async () => {
    logger.info('[CleanupWorker] Starting data cleanup...');
    try {
      let config = await ScoringConfig.findOne();
      const retentionDays = config?.dataRetentionDays || 90;
      const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
      const result = await Measurement.deleteMany({ timestamp: { $lt: cutoff } });
      logger.info(`[CleanupWorker] Deleted ${result.deletedCount} old measurements (>${retentionDays}d)`);
    } catch (err) {
      logger.error(`[CleanupWorker] Error: ${err.message}`);
    }
  });
  logger.info('⚙️  CleanupWorker scheduled (daily at 2am)');
};

module.exports = { start };
