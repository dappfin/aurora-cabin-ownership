import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Info, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

const RefundSection = () => {
  const [showModal, setShowModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const handleRefund = () => {
    setShowModal(true);
    setDone(false);
    setProgress(0);
    let p = 0;
    const interval = setInterval(() => {
      p += 15;
      setProgress(Math.min(p, 100));
      if (p >= 100) {
        clearInterval(interval);
        setDone(true);
      }
    }, 400);
  };

  return (
    <section className="py-16 px-6">
      <div className="container mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass rounded-2xl p-10 border border-accent/30 shadow-[0_0_40px_hsl(35_80%_55%/0.15),0_0_80px_hsl(160_60%_45%/0.08)]"
        >
          <RotateCcw className="h-10 w-10 text-accent mx-auto mb-5" />
          <h2 className="text-2xl md:text-3xl font-bold text-foreground font-serif mb-2">Request Refund</h2>
          <h3 className="text-lg font-semibold aurora-text mb-6">Our Refund &amp; Protection Policy</h3>

          <div className="text-left max-w-xl mx-auto space-y-4 mb-8">
            <p className="text-foreground text-sm leading-relaxed">
              We prioritize the safety of your capital over automated speed. To protect our members from wallet compromises or unauthorized withdrawals, all refunds are subject to <span className="aurora-text font-semibold">Manual Identity Verification</span>.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <p className="text-foreground text-sm">
                  <span className="font-semibold text-accent">24-Hour Processing:</span> Once requested, our team verifies the rightful owner and processes the refund within 24 hours.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-foreground text-sm">
                  <span className="font-semibold text-primary">Flexible Exit:</span> You may request a refund at any point prior to the final cabin purchase.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <p className="text-foreground text-sm">
                  <span className="font-semibold text-accent">Terms:</span> 90% of the contribution is returned to the original source, with 10% retained to cover ecosystem setup and administrative costs.
                </p>
              </div>
            </div>
          </div>

          <Button variant="warm" className="rounded-xl px-8" onClick={handleRefund}>
            Request Refund
          </Button>
        </motion.div>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="glass border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground font-serif">
              {done ? "Refund Submitted" : "Processing Refund…"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {done
                ? "Your refund request has been received. You'll be notified once processed."
                : "Please wait while we process your refund request."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {done ? (
              <div className="flex items-center justify-center gap-2 text-primary">
                <CheckCircle className="h-6 w-6" />
                <span className="font-medium">Complete</span>
              </div>
            ) : (
              <Progress value={progress} className="h-2" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default RefundSection;
