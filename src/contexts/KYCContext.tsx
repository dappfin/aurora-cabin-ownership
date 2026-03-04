import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useAccount } from 'wagmi';

// ⚠️ SECURITY WARNING: In production, move all Authensure API calls
// to a backend/edge function. The sk_live_ key must NOT be in frontend code.
const AUTHENSURE_API_URL = 'https://api.authensure.app';
const AUTHENSURE_API_KEY = import.meta.env.VITE_AUTHESURE_API_KEY || '';

type KYCStatus = 'disconnected' | 'unverified' | 'pending' | 'approved' | 'rejected';

interface KYCContextType {
  kycStatus: KYCStatus;
  isKYCValid: boolean;
  envelopeId: string | null;
  signingUrl: string | null;
  isLoading: boolean;
  error: string | null;
  checkKYCStatus: () => Promise<void>;
  startVerification: () => Promise<void>;
  resetKYC: () => void;
}

const KYCContext = createContext<KYCContextType | null>(null);

export const useKYC = () => {
  const ctx = useContext(KYCContext);
  if (!ctx) throw new Error('useKYC must be used within KYCProvider');
  return ctx;
};

export const KYCProvider = ({ children }: { children: ReactNode }) => {
  const { address, isConnected } = useAccount();
  const [kycStatus, setKycStatus] = useState<KYCStatus>('disconnected');
  const [envelopeId, setEnvelopeId] = useState<string | null>(null);
  const [signingUrl, setSigningUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isKYCValid = kycStatus === 'approved';

  // Check KYC status for connected wallet
  const checkKYCStatus = useCallback(async () => {
    if (!address || !AUTHENSURE_API_KEY) {
      setKycStatus(isConnected ? 'unverified' : 'disconnected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // ⚠️ In production, proxy this through your backend
      const res = await fetch(`${AUTHENSURE_API_URL}/envelopes?wallet=${address}`, {
        headers: {
          'Authorization': `Bearer ${AUTHENSURE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        // If no envelope found, user is unverified
        if (res.status === 404) {
          setKycStatus('unverified');
          return;
        }
        throw new Error(`KYC check failed [${res.status}]`);
      }

      const data = await res.json();
      
      // Map Authensure envelope status to our KYC status
      if (data?.status === 'envelope.completed') {
        setKycStatus('approved');
      } else if (data?.status === 'envelope.sent' || data?.status === 'envelope.viewed') {
        setKycStatus('pending');
        setEnvelopeId(data.id);
      } else {
        setKycStatus('unverified');
      }
    } catch (err) {
      console.error('KYC status check error:', err);
      setError(err instanceof Error ? err.message : 'Failed to check KYC status');
      setKycStatus('unverified');
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected]);

  // Start the Authensure verification flow
  const startVerification = useCallback(async () => {
    if (!address || !AUTHENSURE_API_KEY) {
      setError('Wallet not connected or API key missing');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // ⚠️ In production, proxy this through your backend
      const res = await fetch(`${AUTHENSURE_API_URL}/envelopes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AUTHENSURE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `Aurora Vault KYC - ${address}`,
          metadata: {
            walletAddress: address,
            platform: 'aurora-vault',
            chain: 'arbitrum',
          },
          // Template and signer configuration — adjust to your Authensure setup
          signers: [
            {
              role: 'investor',
              metadata: { walletAddress: address },
            },
          ],
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(`Envelope creation failed [${res.status}]: ${JSON.stringify(errData)}`);
      }

      const data = await res.json();
      setEnvelopeId(data.id);
      setSigningUrl(data.signing_url || data.url || null);
      setKycStatus('pending');

      // Open signing URL in new tab if available
      if (data.signing_url || data.url) {
        window.open(data.signing_url || data.url, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      console.error('Verification start error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start verification');
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  // Poll for status updates when pending
  useEffect(() => {
    if (kycStatus !== 'pending' || !envelopeId || !AUTHENSURE_API_KEY) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`${AUTHENSURE_API_URL}/envelopes/${envelopeId}`, {
          headers: {
            'Authorization': `Bearer ${AUTHENSURE_API_KEY}`,
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.status === 'envelope.completed') {
            setKycStatus('approved');
            clearInterval(pollInterval);
          }
        }
      } catch (err) {
        console.error('Status poll error:', err);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [kycStatus, envelopeId]);

  // Re-check status when wallet changes
  useEffect(() => {
    if (isConnected && address) {
      checkKYCStatus();
    } else {
      setKycStatus('disconnected');
      setEnvelopeId(null);
      setSigningUrl(null);
    }
  }, [address, isConnected, checkKYCStatus]);

  const resetKYC = () => {
    setKycStatus(isConnected ? 'unverified' : 'disconnected');
    setEnvelopeId(null);
    setSigningUrl(null);
    setError(null);
  };

  return (
    <KYCContext.Provider
      value={{
        kycStatus,
        isKYCValid,
        envelopeId,
        signingUrl,
        isLoading,
        error,
        checkKYCStatus,
        startVerification,
        resetKYC,
      }}
    >
      {children}
    </KYCContext.Provider>
  );
};
