import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, Minus, Plus, Info, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PRICE_PER_KEY = 200;

const BrickPurchaseSection = () => {
  const [keyCount, setKeyCount] = useState(1);

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
            Authensure verification required before purchase.
          </p>

          {/* Wallet connect placeholder */}
          <Button variant="aurora" className="w-full rounded-xl mb-8 py-5">
            <Wallet className="mr-2 h-5 w-5" />
            Connect Wallet
          </Button>

          {/* Brick selector */}
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

            <Button variant="aurora" size="lg" className="w-full rounded-xl py-6 text-base">
              Buy {keyCount} Key{keyCount > 1 ? "s" : ""}
            </Button>

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
