import { Info, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const RAISED = 142000;
const GOAL = 350000;
const MULTISIG_BALANCE = "142,000";

const TreasurySection = () => {
  const percent = Math.round((RAISED / GOAL) * 100);

  return (
    <section id="treasury" className="py-24 px-6">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground font-serif mb-3">
              Treasury & Transparency
            </h2>
            <p className="text-muted-foreground">
              All funds fully transparent and publicly verifiable.
            </p>
          </div>

          <div className="glass rounded-2xl p-8 md:p-10 space-y-8">
            {/* Progress */}
            <div>
              <div className="flex justify-between items-end mb-3">
                <div>
                  <p className="text-sm text-muted-foreground">Funds Raised</p>
                  <p className="text-2xl font-bold aurora-text">${RAISED.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Cabin Goal</p>
                  <p className="text-xl font-semibold text-foreground">${GOAL.toLocaleString()}</p>
                </div>
              </div>
              <Progress value={percent} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">{percent}% funded</p>
            </div>

            {/* Multisig */}
            <div className="flex items-center justify-between border-t border-border pt-6">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">Multisig Balance</span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    All funds allocated to cabin + infrastructure only. Publicly viewable on-chain.
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-foreground">${MULTISIG_BALANCE}</span>
                <a
                  href="#"
                  className="text-primary hover:text-primary/80 transition-colors"
                  aria-label="View on explorer"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TreasurySection;
