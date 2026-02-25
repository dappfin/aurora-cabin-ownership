import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import heroCabin from "@/assets/hero-cabin.png";
import Snowfall from "@/components/Snowfall";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={heroCabin}
          alt="Arctic cabin under the Northern Lights"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
      </div>

      <Snowfall />

      {/* Content */}
      <div className="relative z-20 container mx-auto px-6 text-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="aurora-text">Aurora Vault</span>
            <br />
            <span className="text-foreground">Secure Arctic Assets,</span>
            <br />
            <span className="text-foreground">Transparent Revenue</span>
          </h1>

          <p className="text-lg md:text-xl text-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Join an exclusive membership ecosystem backed by <span className="aurora-text">premium Arctic real estate</span>. Experience the fusion of <span className="aurora-text">transparent revenue participation</span>, priority booking access, and the future of <span className="aurora-text">RWA utility</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="aurora" size="lg" className="text-base px-8 py-6 rounded-xl">
              <Wallet className="mr-2 h-5 w-5" />
              Buy Bricks → Connect Wallet
            </Button>
            <Button variant="ghost-snow" size="lg" className="text-base px-8 py-6 rounded-xl">
              View Waitlist for Cabins 2 & 3
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
};

export default HeroSection;
