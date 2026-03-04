import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { AuthensureService } from '../services/authensure';
import { Database } from '../database';
import { Web3Service } from '../services/web3';

const router = Router();
const authensureService = new AuthensureService();

// Initialize database and web3 services
const db = new Database(process.env.DATABASE_PATH || './database/aurora_vault.db');
const web3Service = new Web3Service();

// Validation schemas
const createSessionSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address')
});

// POST /api/kyc/create-session
router.post('/create-session', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = createSessionSchema.parse(req.body);

    // Check if user already has a pending or verified KYC
    const existingUser = await db.getUserByWallet(walletAddress);
    if (existingUser && (existingUser.status === 'PENDING' || existingUser.status === 'VERIFIED')) {
      return res.status(400).json({
        error: 'KYC already in progress or completed',
        status: existingUser.status.toLowerCase(),
        envelopeId: existingUser.envelopeId
      });
    }

    // Create new KYC session
    const kycSession = await authensureService.createKYCSession({ walletAddress });

    // Store in database
    await db.createUser({
      walletAddress,
      envelopeId: kycSession.envelopeId,
      status: 'PENDING'
    });

    res.json({
      success: true,
      data: kycSession
    });

  } catch (error: any) {
    console.error('Error creating KYC session:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/kyc/status/:envelopeId
router.get('/status/:envelopeId', async (req: Request, res: Response) => {
  try {
    const { envelopeId } = req.params;

    // First check local database
    const localUser = await db.getUserByEnvelope(envelopeId);
    if (!localUser) {
      return res.status(404).json({
        error: 'Envelope not found'
      });
    }

    // Get real-time status from Authesure
    const kycStatus = await authensureService.getKYCStatus(envelopeId);

    // Update local database if status changed
    if (kycStatus.status !== localUser.status.toLowerCase()) {
      const newStatus = kycStatus.status.toUpperCase() as 'PENDING' | 'VERIFIED' | 'EXPIRED' | 'FAILED';
      await db.updateUserStatus(
        envelopeId,
        newStatus,
        kycStatus.completedAt
      );
    }

    // If KYC is completed, generate permission signature
    let permissionSignature = null;
    if (kycStatus.status === 'completed' && localUser.walletAddress) {
      try {
        permissionSignature = await web3Service.signPermission(
          localUser.walletAddress,
          envelopeId,
          process.env.VERIFICATION_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'
        );
      } catch (sigError) {
        console.error('Error generating permission signature:', sigError);
      }
    }

    res.json({
      success: true,
      data: {
        ...kycStatus,
        walletAddress: localUser.walletAddress,
        permissionSignature
      }
    });

  } catch (error: any) {
    console.error('Error fetching KYC status:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/kyc/user/:walletAddress
router.get('/user/:walletAddress', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;

    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({
        error: 'Invalid Ethereum address'
      });
    }

    const user = await db.getUserByWallet(walletAddress);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error: any) {
    console.error('Error fetching user KYC status:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

export default router;
