import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { toast } from "sonner";

const WaitlistSection = () => {
  const [email, setEmail] = useState("");
  const [wallet, setWallet] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("You're on the waitlist! We'll be in touch.");
    setEmail("");
    setWallet("");
  };

  return (
    <section id="waitlist" className="py-24 px-6">
      <div className="container mx-auto max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground font-serif mb-3">
              Waitlist — Cabins 2 & 3
            </h2>
            <p className="text-muted-foreground">
              Early participants secure first access to next cabins.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="glass rounded-2xl p-8 space-y-5"
          >
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Email</label>
              <Input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Wallet Address</label>
              <Input
                placeholder="0x..."
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                className="rounded-xl bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Interest Level</label>
              <select
                className="w-full h-10 rounded-xl bg-secondary border border-border text-foreground px-3 text-sm"
                defaultValue=""
              >
                <option value="" disabled>Select interest level</option>
                <option value="high">High — Ready to invest</option>
                <option value="medium">Medium — Interested, need more info</option>
                <option value="low">Low — Just exploring</option>
              </select>
            </div>
            <Button type="submit" variant="aurora" className="w-full rounded-xl py-5 text-base">
              Join Waitlist
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default WaitlistSection;
