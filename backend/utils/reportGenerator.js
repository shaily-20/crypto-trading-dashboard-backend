const Trade = require('../models/trade.js');
const Transaction = require('../models/transaction.js');
const { calculateTotalPnL, calculateTradeStats } = require('./pnlCalculator');

/**
 * Generate daily report for a user
 */
const generateDailyReport = async (userId, date = new Date()) => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const allTrades = Trade.findAllByUser(userId);
    const trades = allTrades.filter((t) => {
      const d = new Date(t.tradeDate);
      return d >= startOfDay && d <= endOfDay;
    });

    const allTx = Transaction.findAllByUserBetweenDates(
      userId,
      'transactionDate',
      startOfDay.toISOString(),
      endOfDay.toISOString()
    ).filter((t) => t.status === 'COMPLETED');

    // Calculate totals
    const buyTrades = trades.filter((t) => t.type === 'BUY');
    const sellTrades = trades.filter((t) => t.type === 'SELL');

    const totalBuyValue = buyTrades.reduce((sum, t) => sum + t.totalValue, 0);
    const totalSellValue = sellTrades.reduce((sum, t) => sum + t.totalValue, 0);

    const deposits = transactions
      .filter((t) => t.type === 'DEPOSIT')
      .reduce((sum, t) => sum + t.amount, 0);

    const withdrawals = transactions
      .filter((t) => t.type === 'WITHDRAWAL')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      date: date.toISOString().split('T')[0],
      tradesCount: {
        buys: buyTrades.length,
        sells: sellTrades.length,
        total: trades.length,
      },
      trading: {
        totalBuyValue: parseFloat(totalBuyValue.toFixed(2)),
        totalSellValue: parseFloat(totalSellValue.toFixed(2)),
        netTradeValue: parseFloat((totalSellValue - totalBuyValue).toFixed(2)),
      },
      fundMovements: {
        deposits: parseFloat(deposits.toFixed(2)),
        withdrawals: parseFloat(withdrawals.toFixed(2)),
        netMovement: parseFloat((deposits - withdrawals).toFixed(2)),
      },
      tradeDetails: trades,
      transactionDetails: transactions,
    };
  } catch (error) {
    console.error('Error generating daily report:', error);
    throw error;
  }
};

/**
 * Generate monthly report for a user
 */
const generateMonthlyReport = async (userId, year, month) => {
  try {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    const allTrades = Trade.findAllByUser(userId);
    const trades = allTrades.filter((t) => {
      const d = new Date(t.tradeDate);
      return d >= startOfMonth && d <= endOfMonth;
    });

    const allTx = Transaction.findAllByUserBetweenDates(
      userId,
      'transactionDate',
      startOfMonth.toISOString(),
      endOfMonth.toISOString()
    ).filter((t) => t.status === 'COMPLETED');

    // Calculate metrics
    const buyTrades = trades.filter((t) => t.type === 'BUY');
    const sellTrades = trades.filter((t) => t.type === 'SELL');
    const closedTrades = trades.filter((t) => t.status === 'closed' && t.pnl);

    const totalBuyValue = buyTrades.reduce((sum, t) => sum + t.totalValue, 0);
    const totalSellValue = sellTrades.reduce((sum, t) => sum + t.totalValue, 0);
    const realizedPnL = closedTrades.reduce((sum, t) => sum + t.pnl, 0);

    const deposits = transactions
      .filter((t) => t.type === 'DEPOSIT')
      .reduce((sum, t) => sum + t.amount, 0);

    const withdrawals = transactions
      .filter((t) => t.type === 'WITHDRAWAL')
      .reduce((sum, t) => sum + t.amount, 0);

    // Get crypto breakdown
    const cryptoBreakdown = {};
    for (const trade of trades) {
      if (!cryptoBreakdown[trade.cryptoSymbol]) {
        cryptoBreakdown[trade.cryptoSymbol] = {
          buys: 0,
          sells: 0,
          totalValue: 0,
        };
      }
      if (trade.type === 'BUY') {
        cryptoBreakdown[trade.cryptoSymbol].buys += 1;
      } else {
        cryptoBreakdown[trade.cryptoSymbol].sells += 1;
      }
      cryptoBreakdown[trade.cryptoSymbol].totalValue += trade.totalValue;
    }

    return {
      month: `${year}-${String(month).padStart(2, '0')}`,
      summary: {
        tradesCount: {
          buys: buyTrades.length,
          sells: sellTrades.length,
          closed: closedTrades.length,
          total: trades.length,
        },
        trading: {
          totalBuyValue: parseFloat(totalBuyValue.toFixed(2)),
          totalSellValue: parseFloat(totalSellValue.toFixed(2)),
          netTradeValue: parseFloat((totalSellValue - totalBuyValue).toFixed(2)),
          realizedPnL: parseFloat(realizedPnL.toFixed(2)),
        },
        fundMovements: {
          deposits: parseFloat(deposits.toFixed(2)),
          withdrawals: parseFloat(withdrawals.toFixed(2)),
          netMovement: parseFloat((deposits - withdrawals).toFixed(2)),
        },
      },
      cryptoBreakdown,
      tradingDays: trades.length > 0 ? new Set(trades.map((t) => t.tradeDate.toDateString())).size : 0,
    };
  } catch (error) {
    console.error('Error generating monthly report:', error);
    throw error;
  }
};

module.exports = {
  generateDailyReport,
  generateMonthlyReport,
};