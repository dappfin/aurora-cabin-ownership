import { useKYC } from '@/contexts/KYCContext';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Clock, AlertTriangle, Loader2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const KYCVerification = () => {
  const { isConnected } = useAccount();
  const { kycStatus, isLoading, error, startVerification, signingUrl } = useKYC();

  if (!isConnected) return null;

  if (kycStatus === 'approved') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 p-4 rounded-xl border border-primary/30 bg-primary/5"
      >
        <ShieldCheck className="h-5 w-5 text-primary" />
        <div>
          <p className="text-sm font-semibold text-primary">Identity Verified</p>
          <p className="text-xs text-muted-foreground">Authensure KYC approved — you can now invest</p>
        </div>
      </motion.div>
    );
  }

  if (kycStatus === 'pending') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 p-4 rounded-xl border border-accent/30 bg-accent/5"
      >
        <Clock className="h-5 w-5 text-accent animate-pulse" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-accent">Verification in Progress</p>
          <p className="text-xs text-muted-foreground">Waiting for signature completion…</p>
        </div>
        {signingUrl && (
          <Button
            variant="ghost-snow"
            size="sm"
            onClick={() => window.open(signingUrl, '_blank', 'noopener,noreferrer')}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Resume
          </Button>
        )}
      </motion.div>
    );
  }

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
            Creating Secure Envelope…
          </>
        ) : (
          <>
            <ShieldCheck className="mr-2 h-5 w-5" />
            Verify Identity with Authensure
          </>
        )}
      </Button>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20"
        >
          <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-xs text-destructive">{error}</p>
        </motion.div>
      )}
    </div>
  );
};

export default KYCVerification;
