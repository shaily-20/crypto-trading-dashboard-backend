const Database = require('better-sqlite3');
const path = require('path');

let db;

const initDb = () => {
  if (db) return db;

  const dbPath = path.join(__dirname, '..', 'database.sqlite');
  db = new Database(dbPath);
  db.pragma('foreign_keys = ON');

  // Schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      totalBalance REAL NOT NULL DEFAULT 0,
      isActive INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      cryptoSymbol TEXT NOT NULL,
      type TEXT NOT NULL,
      quantity REAL NOT NULL,
      entryPrice REAL NOT NULL,
      exitPrice REAL,
      totalValue REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      pnl REAL,
      pnlPercentage REAL,
      tradeDate TEXT NOT NULL,
      closeDate TEXT,
      notes TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL,
      paymentMethod TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      transactionId TEXT NOT NULL UNIQUE,
      description TEXT,
      transactionDate TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_trades_user_date ON trades(userId, tradeDate);
    CREATE INDEX IF NOT EXISTS idx_trades_user_symbol ON trades(userId, cryptoSymbol);
    CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(userId, transactionDate);
  `);

  console.log('SQLite database initialized at', dbPath);
  return db;
};

module.exports = initDb;