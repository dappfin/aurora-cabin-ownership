import { Database } from './index';
import { KeyCommitment } from '../services/zk';
import sqlite3 from 'sqlite3';

export interface ZKKeyRecord {
  id: number;
  wallet_address: string;
  commitment_hash: string;
  nullifier_hash: string;
  is_spent: boolean;
  created_at: string;
}

export class ZKEnhancedDatabase extends Database {
  private zkDb: sqlite3.Database;

  constructor(dbPath: string) {
    super(dbPath);
    this.zkDb = new sqlite3.Database(dbPath);
    this.initEnhancedTables();
  }

  private initEnhancedTables() {
    this.zkDb.serialize(() => {
      // Enhanced schema with wallet address tracking
      this.zkDb.run(`
        CREATE TABLE IF NOT EXISTS keys (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          wallet_address TEXT NOT NULL,
          commitment_hash TEXT UNIQUE NOT NULL,
          nullifier_hash TEXT UNIQUE NOT NULL,
          is_spent BOOLEAN DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create indexes for performance
      this.zkDb.run(`
        CREATE INDEX IF NOT EXISTS idx_wallet_address ON keys(wallet_address)
      `);

      this.zkDb.run(`
        CREATE INDEX IF NOT EXISTS idx_commitment_hash ON keys(commitment_hash)
      `);

      this.zkDb.run(`
        CREATE INDEX IF NOT EXISTS idx_nullifier_hash ON keys(nullifier_hash)
      `);

      this.zkDb.run(`
        CREATE INDEX IF NOT EXISTS idx_spent ON keys(is_spent)
      `);
    });
  }

  /**
   * Store a new key commitment with wallet address
   */
  async storeKeyCommitment(
    walletAddress: string,
    commitment: KeyCommitment
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const stmt = this.zkDb.prepare(`
        INSERT INTO keys (wallet_address, commitment_hash, nullifier_hash, is_spent, created_at)
        VALUES (?, ?, ?, ?, ?)
      `);

      const nullifierHash = this.generateNullifierHash(commitment.nullifier, commitment.secret);

      stmt.run([
        walletAddress,
        commitment.commitment,
        nullifierHash,
        false,
        commitment.created_at
      ], function(this: sqlite3.RunResult, err: Error | null) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });

      stmt.finalize();
    });
  }

  /**
   * Get unspent key count for a wallet address
   */
  async getUnspentKeyCount(walletAddress: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.zkDb.get(
        'SELECT COUNT(*) as count FROM keys WHERE wallet_address = ? AND is_spent = FALSE',
        [walletAddress],
        (err: Error | null, row: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(row?.count || 0);
          }
        }
      );
    });
  }

  /**
   * Get all keys for a wallet address
   */
  async getWalletKeys(walletAddress: string): Promise<ZKKeyRecord[]> {
    return new Promise((resolve, reject) => {
      this.zkDb.all(
        'SELECT * FROM keys WHERE wallet_address = ? ORDER BY created_at DESC',
        [walletAddress],
        (err: Error | null, rows: ZKKeyRecord[]) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows || []);
          }
        }
      );
    });
  }

  /**
   * Mark a key as spent with nullifier tracking
   */
  async markKeySpent(
    commitmentHash: string,
    txHash: string,
    nullifierHash: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const stmt = this.zkDb.prepare(`
        UPDATE keys 
        SET is_spent = TRUE 
        WHERE commitment_hash = ?
      `);

      stmt.run([commitmentHash], function(this: sqlite3.RunResult, err: Error | null) {
        if (err) {
          reject(err);
          return;
        }
      });

      stmt.finalize();

      // Add to spent nullifiers table for double-spend protection
      const stmt2 = this.zkDb.prepare(`
        INSERT INTO spent_nullifiers (nullifier_hash, spent_at, tx_hash)
        VALUES (?, CURRENT_TIMESTAMP, ?)
      `, [nullifierHash]);

      stmt2.run([], function(this: sqlite3.RunResult, err: Error | null) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });

      stmt2.finalize();
    });
  }

  /**
   * Check if nullifier is spent
   */
  async isNullifierSpent(nullifierHash: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.zkDb.get(`
        SELECT 1 FROM spent_nullifiers WHERE nullifier_hash = ?
        UNION
        SELECT 1 FROM keys k 
        JOIN spent_nullifiers sn ON k.nullifier_hash = sn.nullifier_hash 
        WHERE k.nullifier_hash = ?
        LIMIT 1
      `, [nullifierHash], (err: Error | null, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(!!row);
        }
      });
    });
  }

  /**
   * Generate nullifier hash for tracking
   */
  private generateNullifierHash(nullifier: string, secret: string): string {
    const crypto = require('crypto');
    const combined = nullifier + secret;
    return crypto.createHash('sha256').update(combined).digest('hex');
  }

  /**
   * Close enhanced database connection
   */
  closeEnhancedDatabase() {
    this.zkDb.close();
  }
}
