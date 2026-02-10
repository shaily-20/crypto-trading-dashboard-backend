const getDb = require('../config/database');

const db = getDb();

const now = () => new Date().toISOString();

function createTrade({ userId, cryptoSymbol, type, quantity, entryPrice, tradeDate, notes }) {
  const upperSymbol = cryptoSymbol.toUpperCase();
  const upperType = type.toUpperCase();
  const totalValue = quantity * entryPrice;
  const stmt = db.prepare(
    `INSERT INTO trades
     (userId, cryptoSymbol, type, quantity, entryPrice, exitPrice, totalValue, status, pnl, pnlPercentage, tradeDate, closeDate, notes, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, NULL, ?, 'open', NULL, NULL, ?, NULL, ?, ?, ?)`
  );
  const timestamp = now();
  const info = stmt.run(
    userId,
    upperSymbol,
    upperType,
    quantity,
    entryPrice,
    totalValue,
    tradeDate,
    notes || null,
    timestamp,
    timestamp
  );
  return findById(info.lastInsertRowid);
}

function findById(id) {
  const stmt = db.prepare(`SELECT * FROM trades WHERE id = ?`);
  return stmt.get(id);
}

function findByUserWithFilters(userId, { page = 1, limit = 10, cryptoSymbol, type, status }) {
  const where = ['userId = ?'];
  const params = [userId];

  if (cryptoSymbol) {
    where.push('cryptoSymbol = ?');
    params.push(cryptoSymbol.toUpperCase());
  }
  if (type) {
    where.push('type = ?');
    params.push(type.toUpperCase());
  }
  if (status) {
    where.push('status = ?');
    params.push(status);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const listStmt = db.prepare(
    `SELECT * FROM trades ${whereClause} ORDER BY datetime(tradeDate) DESC LIMIT ? OFFSET ?`
  );
  const countStmt = db.prepare(
    `SELECT COUNT(*) as count FROM trades ${whereClause}`
  );

  const items = listStmt.all(...params, limit, offset);
  const total = countStmt.get(...params).count;

  return { items, total };
}

function updateTradeById(id, updates) {
  const existing = findById(id);
  if (!existing) return null;

  const merged = { ...existing, ...updates };

  // Recalculate totalValue and pnl if needed
  let { quantity, entryPrice, exitPrice, type } = merged;
  let totalValue = existing.totalValue;

  if (type === 'BUY' || !exitPrice) {
    totalValue = quantity * entryPrice;
  } else if (type === 'SELL' && exitPrice) {
    totalValue = quantity * exitPrice;
  }

  let pnl = merged.pnl;
  let pnlPercentage = merged.pnlPercentage;

  if (updates.exitPrice && type === 'BUY') {
    const pnlRaw = (updates.exitPrice - entryPrice) * quantity;
    const pnlPctRaw = ((updates.exitPrice - entryPrice) / entryPrice) * 100;
    pnl = parseFloat(pnlRaw.toFixed(2));
    pnlPercentage = parseFloat(pnlPctRaw.toFixed(2));
    merged.status = 'closed';
  }

  const stmt = db.prepare(
    `UPDATE trades SET
      quantity = ?,
      entryPrice = ?,
      exitPrice = ?,
      totalValue = ?,
      status = ?,
      pnl = ?,
      pnlPercentage = ?,
      closeDate = ?,
      notes = ?,
      updatedAt = ?
     WHERE id = ?`
  );

  stmt.run(
    merged.quantity,
    merged.entryPrice,
    merged.exitPrice,
    totalValue,
    merged.status,
    pnl,
    pnlPercentage,
    merged.closeDate || null,
    merged.notes || null,
    now(),
    id
  );

  return findById(id);
}

function deleteById(id) {
  const stmt = db.prepare(`DELETE FROM trades WHERE id = ?`);
  const info = stmt.run(id);
  return info.changes > 0;
}

function findAllByUser(userId) {
  const stmt = db.prepare(`SELECT * FROM trades WHERE userId = ?`);
  return stmt.all(userId);
}

function findDistinctCryptoSymbolsByUser(userId) {
  const stmt = db.prepare(
    `SELECT DISTINCT cryptoSymbol FROM trades WHERE userId = ?`
  );
  const rows = stmt.all(userId);
  return rows.map((r) => r.cryptoSymbol);
}

function countAllTrades() {
  const stmt = db.prepare(`SELECT COUNT(*) as count FROM trades`);
  const row = stmt.get();
  return row.count;
}

module.exports = {
  createTrade,
  findById,
  findByUserWithFilters,
  updateTradeById,
  deleteById,
  findAllByUser,
  findDistinctCryptoSymbolsByUser,
  countAllTrades,
};