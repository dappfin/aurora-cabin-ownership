import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { AuthensureService } from '../services/authensure';
import { Database } from '../database';

const router = Router();
const authensureService = new AuthensureService();

// Initialize database
const db = new Database(process.env.DATABASE_PATH || './database/aurora_vault.db');

// WebSocket connections for real-time notifications
const connections = new Set<any>();

// Validation schema for webhook events
const webhookEventSchema = z.object({
  type: z.string(),
  envelopeId: z.string(),
  data: z.any(),
  timestamp: z.string()
});

// Middleware to verify webhook signature
const verifyWebhookSignature = (req: Request, res: Response, next: Function) => {
  const signature = req.headers['x-authensure-signature'] as string;
  const payload = JSON.stringify(req.body);

  if (!signature) {
    return res.status(401).json({
      error: 'Missing signature'
    });
  }

  if (!authensureService.verifyWebhookSignature(payload, signature)) {
    return res.status(401).json({
      error: 'Invalid signature'
    });
  }

  next();
};

// POST /api/webhooks/authensure
router.post('/authensure', verifyWebhookSignature, async (req: Request, res: Response) => {
  try {
    const event = webhookEventSchema.parse(req.body);

    console.log(`Received webhook event: ${event.type} for envelope: ${event.envelopeId}`);

    // Handle envelope.completed event
    if (event.type === 'envelope.completed') {
      const user = await db.getUserByEnvelope(event.envelopeId);
      
      if (user) {
        // Update user status to VERIFIED
        await db.updateUserStatus(
          event.envelopeId,
          'VERIFIED',
          new Date().toISOString()
        );

        console.log(`KYC completed for wallet: ${user.walletAddress}`);

        // Notify all connected WebSocket clients
        const notification = {
          type: 'kyc_completed',
          walletAddress: user.walletAddress,
          envelopeId: event.envelopeId,
          timestamp: new Date().toISOString()
        };

        connections.forEach((connection) => {
          if (connection.readyState === 1) { // WebSocket.OPEN
            connection.send(JSON.stringify(notification));
          }
        });
      }
    }

    // Handle other event types
    if (event.type === 'envelope.expired') {
      await db.updateUserStatus(event.envelopeId, 'EXPIRED');
    }

    if (event.type === 'envelope.failed') {
      await db.updateUserStatus(event.envelopeId, 'FAILED');
    }

    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error: any) {
    console.error('Error processing webhook:', error);
    
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

// GET /api/webhooks/status - Simple health check endpoint
router.get('/status', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    activeConnections: connections.size,
    timestamp: new Date().toISOString()
  });
});

// Function to add WebSocket connections
export const addConnection = (connection: any) => {
  connections.add(connection);
  
  // Remove connection when it closes
  connection.on('close', () => {
    connections.delete(connection);
  });
};

export default router;
