import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plane, Hotel, Car, ArrowRight, Shield, Coins, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const TravelCrypto = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 glass"
      >
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="aurora-text font-serif text-xl font-bold">
            Aurora Vault
          </Link>
          <Link to="/">
            <Button variant="ghost-snow" size="sm" className="rounded-xl">
              ← Back to Home
            </Button>
          </Link>
        </div>
      </motion.nav>

      {/* Hero */}
      <main className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          {/* Travel Icons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-8 mb-12"
          >
            {[
              { icon: Plane, label: "Flights" },
              { icon: Hotel, label: "Hotels" },
              { icon: Car, label: "Car Rental" },
            ].map(({ icon: Icon, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.15 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center border border-primary/20">
                  <Icon className="w-7 h-7 text-primary" strokeWidth={1.5} />
                </div>
                <span className="text-xs text-muted-foreground font-medium">{label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold font-serif leading-tight mb-6"
          >
            <span className="text-foreground">Travel Anywhere.</span>
            <br />
            <span className="aurora-text drop-shadow-[0_0_24px_hsl(160_60%_45%/0.4)]">
              Pay with Crypto.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Book flights, hotels, and rental cars worldwide using your crypto wallet —{" "}
            <span className="text-foreground font-medium">secure, simple, and trusted.</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
          >
            <Button
              variant="aurora"
              size="lg"
              className="rounded-2xl px-10 py-6 text-base gap-3 hover:shadow-[0_0_40px_hsl(160_60%_45%/0.3)] transition-all duration-500"
            >
              Start Booking
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost-snow"
              size="lg"
              className="rounded-2xl px-10 py-6 text-base"
            >
              Learn More
            </Button>
          </motion.div>

          {/* Micro Trust Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground"
          >
            {[
              { icon: Globe, text: "Trusted global travel platform" },
              { icon: Coins, text: "BTC, ETH, USDT & 90+ cryptos" },
              { icon: Shield, text: "Secure booking experience" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-primary/70" strokeWidth={1.5} />
                <span>{text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default TravelCrypto;
