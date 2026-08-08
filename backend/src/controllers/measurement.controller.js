const Measurement = require('../models/Measurement');
const Network = require('../models/Network');
const { latLngToGridCell, hashIP } = require('../utils/geo');
const NetworkHealthEngine = require('../services/NetworkHealthEngine');

exports.createMeasurement = async (req, res, next) => {
  try {
    const {
      networkCode,
      latitude,
      longitude,
      downloadSpeed,
      uploadSpeed,
      latency,
      packetLoss,
      connectionSuccess,
      networkType,
      source,
      signalStrength,
      mcc,
      mnc,
    } = req.body;

    const network = await Network.findOne({ code: networkCode.toUpperCase() });
    if (!network) {
      return res.status(404).json({ error: `Network '${networkCode}' not found` });
    }

    // Fuzz location to 500m grid cell — raw GPS NEVER stored
    const { gridCellId, approximateLat, approximateLng } = latLngToGridCell(
      parseFloat(latitude),
      parseFloat(longitude)
    );

    const ipHash = hashIP(req.ip);

    const measurement = await Measurement.create({
      networkId: network._id,
      userId: req.user ? req.user._id : null,
      gridCellId,
      approximateLat,
      approximateLng,
      signalStrength: signalStrength !== undefined ? signalStrength : null,
      networkType: networkType || 'UNKNOWN',
      mcc: mcc || null,
      mnc: mnc || null,
      downloadSpeed: downloadSpeed !== undefined ? parseFloat(downloadSpeed) : null,
      uploadSpeed: uploadSpeed !== undefined ? parseFloat(uploadSpeed) : null,
      latency: latency !== undefined ? parseFloat(latency) : null,
      packetLoss: packetLoss !== undefined ? parseFloat(packetLoss) : null,
      connectionSuccess: Boolean(connectionSuccess),
      source: source || 'web',
      ipHash,
    });

    // Immediately recalculate score for this cell in background
    NetworkHealthEngine.recalculateCell(network._id, gridCellId).catch(() => {});

    res.status(201).json({
      message: 'Measurement recorded successfully',
      measurementId: measurement._id,
      gridCellId,
    });
  } catch (err) {
    next(err);
  }
};
