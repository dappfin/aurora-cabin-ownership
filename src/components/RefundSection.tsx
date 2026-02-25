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
          className="glass rounded-2xl p-8 text-center"
        >
          <RotateCcw className="h-8 w-8 text-accent mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground font-serif mb-2">Request Refund</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
            One brick per investor refunded instantly; larger requests handled within 24h for security and rightful ownership.
          </p>
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
