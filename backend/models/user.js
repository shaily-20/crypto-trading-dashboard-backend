const bcryptjs = require('bcryptjs');
const getDb = require('../config/database');

const db = getDb();

const now = () => new Date().toISOString();

async function createUser({ name, email, password, role = 'user' }) {
  const salt = await bcryptjs.genSalt(10);
  const hashed = await bcryptjs.hash(password, salt);
  const stmt = db.prepare(
    `INSERT INTO users (name, email, password, role, totalBalance, isActive, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, 0, 1, ?, ?)`
  );
  const timestamp = now();
  const info = stmt.run(name, email.toLowerCase(), hashed, role, timestamp, timestamp);
  return findById(info.lastInsertRowid);
}

function findByEmail(email) {
  const stmt = db.prepare(
    `SELECT id, name, email, role, totalBalance, isActive, createdAt, updatedAt
     FROM users WHERE email = ?`
  );
  return stmt.get(email.toLowerCase());
}

function findByEmailWithPassword(email) {
  const stmt = db.prepare(
    `SELECT * FROM users WHERE email = ?`
  );
  return stmt.get(email.toLowerCase());
}

function findById(id) {
  const stmt = db.prepare(
    `SELECT id, name, email, role, totalBalance, isActive, createdAt, updatedAt
     FROM users WHERE id = ?`
  );
  return stmt.get(id);
}

async function comparePassword(enteredPassword, hashedPassword) {
  return bcryptjs.compare(enteredPassword, hashedPassword);
}

function updateTotalBalance(userId, balance) {
  const stmt = db.prepare(
    `UPDATE users SET totalBalance = ?, updatedAt = ? WHERE id = ?`
  );
  stmt.run(balance, now(), userId);
}

function countUsers() {
  const stmt = db.prepare(`SELECT COUNT(*) as count FROM users`);
  const row = stmt.get();
  return row.count;
}

module.exports = {
  createUser,
  findByEmail,
  findByEmailWithPassword,
  findById,
  comparePassword,
  updateTotalBalance,
  countUsers,
};