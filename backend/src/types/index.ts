export interface KYCSessionRequest {
  walletAddress: string;
}

export interface KYCSessionResponse {
  signing_url: string;
  envelopeId: string;
}

export interface KYCStatusResponse {
  envelopeId: string;
  status: 'pending' | 'completed' | 'expired' | 'failed';
  walletAddress?: string;
  completedAt?: string;
}

export interface WebhookEvent {
  type: string;
  envelopeId: string;
  data: any;
  timestamp: string;
}

export interface DatabaseUser {
  id?: number;
  walletAddress: string;
  envelopeId: string;
  status: 'PENDING' | 'VERIFIED' | 'EXPIRED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface EIP712Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
}

export interface PermissionSignature {
  domain: EIP712Domain;
  types: any;
  value: any;
  signature: string;
}
