const express = require('express');
const {
  createTransaction,
  getTransactions,
  getBalance,
  getTransaction,
  updateTransactionStatus,
} = require('../controllers/transactionController');
const { protect, authorize } = require('../middleware/auth');
const { validateTransaction } = require('../middleware/validation');

const router = express.Router();

// Protect all routes
router.use(protect);

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create transaction (deposit/withdrawal)
 *     tags: [Transactions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [DEPOSIT, WITHDRAWAL]
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *               transactionId:
 *                 type: string
 *               transactionDate:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transaction created
 */
router.post('/', validateTransaction, createTransaction);

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get all transactions
 *     tags: [Transactions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of transactions
 */
router.get('/', getTransactions);

/**
 * @swagger
 * /api/transactions/balance:
 *   get:
 *     summary: Get user account balance
 *     tags: [Transactions]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current balance
 */
router.get('/balance', getBalance);

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Get single transaction
 *     tags: [Transactions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction details
 */
router.get('/:id', getTransaction);

/**
 * @swagger
 * /api/transactions/{id}/status:
 *   patch:
 *     summary: Update transaction status (Admin only)
 *     tags: [Transactions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, COMPLETED, FAILED]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch('/:id/status', authorize('admin'), updateTransactionStatus);

module.exports = router;