// const express = require('express');
// const {
//   createTrade,
//   getTrades,
//   getTrade,
//   updateTrade,
//   deleteTrade,
// } = require('backend/controllers/transactionController');
// const { protect } = require('backend/middleware/auth');
// const { validateTrade } = require('backend/middleware/validation');

// const router = express.Router();

// // Protect all routes
// router.use(protect);

// /**
//  * @swagger
//  * /api/trades:
//  *   post:
//  *     summary: Create a new trade
//  *     tags: [Trades]
//  *     security:
//  *       - BearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               cryptoSymbol:
//  *                 type: string
//  *               type:
//  *                 type: string
//  *                 enum: [BUY, SELL]
//  *               quantity:
//  *                 type: number
//  *               entryPrice:
//  *                 type: number
//  *               tradeDate:
//  *                 type: string
//  *               notes:
//  *                 type: string
//  *     responses:
//  *       201:
//  *         description: Trade created successfully
//  */
// router.post('/', validateTrade, createTrade);

// /**
//  * @swagger
//  * /api/trades:
//  *   get:
//  *     summary: Get all trades for user
//  *     tags: [Trades]
//  *     security:
//  *       - BearerAuth: []
//  *     parameters:
//  *       - in: query
//  *         name: page
//  *         schema:
//  *           type: integer
//  *       - in: query
//  *         name: limit
//  *         schema:
//  *           type: integer
//  *       - in: query
//  *         name: cryptoSymbol
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: List of trades
//  */
// router.get('/', getTrades);

// /**
//  * @swagger
//  * /api/trades/{id}:
//  *   get:
//  *     summary: Get single trade
//  *     tags: [Trades]
//  *     security:
//  *       - BearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Trade details
//  */
// router.get('/:id', getTrade);

// /**
//  * @swagger
//  * /api/trades/{id}:
//  *   put:
//  *     summary: Update trade
//  *     tags: [Trades]
//  *     security:
//  *       - BearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *     responses:
//  *       200:
//  *         description: Trade updated successfully
//  */
// router.put('/:id', updateTrade);

// /**
//  * @swagger
//  * /api/trades/{id}:
//  *   delete:
//  *     summary: Delete trade
//  *     tags: [Trades]
//  *     security:
//  *       - BearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Trade deleted successfully
//  */
// router.delete('/:id', deleteTrade);

// module.exports = router;

const express = require('express');
const { protect } = require('../middleware/auth');

const {
  createTrade,
  getTrades,
  getTrade,
  updateTrade,
  deleteTrade,
} = require('../controllers/tradeController');

const router = express.Router();

/**
 * @swagger
 * /api/trades:
 *   post:
 *     summary: Create a new trade
 *     tags: [Trades]
 *     security:
 *       - BearerAuth: []
 */
router.post('/', protect, createTrade);

/**
 * @swagger
 * /api/trades:
 *   get:
 *     summary: Get all trades
 *     tags: [Trades]
 *     security:
 *       - BearerAuth: []
 */
router.get('/', protect, getTrades);

/**
 * @swagger
 * /api/trades/{id}:
 *   get:
 *     summary: Get trade by ID
 *     tags: [Trades]
 *     security:
 *       - BearerAuth: []
 */
router.get('/:id', protect, getTrade);

/**
 * @swagger
 * /api/trades/{id}:
 *   put:
 *     summary: Update trade
 *     tags: [Trades]
 *     security:
 *       - BearerAuth: []
 */
router.put('/:id', protect, updateTrade);

/**
 * @swagger
 * /api/trades/{id}:
 *   delete:
 *     summary: Delete trade
 *     tags: [Trades]
 *     security:
 *       - BearerAuth: []
 */
router.delete('/:id', protect, deleteTrade);

module.exports = router;
