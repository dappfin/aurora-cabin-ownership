import { Database } from './index';
import { KeyCommitment } from '../services/zk';

export class ZKDatabase extends Database {
  private zkDb: sqlite3.Database;

  constructor(dbPath: string) {
    super(dbPath);
    this.zkDb = new sqlite3.Database(dbPath);
    this.initZKTables();
  }

  private initZKTables() {
    this.zkDb.serialize(() => {
      // Create table for key commitments
      this.zkDb.run(`
        CREATE TABLE IF NOT EXISTS key_commitments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          commitment TEXT UNIQUE NOT NULL,
          nullifier TEXT UNIQUE NOT NULL,
          secret TEXT NOT NULL,
          merkle_index INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          spent BOOLEAN DEFAULT FALSE
        )
      `);

      // Create table for spent nullifiers
      this.zkDb.run(`
        CREATE TABLE IF NOT EXISTS spent_nullifiers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nullifier TEXT UNIQUE NOT NULL,
          spent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          tx_hash TEXT
        )
      `);

      // Create indexes for performance
      this.zkDb.run(`
        CREATE INDEX IF NOT EXISTS idx_commitment ON key_commitments(commitment)
      `);

      this.zkDb.run(`
        CREATE INDEX IF NOT EXISTS idx_nullifier ON key_commitments(nullifier)
      `);

      this.zkDb.run(`
        CREATE INDEX IF NOT EXISTS idx_spent_nullifier ON spent_nullifiers(nullifier)
      `);
    });
  }

  /**
   * Store a new key commitment
   */
  async storeCommitment(commitment: KeyCommitment): Promise<void> {
    return new Promise((resolve, reject) => {
      const stmt = this.zkDb.prepare(`
        INSERT INTO key_commitments (commitment, nullifier, secret, merkle_index, created_at, spent)
        VALUES (?, ?, ?, ?, ?)
      `);

      stmt.run([
        commitment.commitment,
        commitment.nullifier,
        commitment.secret,
        commitment.merkle_index,
        commitment.created_at,
        commitment.spent
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
   * Get commitment by commitment hash
   */
  async getCommitment(commitmentHash: string): Promise<KeyCommitment | null> {
    return new Promise((resolve, reject) => {
      this.zkDb.get(
        'SELECT * FROM key_commitments WHERE commitment = ? AND spent = FALSE',
        [commitmentHash],
        (err: Error | null, row: KeyCommitment) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    });
  }

  /**
   * Mark a commitment as spent
   */
  async markCommitmentSpent(commitmentHash: string, txHash: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Mark commitment as spent
      const stmt1 = this.zkDb.prepare(`
        UPDATE key_commitments 
        SET spent = TRUE, spent_at = CURRENT_TIMESTAMP 
        WHERE commitment = ?
      `);

      stmt1.run([commitmentHash], function(this: sqlite3.RunResult, err: Error | null) {
        if (err) {
          reject(err);
          return;
        }
      });

      stmt1.finalize();

      // Add nullifier to spent list
      const stmt2 = this.zkDb.prepare(`
        INSERT INTO spent_nullifiers (nullifier, spent_at, tx_hash)
        SELECT nullifier, CURRENT_TIMESTAMP, ?
        FROM key_commitments WHERE commitment = ?
      `, [commitmentHash]);

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
  async isNullifierSpent(nullifier: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Check both tables
      this.zkDb.get(`
        SELECT 1 FROM spent_nullifiers WHERE nullifier = ?
        UNION
        SELECT 1 FROM key_commitments kc 
        JOIN spent_nullifiers sn ON kc.nullifier = sn.nullifier 
        WHERE kc.nullifier = ? AND kc.spent = TRUE
        LIMIT 1
      `, [nullifier], (err: Error | null, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(!!row);
        }
      });
    });
  }

  /**
   * Get all commitments for a user
   */
  async getUserCommitments(merkleIndex: number): Promise<KeyCommitment[]> {
    return new Promise((resolve, reject) => {
      this.zkDb.all(
        'SELECT * FROM key_commitments WHERE merkle_index = ? ORDER BY created_at DESC',
        [merkleIndex],
        (err: Error | null, rows: KeyCommitment[]) => {
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
   * Get commitment statistics
   */
  async getCommitmentStats(): Promise<{
    total: number;
    spent: number;
    unspent: number;
  }> {
    return new Promise((resolve, reject) => {
      this.zkDb.get(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN spent = TRUE THEN 1 ELSE 0 END) as spent,
          SUM(CASE WHEN spent = FALSE THEN 1 ELSE 0 END) as unspent
        FROM key_commitments
      `, [], (err: Error | null, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            total: row.total || 0,
            spent: row.spent || 0,
            unspent: row.unspent || 0
          });
        }
      });
    });
  }

  /**
   * Clean up old spent nullifiers (for maintenance)
   */
  async cleanupOldSpentNullifiers(daysOld: number = 30): Promise<void> {
    return new Promise((resolve, reject) => {
      const stmt = this.zkDb.prepare(`
        DELETE FROM spent_nullifiers 
        WHERE spent_at < datetime('now', '-${daysOld} days')
      `);

      stmt.run([], function(this: sqlite3.RunResult, err: Error | null) {
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
   * Close ZK database connection
   */
  closeZKDatabase() {
    this.zkDb.close();
  }
}
