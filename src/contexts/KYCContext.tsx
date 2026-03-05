import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { useAccount } from 'wagmi';

// Only attempt backend calls if a real URL is configured (not localhost fallback)
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || '';
const AUTHENSURE_APP_URL = import.meta.env.VITE_AUTHENSURE_APP_URL || 'https://app.authensure.app';
const hasBackend = BACKEND_API_URL.length > 0;

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
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isKYCValid = kycStatus === 'valid';

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // Call backend to check KYC status
  const checkKYCStatus = useCallback(async () => {
    if (!address) {
      setKycStatus(isConnected ? 'unverified' : 'disconnected');
      return;
    }

    if (!hasBackend) {
      // No backend configured — stay unverified, no network calls
      setKycStatus('unverified');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${BACKEND_API_URL}/api/kyc-status?wallet=${address}`);

      if (!res.ok) {
        throw new Error(`KYC check failed [${res.status}]`);
      }

      const contentType = res.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('Backend returned non-JSON response');
      }

      const data: { status: 'valid' | 'not_valid' } = await res.json();
      setKycStatus(data.status);
    } catch (err) {
      console.error('KYC status check error:', err);
      setError(err instanceof Error ? err.message : 'Failed to check KYC status');
      setKycStatus('unverified');
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected]);

  // Open AuthEnsure verification flow, then poll backend for result
  const startVerification = useCallback(() => {
    if (!address) return;

    // Open AuthEnsure app in new tab
    const verifyUrl = `${AUTHENSURE_APP_URL}/verify?wallet=${address}`;
    window.open(verifyUrl, '_blank', 'noopener,noreferrer');

    if (!hasBackend) {
      setError('Backend not configured — set VITE_BACKEND_API_URL to enable KYC verification');
      return;
    }

    // Clear any existing poll
    if (pollRef.current) clearInterval(pollRef.current);

    // Poll backend for status (every 10s, max 5 min)
    let elapsed = 0;
    pollRef.current = setInterval(async () => {
      elapsed += 10000;
      if (elapsed > 5 * 60 * 1000) {
        if (pollRef.current) clearInterval(pollRef.current);
        return;
      }
      try {
        const res = await fetch(`${BACKEND_API_URL}/api/kyc-status?wallet=${address}`);
        if (res.ok) {
          const data: { status: 'valid' | 'not_valid' } = await res.json();
          if (data.status === 'valid') {
            setKycStatus('valid');
            setError(null);
            if (pollRef.current) clearInterval(pollRef.current);
          }
        }
      } catch {
        // silently retry
      }
    }, 10000);
  }, [address]);

  // Check status when wallet connects/changes
  useEffect(() => {
    if (isConnected && address) {
      checkKYCStatus();
    } else {
      setKycStatus('disconnected');
      if (pollRef.current) clearInterval(pollRef.current);
    }
  }, [address, isConnected, checkKYCStatus]);

  const resetKYC = () => {
    setKycStatus(isConnected ? 'unverified' : 'disconnected');
    setError(null);
    if (pollRef.current) clearInterval(pollRef.current);
  };

  return (
    <KYCContext.Provider
      value={{ kycStatus, isKYCValid, isLoading, error, startVerification, checkKYCStatus, resetKYC }}
    >
      {children}
    </KYCContext.Provider>
  );
};
