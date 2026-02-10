const getDb = require('../config/database');

const db = getDb();

const now = () => new Date().toISOString();

function createTransaction({
  userId,
  type,
  amount,
  currency,
  paymentMethod,
  status,
  transactionId,
  description,
  transactionDate,
}) {
  const stmt = db.prepare(
    `INSERT INTO transactions
     (userId, type, amount, currency, paymentMethod, status, transactionId, description, transactionDate, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const timestamp = now();
  const info = stmt.run(
    userId,
    type,
    amount,
    currency,
    paymentMethod,
    status,
    transactionId,
    description || null,
    transactionDate,
    timestamp,
    timestamp
  );
  return findById(info.lastInsertRowid);
}

function findById(id) {
  const stmt = db.prepare(`SELECT * FROM transactions WHERE id = ?`);
  return stmt.get(id);
}

function findByUserWithFilters(userId, { page = 1, limit = 10, type, status }) {
  const where = ['userId = ?'];
  const params = [userId];

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
    `SELECT * FROM transactions ${whereClause} ORDER BY datetime(transactionDate) DESC LIMIT ? OFFSET ?`
  );
  const countStmt = db.prepare(
    `SELECT COUNT(*) as count FROM transactions ${whereClause}`
  );

  const items = listStmt.all(...params, limit, offset);
  const total = countStmt.get(...params).count;

  return { items, total };
}

function findCompletedByUser(userId) {
  const stmt = db.prepare(
    `SELECT * FROM transactions WHERE userId = ? AND status = 'COMPLETED'`
  );
  return stmt.all(userId);
}

function updateStatus(id, status) {
  const stmt = db.prepare(
    `UPDATE transactions SET status = ?, updatedAt = ? WHERE id = ?`
  );
  const info = stmt.run(status, now(), id);
  return info.changes > 0 ? findById(id) : null;
}

function findAllByUserBetweenDates(userId, field, startISO, endISO) {
  const stmt = db.prepare(
    `SELECT * FROM transactions
     WHERE userId = ?
       AND ${field} >= ?
       AND ${field} <= ?
  `
  );
  return stmt.all(userId, startISO, endISO);
}

function countCompleted() {
  const stmt = db.prepare(
    `SELECT COUNT(*) as count FROM transactions WHERE status = 'COMPLETED'`
  );
  const row = stmt.get();
  return row.count;
}

module.exports = {
  createTransaction,
  findById,
  findByUserWithFilters,
  findCompletedByUser,
  updateStatus,
  findAllByUserBetweenDates,
  countCompleted,
};