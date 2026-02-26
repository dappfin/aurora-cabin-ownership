import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plane, Hotel, Car, ArrowRight, Shield, Coins, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const TravelCrypto = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/8 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

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
      <main className="pt-36 pb-24 px-6 flex items-center justify-center min-h-screen">
        <div className="container mx-auto max-w-5xl text-center">
          {/* Travel Icons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-10 md:gap-14 mb-14"
          >
            {[
              { icon: Plane, label: "Flights", color: "text-primary" },
              { icon: Hotel, label: "Hotels", color: "text-accent" },
              { icon: Car, label: "Car Rental", color: "text-primary" },
            ].map(({ icon: Icon, label, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.15 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl glass flex items-center justify-center border border-primary/30 shadow-[0_0_20px_hsl(160_60%_45%/0.15)] hover:shadow-[0_0_30px_hsl(160_60%_45%/0.25)] transition-all duration-500">
                  <Icon className={`w-9 h-9 md:w-11 md:h-11 ${color}`} strokeWidth={1.5} />
                </div>
                <span className="text-sm md:text-base text-foreground/80 font-semibold tracking-wide">{label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold font-serif leading-tight mb-8"
          >
            <span className="text-foreground drop-shadow-[0_0_20px_hsl(210_20%_92%/0.15)]">Travel Anywhere.</span>
            <br />
            <span className="aurora-text drop-shadow-[0_0_30px_hsl(160_60%_45%/0.5)]">
              Pay with Crypto.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="text-xl md:text-2xl text-foreground/70 max-w-3xl mx-auto mb-14 leading-relaxed"
          >
            Book flights, hotels, and rental cars worldwide using your crypto wallet —{" "}
            <span className="text-foreground font-semibold">secure, simple, and trusted.</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-14"
          >
            <a href="https://www.travala.com/ref/EGSPNL" target="_blank" rel="noopener noreferrer">
              <Button
                variant="aurora"
                size="lg"
                className="rounded-2xl px-12 py-7 text-lg gap-3 shadow-[0_0_30px_hsl(160_60%_45%/0.25)] hover:shadow-[0_0_50px_hsl(160_60%_45%/0.4)] hover:scale-105 transition-all duration-500"
              >
                Start Booking
                <ArrowRight className="w-6 h-6" />
              </Button>
            </a>
            <Button
              variant="ghost-snow"
              size="lg"
              className="rounded-2xl px-12 py-7 text-lg hover:bg-foreground/10 transition-all duration-300"
            >
              Learn More
            </Button>
          </motion.div>

          {/* Micro Trust Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-8 text-base text-foreground/60"
          >
            {[
              { icon: Globe, text: "Trusted global travel platform" },
              { icon: Coins, text: "BTC, ETH, USDT & 90+ cryptos" },
              { icon: Shield, text: "Secure booking experience" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5">
                <Icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                <span className="font-medium">{text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default TravelCrypto;
