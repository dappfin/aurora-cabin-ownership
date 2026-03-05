import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Info, ShieldCheck, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useKYC } from "@/contexts/KYCContext";
import KYCVerification from "./KYCVerification";

const PRICE_PER_KEY = 200;

// Placeholder contract config — replace with real values
const VAULT_CONTRACT_ADDRESS = import.meta.env.VITE_VAULT_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

const BrickPurchaseSection = () => {
  const [keyCount, setKeyCount] = useState(1);
  const { isConnected } = useAccount();
  const { isKYCValid, kycStatus } = useKYC();
  const [txState, setTxState] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

  const handleInvest = async () => {
    if (!isKYCValid) return;

    setTxState('pending');
    try {
      // Placeholder for real useWriteContract call:
      // const { writeContract } = useWriteContract();
      // await writeContract({
      //   address: VAULT_CONTRACT_ADDRESS as `0x${string}`,
      //   abi: VAULT_ABI,
      //   functionName: 'invest',
      //   args: [keyCount],
      //   value: parseEther(String(keyCount * PRICE_PER_KEY)),
      // });
      
      // Simulate for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTxState('success');
      setTimeout(() => setTxState('idle'), 3000);
    } catch (err) {
      console.error('Transaction error:', err);
      setTxState('error');
      setTimeout(() => setTxState('idle'), 3000);
    }
  };

  const buyButtonLabel = () => {
    switch (txState) {
      case 'pending': return 'Transaction Pending…';
      case 'success': return 'Transaction Successful!';
      case 'error': return 'Transaction Failed — Retry';
      default: return `Invest in ${keyCount} Key${keyCount > 1 ? "s" : ""}`;
    }
  };

  return (
    <section id="buy" className="py-24 px-6">
      <div className="container mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass rounded-2xl p-8 md:p-12"
        >
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground font-serif">
              Purchase Keys
            </h2>
          </div>
          <p className="text-muted-foreground mb-8">
            {isConnected
              ? isKYCValid
                ? 'KYC Verified ✓ — ready to invest.'
                : 'Complete KYC verification before purchase.'
              : 'Connect your wallet to get started.'}
          </p>

          {/* KYC Verification Gate */}
          {isConnected && !isKYCValid && (
            <div className="mb-8">
              <KYCVerification />
            </div>
          )}

          {/* Key selector */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Keys</span>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setKeyCount(Math.max(1, keyCount - 1))}
                  className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-2xl font-bold text-foreground w-12 text-center">
                  {keyCount}
                </span>
                <button
                  onClick={() => setKeyCount(keyCount + 1)}
                  className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="border-t border-border pt-4 flex items-center justify-between">
              <span className="text-muted-foreground">Price per key</span>
              <span className="text-foreground font-medium">${PRICE_PER_KEY}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-foreground">Total</span>
              <span className="text-2xl font-bold aurora-text">
                ${(keyCount * PRICE_PER_KEY).toLocaleString()}
              </span>
            </div>

            {/* Invest Button — gated behind KYC */}
            <Button
              variant="aurora"
              size="lg"
              className="w-full rounded-xl py-6 text-base"
              disabled={!isKYCValid || txState === 'pending'}
              onClick={handleInvest}
            >
              {txState === 'pending' && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {buyButtonLabel()}
            </Button>

            {/* Transaction feedback */}
            {txState === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20"
              >
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-sm text-primary font-medium">Transaction confirmed on Arbitrum</span>
              </motion.div>
            )}

            {txState === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20"
              >
                <Info className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive font-medium">Transaction failed — check wallet and try again</span>
              </motion.div>
            )}

            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                Funds held in Aurora Vault treasury until cabin purchase. Refunds manually processed within 24h — 90% guaranteed.
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BrickPurchaseSection;
