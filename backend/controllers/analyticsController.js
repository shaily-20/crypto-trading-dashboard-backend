const Trade = require('../models/trade');
const Transaction = require('../models/transaction');
const User = require('../models/user');
const {
  calculateCryptoPnL,
  calculateTotalPnL,
  calculateROI,
  calculateTradeStats,
} = require('../utils/pnlCalculator');
const { generateDailyReport, generateMonthlyReport } = require('../utils/reportGenerator');

// Get current P&L for user
exports.getPnL = async (req, res) => {
  try {
    const pnl = await calculateTotalPnL(req.user.id);
    const stats = await calculateTradeStats(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        ...pnl,
        ...stats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error calculating P&L',
      error: error.message,
    });
  }
};

// Get P&L for specific cryptocurrency
exports.getCryptoPnL = async (req, res) => {
  try {
    const { cryptoSymbol } = req.params;

    const pnl = await calculateCryptoPnL(req.user.id, cryptoSymbol.toUpperCase());

    res.status(200).json({
      success: true,
      data: pnl,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error calculating crypto P&L',
      error: error.message,
    });
  }
};

// Get daily report
exports.getDailyReport = async (req, res) => {
  try {
    const { date } = req.query;
    const reportDate = date ? new Date(date) : new Date();

    const report = await generateDailyReport(req.user.id, reportDate);

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating daily report',
      error: error.message,
    });
  }
};

// Get monthly report
exports.getMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: 'Please provide year and month parameters',
      });
    }

    const report = await generateMonthlyReport(req.user.id, parseInt(year, 10), parseInt(month, 10));

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating monthly report',
      error: error.message,
    });
  }
};

// Admin: Get top traders
exports.getTopTraders = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const db = require('../config/database')();
    const topTradersStmt = db.prepare(`
      SELECT
        u.id as userId,
        u.name as userName,
        u.email as email,
        SUM(t.totalValue) as totalVolume,
        COUNT(t.id) as tradeCount
      FROM trades t
      JOIN users u ON u.id = t.userId
      GROUP BY t.userId
      ORDER BY totalVolume DESC
      LIMIT ?
    `);
    const topTraders = topTradersStmt.all(parseInt(limit, 10));

    const cryptosStmt = db.prepare(`
      SELECT userId, GROUP_CONCAT(DISTINCT cryptoSymbol) as symbols
      FROM trades
      GROUP BY userId
    `);
    const cryptosByUser = cryptosStmt.all().reduce((acc, row) => {
      acc[row.userId] = row.symbols ? row.symbols.split(',') : [];
      return acc;
    }, {});

    const formattedTraders = topTraders.map((trader) => ({
      userId: trader.userId,
      userName: trader.userName || 'Unknown',
      email: trader.email || 'Unknown',
      totalVolume: parseFloat(trader.totalVolume.toFixed(2)),
      tradeCount: trader.tradeCount,
      cryptosTraded: cryptosByUser[trader.userId] || [],
    }));

    res.status(200).json({
      success: true,
      data: formattedTraders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching top traders',
      error: error.message,
    });
  }
};

// Admin: Get platform volume metrics
exports.getVolumeMetrics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const db = require('../config/database')();

    const params = [];
    let where = '';
    if (startDate && endDate) {
      where = 'WHERE datetime(tradeDate) >= datetime(?) AND datetime(tradeDate) <= datetime(?)';
      params.push(startDate, endDate);
    }

    const volumeStmt = db.prepare(`
      SELECT
        SUM(CASE WHEN type = 'BUY' THEN totalValue ELSE 0 END) as totalBuyVolume,
        SUM(CASE WHEN type = 'SELL' THEN totalValue ELSE 0 END) as totalSellVolume,
        COUNT(*) as totalTrades,
        COUNT(DISTINCT userId) as activeUsers
      FROM trades
      ${where}
    `);
    const statsRow = volumeStmt.get(...params) || {
      totalBuyVolume: 0,
      totalSellVolume: 0,
      totalTrades: 0,
      activeUsers: 0,
    };

    const cryptoStmt = db.prepare(`
      SELECT cryptoSymbol as symbol,
             SUM(totalValue) as volume,
             COUNT(*) as tradeCount
      FROM trades
      ${where}
      GROUP BY cryptoSymbol
      ORDER BY volume DESC
    `);
    const cryptoRows = cryptoStmt.all(...params);

    res.status(200).json({
      success: true,
      data: {
        period: {
          startDate: startDate || 'All time',
          endDate: endDate || 'Present',
        },
        summary: {
          totalBuyVolume: parseFloat((statsRow.totalBuyVolume || 0).toFixed(2)),
          totalSellVolume: parseFloat((statsRow.totalSellVolume || 0).toFixed(2)),
          netVolume: parseFloat(
            ((statsRow.totalSellVolume || 0) - (statsRow.totalBuyVolume || 0)).toFixed(2)
          ),
          totalTrades: statsRow.totalTrades || 0,
          activeUsers: statsRow.activeUsers || 0,
        },
        cryptoBreakdown: cryptoRows.map((c) => ({
          symbol: c.symbol,
          volume: parseFloat((c.volume || 0).toFixed(2)),
          tradeCount: c.tradeCount,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching volume metrics',
      error: error.message,
    });
  }
};

// Admin: Get platform statistics
exports.getPlatformStats = async (req, res) => {
  try {
    const db = require('../config/database')();

    const totalUsers = User.countUsers();
    const totalTrades = Trade.countAllTrades();
    const totalTransactions = Transaction.countCompleted();

    const activeUsersStmt = db.prepare(
      `SELECT COUNT(DISTINCT userId) as count FROM trades`
    );
    const activeUsersRow = activeUsersStmt.get();

    const totalVolumeStmt = db.prepare(
      `SELECT SUM(totalValue) as volume FROM trades`
    );
    const totalVolumeRow = totalVolumeStmt.get();

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsersCount: activeUsersRow.count || 0,
        totalTrades,
        totalTransactions,
        totalPlatformVolume: parseFloat(
          ((totalVolumeRow?.volume || 0)).toFixed(2)
        ),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching platform stats',
      error: error.message,
    });
  }
};