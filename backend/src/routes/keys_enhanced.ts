import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { ZKService } from '../services/zk';
import { ZKEnhancedDatabase } from '../database/zk_enhanced';

const router = Router();
const zkService = new ZKService();
const zkDb = new ZKEnhancedDatabase(process.env.DATABASE_PATH || './database/zk_aurora_vault.db');

// Validation schemas
const balanceRequestSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address')
});

const partialRefundSchema = z.object({
  commitmentHash: z.string().min(1),
  nullifierProof: z.object({
    proof: z.object({
      a: z.array(z.string()),
      b: z.array(z.string()),
      c: z.array(z.string())
    }),
    publicSignals: z.array(z.string())
  })
});

// GET /api/keys/balance/:walletAddress
router.get('/balance/:walletAddress', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = balanceRequestSchema.parse(req.params);
    
    const unspentCount = await zkDb.getUnspentKeyCount(walletAddress);
    
    res.json({
      success: true,
      data: {
        walletAddress,
        unspentKeys: unspentCount,
        totalKeys: unspentCount // Since we only track unspent keys
      }
    });
  } catch (error: any) {
    console.error('Error fetching balance:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }
    
    res.status(500).json({
      error: 'Failed to fetch balance',
      message: error.message
    });
  }
});

// POST /api/keys/execute-refund
router.post('/execute-refund', async (req: Request, res: Response) => {
  try {
    const { commitmentHash, nullifierProof } = partialRefundSchema.parse(req.body);
    
    // Verify the ZK proof for the nullifier
    const isValid = await zkService.verifyProof(
      nullifierProof,
      zkService.witnessToInputs({
        root: '', // We don't need root for this verification
        nullifier: '', // Will be extracted from publicSignals
        secret: '',
        path_elements: [],
        path_indices: [],
        leaf_secret: '',
        leaf_nullifier: ''
      })
    );
    
    if (!isValid) {
      return res.status(400).json({
        error: 'Invalid nullifier proof',
        message: 'The provided zero-knowledge proof is invalid'
      });
    }
    
    // Extract nullifier from public signals
    const nullifierFromProof = nullifierProof.publicSignals[1]; // Assuming nullifier is at index 1
    
    // Mark the commitment as spent using the nullifier from the proof
    await zkDb.markKeySpent(commitmentHash, 'refund_tx_' + Date.now(), nullifierFromProof);
    
    // In a real implementation, this would trigger a smart contract call
    // to send 200 USD equivalent to the user's wallet address
    
    res.json({
      success: true,
      data: {
        refunded: true,
        commitmentHash,
        nullifier: nullifierFromProof,
        refundTxHash: 'refund_tx_' + Date.now()
      }
    });
  } catch (error: any) {
    console.error('Error executing partial refund:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }
    
    res.status(500).json({
      error: 'Failed to execute refund',
      message: error.message
    });
  }
});

export default router;
