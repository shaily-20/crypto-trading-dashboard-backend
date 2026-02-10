const Transaction = require('../models/transaction');
const User = require('../models/user');
const crypto = require('crypto');

// Create transaction (deposit/withdrawal)
exports.createTransaction = async (req, res) => {
  try {
    const { type, amount, currency, paymentMethod, description, transactionDate } = req.body;

    // Generate unique transaction ID
    const transactionId = `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const transaction = Transaction.createTransaction({
      userId: req.user.id,
      type: type.toUpperCase(),
      amount,
      currency,
      paymentMethod,
      transactionId,
      description,
      transactionDate,
      status: 'PENDING', // Will be updated by admin
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating transaction',
      error: error.message,
    });
  }
};

// Get all transactions for user
exports.getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status } = req.query;

    const { items: transactions, total } = Transaction.findByUserWithFilters(
      req.user.id,
      {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        type,
        status,
      }
    );

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message,
    });
  }
};

// Get current balance
exports.getBalance = async (req, res) => {
  try {
    const transactions = Transaction.findCompletedByUser(req.user.id);

    let balance = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'DEPOSIT') {
        balance += tx.amount;
      } else if (tx.type === 'WITHDRAWAL') {
        balance -= tx.amount;
      }
    });

    // Update user's total balance
    User.updateTotalBalance(req.user.id, balance);

    res.status(200).json({
      success: true,
      balance: parseFloat(balance.toFixed(2)),
      currency: 'USD',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching balance',
      error: error.message,
    });
  }
};

// Get single transaction
exports.getTransaction = async (req, res) => {
  try {
    const transaction = Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    // Verify ownership
    if (transaction.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this transaction',
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction',
      error: error.message,
    });
  }
};

// Update transaction status (Admin only)
exports.updateTransactionStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['PENDING', 'COMPLETED', 'FAILED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const transaction = Transaction.updateStatus(req.params.id, status);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction status updated',
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating transaction',
      error: error.message,
    });
  }
};