import { useKYC } from '@/contexts/KYCContext';
import { useAccount } from 'wagmi';
import { ShieldCheck, ShieldX } from 'lucide-react';

const ComplianceBadge = () => {
  const { isConnected } = useAccount();
  const { isKYCValid } = useKYC();

  if (!isConnected) return null;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
        isKYCValid
          ? 'bg-primary/15 text-primary border border-primary/30'
          : 'bg-destructive/15 text-destructive border border-destructive/30'
      }`}
    >
      {isKYCValid ? (
        <>
          <ShieldCheck className="h-3.5 w-3.5" />
          KYC Verified
        </>
      ) : (
        <>
          <ShieldX className="h-3.5 w-3.5" />
          Unverified
        </>
      )}
    </div>
  );
};

export default ComplianceBadge;
