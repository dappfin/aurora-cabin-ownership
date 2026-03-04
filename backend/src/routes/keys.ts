import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { ZKService } from '../services/zk';
import { ZKDatabase } from '../database/zk';

const router = Router();
const zkService = new ZKService();
const zkDb = new ZKDatabase(process.env.DATABASE_PATH || './database/zk_aurora_vault.db');

// Validation schemas
const generateCommitmentSchema = z.object({
  merkleIndex: z.number().int().min(0),
});

const verifyOwnershipSchema = z.object({
  commitment: z.string().min(1),
  proof: z.object({
    proof: z.object({
      a: z.array(z.string()),
      b: z.array(z.string()),
      c: z.array(z.string())
    }),
    publicSignals: z.array(z.string())
  }),
  merkleProof: z.object({
    root: z.string(),
    path_elements: z.array(z.string()),
    path_indices: z.array(z.number())
  })
});

const refundRequestSchema = z.object({
  commitment: z.string().min(1),
  txHash: z.string().min(1)
});

// POST /api/keys/generate-commitment
router.post('/generate-commitment', async (req: Request, res: Response) => {
  try {
    const { merkleIndex } = generateCommitmentSchema.parse(req.body);
    
    const commitment = zkService.generateCommitment();
    commitment.merkle_index = merkleIndex;
    
    // Store commitment in database
    await zkDb.storeCommitment(commitment);
    
    res.json({
      success: true,
      data: {
        commitment: commitment.commitment,
        nullifier: commitment.nullifier,
        merkleIndex: commitment.merkle_index
      }
    });
  } catch (error: any) {
    console.error('Error generating commitment:', error);
    res.status(500).json({
      error: 'Failed to generate commitment',
      message: error.message
    });
  }
});

// POST /api/keys/verify-ownership
router.post('/verify-ownership', async (req: Request, res: Response) => {
  try {
    const { commitment, proof, merkleProof } = verifyOwnershipSchema.parse(req.body);
    
    // Get commitment from database
    const storedCommitment = await zkDb.getCommitment(commitment);
    
    if (!storedCommitment) {
      return res.status(404).json({
        error: 'Commitment not found',
        message: 'The specified commitment does not exist'
      });
    }
    
    if (storedCommitment.spent) {
      return res.status(400).json({
        error: 'Commitment already spent',
        message: 'This key has already been used'
      });
    }
    
    // Generate witness from stored commitment and provided Merkle proof
    const witness = zkService.generateMerkleWitness(storedCommitment, merkleProof);
    
    // Verify ZK proof
    const isValid = await zkService.verifyProof(proof, zkService.witnessToInputs(witness));
    
    if (!isValid) {
      return res.status(400).json({
        error: 'Invalid proof',
        message: 'The provided zero-knowledge proof is invalid'
      });
    }
    
    res.json({
      success: true,
      data: {
        valid: true,
        commitment: storedCommitment.commitment,
        unspent: true
      }
    });
  } catch (error: any) {
    console.error('Error verifying ownership:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }
    
    res.status(500).json({
      error: 'Failed to verify ownership',
      message: error.message
    });
  }
});

// POST /api/keys/refund
router.post('/refund', async (req: Request, res: Response) => {
  try {
    const { commitment, txHash } = refundRequestSchema.parse(req.body);
    
    // Get commitment from database
    const storedCommitment = await zkDb.getCommitment(commitment);
    
    if (!storedCommitment) {
      return res.status(404).json({
        error: 'Commitment not found',
        message: 'The specified commitment does not exist'
      });
    }
    
    if (storedCommitment.spent) {
      return res.status(400).json({
        error: 'Already refunded',
        message: 'This commitment has already been refunded'
      });
    }
    
    // Check if nullifier is spent (double-spend protection)
    const nullifierSpent = await zkDb.isNullifierSpent(storedCommitment.nullifier);
    if (nullifierSpent) {
      return res.status(400).json({
        error: 'Double spend detected',
        message: 'This nullifier has already been used'
      });
    }
    
    // Mark commitment as spent
    await zkDb.markCommitmentSpent(commitment, txHash);
    
    res.json({
      success: true,
      data: {
        refunded: true,
        commitment: storedCommitment.commitment,
        txHash
      }
    });
  } catch (error: any) {
    console.error('Error processing refund:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }
    
    res.status(500).json({
      error: 'Failed to process refund',
      message: error.message
    });
  }
});

// GET /api/keys/commitment/:commitmentHash
router.get('/commitment/:commitmentHash', async (req: Request, res: Response) => {
  try {
    const { commitmentHash } = req.params;
    
    if (!commitmentHash || typeof commitmentHash !== 'string') {
      return res.status(400).json({
        error: 'Invalid commitment hash',
        message: 'Commitment hash is required'
      });
    }
    
    const commitment = await zkDb.getCommitment(commitmentHash);
    
    if (!commitment) {
      return res.status(404).json({
        error: 'Commitment not found',
        message: 'The specified commitment does not exist'
      });
    }
    
    res.json({
      success: true,
      data: {
        commitment: commitment.commitment,
        merkleIndex: commitment.merkle_index,
        spent: commitment.spent,
        createdAt: commitment.created_at
      }
    });
  } catch (error: any) {
    console.error('Error fetching commitment:', error);
    res.status(500).json({
      error: 'Failed to fetch commitment',
      message: error.message
    });
  }
});

// GET /api/keys/user/:merkleIndex
router.get('/user/:merkleIndex', async (req: Request, res: Response) => {
  try {
    const { merkleIndex } = req.params;
    const index = parseInt(merkleIndex);
    
    if (isNaN(index) || index < 0) {
      return res.status(400).json({
        error: 'Invalid Merkle index',
        message: 'Merkle index must be a non-negative integer'
      });
    }
    
    const commitments = await zkDb.getUserCommitments(index);
    
    res.json({
      success: true,
      data: {
        merkleIndex: index,
        commitments: commitments.map(c => ({
          commitment: c.commitment,
          spent: c.spent,
          createdAt: c.created_at
        }))
      }
    });
  } catch (error: any) {
    console.error('Error fetching user commitments:', error);
    res.status(500).json({
      error: 'Failed to fetch commitments',
      message: error.message
    });
  }
});

// GET /api/keys/stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await zkDb.getCommitmentStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      error: 'Failed to fetch stats',
      message: error.message
    });
  }
});

export default router;
