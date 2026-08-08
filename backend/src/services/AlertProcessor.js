const Alert = require('../models/Alert');
const Outage = require('../models/Outage');
const User = require('../models/User');
const { sendEmail, sendSMS } = require('./NotificationService');
const logger = require('../utils/logger');

async function processAll() {
  try {
    // Find outages updated in the last 10 minutes
    const since = new Date(Date.now() - 10 * 60 * 1000);
    const recentOutages = await Outage.find({
      lastUpdatedAt: { $gte: since },
      status: { $in: ['possible', 'confirmed_community'] },
    }).populate('networkId');

    for (const outage of recentOutages) {
      // Find active alerts matching this network and nearby gridCell
      const alerts = await Alert.find({
        networkId: outage.networkId._id,
        active: true,
        $or: [
          { gridCellId: outage.gridCellId },
          { gridCellId: null }, // catch-all alerts
        ],
      }).populate('userId');

      for (const alert of alerts) {
        // Skip if notified in the last 30 minutes for this outage
        if (alert.lastNotifiedAt && Date.now() - alert.lastNotifiedAt < 30 * 60 * 1000) continue;

        const user = alert.userId;
        if (!user) continue;

        const statusLabel = outage.status === 'confirmed_community' ? 'Confirmed outage' : 'Possible outage';
        const message = `NetworkRadar Alert: ${statusLabel} detected on ${outage.networkId.name} around ${outage.area || outage.gridCellId}. Confidence: ${outage.confidence}.`;

        if (user.notificationPreferences?.email) {
          await sendEmail(user.email, `NetworkRadar: ${outage.networkId.name} Alert`, message);
        }
        if (user.notificationPreferences?.sms && user.phone) {
          await sendSMS(user.phone, message);
        }

        alert.lastNotifiedAt = new Date();
        await alert.save();
      }
    }

    // Process resolved outages — send recovery notifications
    const resolvedOutages = await Outage.find({
      resolvedAt: { $gte: since },
      status: 'resolved',
    }).populate('networkId');

    for (const outage of resolvedOutages) {
      const alerts = await Alert.find({
        networkId: outage.networkId._id,
        active: true,
        alertType: { $in: ['outage', 'recovery'] },
      }).populate('userId');

      for (const alert of alerts) {
        const user = alert.userId;
        if (!user) continue;
        const message = `NetworkRadar: ${outage.networkId.name} service around ${outage.area || outage.gridCellId} appears to have recovered.`;
        if (user.notificationPreferences?.email) {
          await sendEmail(user.email, `NetworkRadar: ${outage.networkId.name} Recovered`, message);
        }
      }
    }
  } catch (err) {
    logger.error(`AlertProcessor.processAll error: ${err.message}`);
  }
}

module.exports = { processAll };
