const validateTrade = (req, res, next) => {
  const { cryptoSymbol, type, quantity, entryPrice, tradeDate } = req.body;

  // Validate required fields
  if (!cryptoSymbol || !type || !quantity || !entryPrice || !tradeDate) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: cryptoSymbol, type, quantity, entryPrice, tradeDate',
    });
  }

  // Validate type
  if (!['BUY', 'SELL'].includes(type.toUpperCase())) {
    return res.status(400).json({
      success: false,
      message: 'Type must be either BUY or SELL',
    });
  }

  // Validate numeric fields
  if (quantity <= 0 || entryPrice <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Quantity and price must be positive numbers',
    });
  }

  // Validate date
  if (isNaN(new Date(tradeDate).getTime())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid date format',
    });
  }

  next();
};

const validateTransaction = (req, res, next) => {
  const { type, amount, currency, paymentMethod, transactionDate } = req.body;

  if (!type || !amount || !currency || !paymentMethod || !transactionDate) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: type, amount, currency, paymentMethod, transactionDate',
    });
  }

  if (!['DEPOSIT', 'WITHDRAWAL'].includes(type)) {
    return res.status(400).json({
      success: false,
      message: 'Type must be DEPOSIT or WITHDRAWAL',
    });
  }

  if (amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Amount must be positive',
    });
  }

  next();
};

module.exports = {
  validateTrade,
  validateTransaction,
};