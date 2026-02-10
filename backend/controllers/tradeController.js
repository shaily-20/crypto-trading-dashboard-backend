const Trade = require('../models/trade');

// Create a new trade
exports.createTrade = async (req, res) => {
  try {
    const { cryptoSymbol, type, quantity, entryPrice, tradeDate, notes } = req.body;

    const trade = Trade.createTrade({
      userId: req.user.id,
      cryptoSymbol,
      type,
      quantity,
      entryPrice,
      tradeDate,
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Trade created successfully',
      data: trade,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating trade',
      error: error.message,
    });
  }
};

// Get all trades for user
exports.getTrades = async (req, res) => {
  try {
    const { page = 1, limit = 10, cryptoSymbol, type, status } = req.query;

    const { items: trades, total } = Trade.findByUserWithFilters(req.user.id, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      cryptoSymbol,
      type,
      status,
    });

    res.status(200).json({
      success: true,
      data: trades,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching trades',
      error: error.message,
    });
  }
};

// Get single trade
exports.getTrade = async (req, res) => {
  try {
    const trade = Trade.findById(req.params.id);

    if (!trade) {
      return res.status(404).json({
        success: false,
        message: 'Trade not found',
      });
    }

    // Verify ownership
    if (trade.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this trade',
      });
    }

    res.status(200).json({
      success: true,
      data: trade,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching trade',
      error: error.message,
    });
  }
};

// Update trade
exports.updateTrade = async (req, res) => {
  try {
    let trade = Trade.findById(req.params.id);

    if (!trade) {
      return res.status(404).json({
        success: false,
        message: 'Trade not found',
      });
    }

    // Verify ownership
    if (trade.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this trade',
      });
    }

    // Update allowed fields
    const allowedUpdates = ['quantity', 'entryPrice', 'exitPrice', 'status', 'notes', 'closeDate'];
    const updates = {};

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    trade = Trade.updateTradeById(req.params.id, updates);

    res.status(200).json({
      success: true,
      message: 'Trade updated successfully',
      data: trade,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating trade',
      error: error.message,
    });
  }
};

// Delete trade
exports.deleteTrade = async (req, res) => {
  try {
    const trade = Trade.findById(req.params.id);

    if (!trade) {
      return res.status(404).json({
        success: false,
        message: 'Trade not found',
      });
    }

    // Verify ownership
    if (trade.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this trade',
      });
    }

    Trade.deleteById(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Trade deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting trade',
      error: error.message,
    });
  }
};