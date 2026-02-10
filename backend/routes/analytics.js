const express = require('express');
const {
  getPnL,
  getCryptoPnL,
  getDailyReport,
  getMonthlyReport,
  getTopTraders,
  getVolumeMetrics,
  getPlatformStats,
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

/**
 * @swagger
 * /api/analytics/pnl:
 *   get:
 *     summary: Get total P&L for user
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User P&L data
 */
router.get('/pnl', getPnL);

/**
 * @swagger
 * /api/analytics/pnl/{cryptoSymbol}:
 *   get:
 *     summary: Get P&L for specific crypto
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cryptoSymbol
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Crypto-specific P&L
 */
router.get('/pnl/:cryptoSymbol', getCryptoPnL);

/**
 * @swagger
 * /api/analytics/daily-report:
 *   get:
 *     summary: Get daily trading report
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Daily report
 */
router.get('/daily-report', getDailyReport);

/**
 * @swagger
 * /api/analytics/monthly-report:
 *   get:
 *     summary: Get monthly trading report
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Monthly report
 */
router.get('/monthly-report', getMonthlyReport);

// Admin routes
/**
 * @swagger
 * /api/analytics/admin/top-traders:
 *   get:
 *     summary: Get top traders (Admin only)
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of top traders
 */
router.get('/admin/top-traders', authorize('admin'), getTopTraders);

/**
 * @swagger
 * /api/analytics/admin/volume:
 *   get:
 *     summary: Get platform volume metrics (Admin only)
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Volume metrics
 */
router.get('/admin/volume', authorize('admin'), getVolumeMetrics);

/**
 * @swagger
 * /api/analytics/admin/stats:
 *   get:
 *     summary: Get platform statistics (Admin only)
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Platform statistics
 */
router.get('/admin/stats', authorize('admin'), getPlatformStats);

module.exports = router;