import { useKYC } from '@/contexts/KYCContext';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ShieldX, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const KYCVerification = () => {
  const { isConnected } = useAccount();
  const { kycStatus, isKYCValid, isLoading, error, startVerification } = useKYC();

  if (!isConnected) return null;

  // Already verified
  if (isKYCValid) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 p-4 rounded-xl border border-primary/30 bg-primary/5"
      >
        <ShieldCheck className="h-5 w-5 text-primary" />
        <div>
          <p className="text-sm font-semibold text-primary">KYC Verified ✓</p>
          <p className="text-xs text-muted-foreground">Backend verification passed — you can now invest</p>
        </div>
      </motion.div>
    );
  }

  // Not verified — show Verify KYC button
  return (
    <div className="space-y-3">
      <Button
        variant="warm"
        className="w-full rounded-xl py-5"
        onClick={startVerification}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Checking Verification…
          </>
        ) : (
          <>
            <ShieldX className="mr-2 h-5 w-5" />
            Verify KYC
          </>
        )}
      </Button>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20"
        >
          <ShieldX className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-xs text-destructive">{error}</p>
        </motion.div>
      )}
    </div>
  );
};

export default KYCVerification;
