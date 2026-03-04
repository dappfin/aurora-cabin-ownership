import axios from 'axios';
import { KYCSessionRequest, KYCSessionResponse, KYCStatusResponse } from '../types';

export class AuthensureService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.AUTHESURE_API_KEY!;
    this.baseUrl = process.env.AUTHESURE_BASE_URL || 'https://api.authensure.app';
  }

  async createKYCSession(request: KYCSessionRequest): Promise<KYCSessionResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/envelopes`,
        {
          templateId: 'aurora-vault-participation-agreement',
          data: {
            walletAddress: request.walletAddress,
            timestamp: new Date().toISOString(),
            agreementType: 'RWA Investment'
          },
          settings: {
            redirectUrl: `${process.env.FRONTEND_URL}/kyc/completed`,
            webhookUrl: `${process.env.FRONTEND_URL}/api/webhooks/authensure`
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        signing_url: response.data.signing_url,
        envelopeId: response.data.id
      };
    } catch (error: any) {
      console.error('Error creating KYC session:', error.response?.data || error.message);
      throw new Error('Failed to create KYC session');
    }
  }

  async getKYCStatus(envelopeId: string): Promise<KYCStatusResponse> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/envelopes/${envelopeId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        envelopeId: response.data.id,
        status: response.data.status,
        walletAddress: response.data.data?.walletAddress,
        completedAt: response.data.completedAt
      };
    } catch (error: any) {
      console.error('Error fetching KYC status:', error.response?.data || error.message);
      throw new Error('Failed to fetch KYC status');
    }
  }

  async createEnvelopeWithTemplate(
    walletAddress: string,
    templateId: string,
    customData?: Record<string, any>
  ): Promise<KYCSessionResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/envelopes`,
        {
          templateId,
          data: {
            walletAddress,
            timestamp: new Date().toISOString(),
            ...customData
          },
          settings: {
            redirectUrl: `${process.env.FRONTEND_URL}/kyc/completed`,
            webhookUrl: `${process.env.FRONTEND_URL}/api/webhooks/authensure`
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        signing_url: response.data.signing_url,
        envelopeId: response.data.id
      };
    } catch (error: any) {
      console.error('Error creating envelope with template:', error.response?.data || error.message);
      throw new Error('Failed to create envelope with template');
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const crypto = require('crypto');
    const secret = process.env.WEBHOOK_SECRET;
    
    if (!secret) {
      console.error('WEBHOOK_SECRET not configured');
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }
}
