import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useAccount } from 'wagmi';

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';
const AUTHENSURE_APP_URL = import.meta.env.VITE_AUTHENSURE_APP_URL || 'https://app.authensure.app';

type KYCStatus = 'disconnected' | 'unverified' | 'valid' | 'not_valid';

interface KYCContextType {
  kycStatus: KYCStatus;
  isKYCValid: boolean;
  isLoading: boolean;
  error: string | null;
  startVerification: () => void;
  checkKYCStatus: () => Promise<void>;
  resetKYC: () => void;
}

const KYCContext = createContext<KYCContextType | null>(null);

const defaultKYC: KYCContextType = {
  kycStatus: 'disconnected',
  isKYCValid: false,
  isLoading: false,
  error: null,
  startVerification: () => {},
  checkKYCStatus: async () => {},
  resetKYC: () => {},
};

export const useKYC = () => {
  const ctx = useContext(KYCContext);
  return ctx ?? defaultKYC;
};

export const KYCProvider = ({ children }: { children: ReactNode }) => {
  const { address, isConnected } = useAccount();
  const [kycStatus, setKycStatus] = useState<KYCStatus>('disconnected');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isKYCValid = kycStatus === 'valid';

  // Call backend to check KYC status — backend handles Merkle/zkProof verification
  const checkKYCStatus = useCallback(async () => {
    if (!address) {
      setKycStatus(isConnected ? 'unverified' : 'disconnected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${BACKEND_API_URL}/api/kyc-status?wallet=${address}`);

      if (!res.ok) {
        throw new Error(`KYC check failed [${res.status}]`);
      }

      const data: { status: 'valid' | 'not_valid' } = await res.json();
      setKycStatus(data.status);
    } catch (err) {
      console.error('KYC status check error:', err);
      setError(err instanceof Error ? err.message : 'Failed to check KYC status');
      setKycStatus('not_valid');
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected]);

  // Open AuthEnsure verification flow, then poll backend for result
  const startVerification = useCallback(() => {
    if (!address) return;

    // Open AuthEnsure app in new tab — user completes verification there
    const verifyUrl = `${AUTHENSURE_APP_URL}/verify?wallet=${address}`;
    window.open(verifyUrl, '_blank', 'noopener,noreferrer');

    // Start polling backend for status after user is redirected
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND_API_URL}/api/kyc-status?wallet=${address}`);
        if (res.ok) {
          const data: { status: 'valid' | 'not_valid' } = await res.json();
          if (data.status === 'valid') {
            setKycStatus('valid');
            clearInterval(pollInterval);
          }
        }
      } catch {
        // silently retry
      }
    }, 5000);

    // Stop polling after 5 minutes
    setTimeout(() => clearInterval(pollInterval), 5 * 60 * 1000);

    setKycStatus('not_valid');
  }, [address]);

  // Check status when wallet connects/changes
  useEffect(() => {
    if (isConnected && address) {
      checkKYCStatus();
    } else {
      setKycStatus('disconnected');
    }
  }, [address, isConnected, checkKYCStatus]);

  const resetKYC = () => {
    setKycStatus(isConnected ? 'unverified' : 'disconnected');
    setError(null);
  };

  return (
    <KYCContext.Provider
      value={{ kycStatus, isKYCValid, isLoading, error, startVerification, checkKYCStatus, resetKYC }}
    >
      {children}
    </KYCContext.Provider>
  );
};
