const Trade = require('../models/trade.js');
const Transaction = require('../models/transaction.js');
/**
 * Calculate P&L for a specific cryptocurrency
 * Using weighted average cost basis
 */
const calculateCryptoPnL = async (userId, cryptoSymbol) => {
  try {
    const allForUser = Trade.findAllByUser(userId);
    const buyTrades = allForUser
      .filter((t) => t.cryptoSymbol === cryptoSymbol && t.type === 'BUY')
      .sort((a, b) => new Date(a.tradeDate) - new Date(b.tradeDate));

    const sellTrades = allForUser
      .filter((t) => t.cryptoSymbol === cryptoSymbol && t.type === 'SELL')
      .sort((a, b) => new Date(a.tradeDate) - new Date(b.tradeDate));

    let totalBoughtQuantity = 0;
    let totalBoughtValue = 0;
    let realizedPnL = 0;

    // Process buy and sell trades chronologically
    const allTrades = [...buyTrades, ...sellTrades].sort(
      (a, b) => new Date(a.tradeDate) - new Date(b.tradeDate)
    );

    const costBasis = {}; // Track cost per unit

    for (const trade of allTrades) {
      if (trade.type === 'BUY') {
        totalBoughtQuantity += trade.quantity;
        totalBoughtValue += trade.totalValue;
      } else if (trade.type === 'SELL') {
        const avgCostPerUnit = totalBoughtValue / totalBoughtQuantity || 0;
        const sellValue = trade.quantity * trade.entryPrice;
        const costOfSold = trade.quantity * avgCostPerUnit;
        realizedPnL += sellValue - costOfSold;
        totalBoughtQuantity -= trade.quantity;
      }
    }

    // Calculate unrealized P&L for remaining holdings
    const unrealizedPnL = totalBoughtQuantity > 0 ? totalBoughtValue : 0;
    const avgCostPerUnit = totalBoughtQuantity > 0 ? totalBoughtValue / totalBoughtQuantity : 0;

    return {
      cryptoSymbol,
      holdingQuantity: totalBoughtQuantity,
      avgCostPerUnit: parseFloat(avgCostPerUnit.toFixed(2)),
      totalInvestment: parseFloat(totalBoughtValue.toFixed(2)),
      realizedPnL: parseFloat(realizedPnL.toFixed(2)),
      unrealizedPnL: parseFloat(unrealizedPnL.toFixed(2)),
      totalPnL: parseFloat((realizedPnL + unrealizedPnL).toFixed(2)),
    };
  } catch (error) {
    console.error('Error calculating P&L:', error);
    throw error;
  }
};

/**
 * Calculate total P&L across all cryptocurrencies
 */
const calculateTotalPnL = async (userId) => {
  try {
    // Get unique crypto symbols
    const symbols = Trade.findDistinctCryptoSymbolsByUser(userId);

    let totalPnL = {
      realizedPnL: 0,
      unrealizedPnL: 0,
      totalPnL: 0,
      holdingsBreakdown: {},
    };

    for (const symbol of symbols) {
      const pnl = await calculateCryptoPnL(userId, symbol);
      totalPnL.realizedPnL += pnl.realizedPnL;
      totalPnL.unrealizedPnL += pnl.unrealizedPnL;
      totalPnL.holdingsBreakdown[symbol] = pnl;
    }

    totalPnL.totalPnL = totalPnL.realizedPnL + totalPnL.unrealizedPnL;
    totalPnL.realizedPnL = parseFloat(totalPnL.realizedPnL.toFixed(2));
    totalPnL.unrealizedPnL = parseFloat(totalPnL.unrealizedPnL.toFixed(2));
    totalPnL.totalPnL = parseFloat(totalPnL.totalPnL.toFixed(2));

    return totalPnL;
  } catch (error) {
    console.error('Error calculating total P&L:', error);
    throw error;
  }
};

/**
 * Calculate ROI percentage
 */
const calculateROI = (investedAmount, profit) => {
  if (investedAmount === 0) return 0;
  return parseFloat(((profit / investedAmount) * 100).toFixed(2));
};

/**
 * Calculate trades statistics
 */
const calculateTradeStats = async (userId) => {
  try {
    const trades = Trade.findAllByUser(userId);

    const buyTrades = trades.filter((t) => t.type === 'BUY');
    const sellTrades = trades.filter((t) => t.type === 'SELL');

    return {
      totalTrades: trades.length,
      totalBuys: buyTrades.length,
      totalSells: sellTrades.length,
      totalBuysValue: buyTrades.reduce((sum, t) => sum + t.totalValue, 0).toFixed(2),
      totalSellsValue: sellTrades.reduce((sum, t) => sum + t.totalValue, 0).toFixed(2),
    };
  } catch (error) {
    console.error('Error calculating trade stats:', error);
    throw error;
  }
};

module.exports = {
  calculateCryptoPnL,
  calculateTotalPnL,
  calculateROI,
  calculateTradeStats,
};