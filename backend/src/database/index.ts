import sqlite3 from 'sqlite3';
import { DatabaseUser } from '../types';
import { RunResult } from 'sqlite3';

export class Database {
  private db: sqlite3.Database;

  constructor(dbPath: string) {
    this.db = new sqlite3.Database(dbPath);
    this.init();
  }

  private init() {
    this.db.serialize(() => {
      this.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          walletAddress TEXT UNIQUE NOT NULL,
          envelopeId TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'PENDING',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          completedAt DATETIME
        )
      `);

      this.db.run(`
        CREATE INDEX IF NOT EXISTS idx_wallet_address ON users(walletAddress)
      `);

      this.db.run(`
        CREATE INDEX IF NOT EXISTS idx_envelope_id ON users(envelopeId)
      `);
    });
  }

  async createUser(user: Omit<DatabaseUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<DatabaseUser> {
    return new Promise((resolve: (value: DatabaseUser) => void, reject: (reason: any) => void) => {
      const stmt = this.db.prepare(`
        INSERT INTO users (walletAddress, envelopeId, status, completedAt)
        VALUES (?, ?, ?, ?)
      `);

      stmt.run([
        user.walletAddress,
        user.envelopeId,
        user.status,
        user.completedAt || null
      ], function(this: RunResult, err: Error | null) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            ...user,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      });

      stmt.finalize();
    });
  }

  async updateUserStatus(envelopeId: string, status: string, completedAt?: string): Promise<void> {
    return new Promise((resolve: () => void, reject: (reason: any) => void) => {
      const stmt = this.db.prepare(`
        UPDATE users 
        SET status = ?, updatedAt = CURRENT_TIMESTAMP, completedAt = ?
        WHERE envelopeId = ?
      `);

      stmt.run([status, completedAt || null, envelopeId], function(err: Error | null) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });

      stmt.finalize();
    });
  }

  async getUserByWallet(walletAddress: string): Promise<DatabaseUser | null> {
    return new Promise((resolve: (value: DatabaseUser | null) => void, reject: (reason: any) => void) => {
      this.db.get(
        'SELECT * FROM users WHERE walletAddress = ?',
        [walletAddress],
        (err: Error | null, row: DatabaseUser) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    });
  }

  async getUserByEnvelope(envelopeId: string): Promise<DatabaseUser | null> {
    return new Promise((resolve: (value: DatabaseUser | null) => void, reject: (reason: any) => void) => {
      this.db.get(
        'SELECT * FROM users WHERE envelopeId = ?',
        [envelopeId],
        (err: Error | null, row: DatabaseUser) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    });
  }

  close() {
    this.db.close();
  }
}
