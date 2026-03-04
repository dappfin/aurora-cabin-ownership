import { motion } from "framer-motion";
import WalletConnectButton from "./WalletConnectButton";
import ComplianceBadge from "./ComplianceBadge";

const Navbar = () => (
  <motion.nav
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="fixed top-0 left-0 right-0 z-50 glass"
  >
    <div className="container mx-auto px-6 h-18 flex items-center justify-between">
      <span className="aurora-text font-serif text-2xl md:text-3xl font-bold drop-shadow-[0_0_20px_hsl(160_60%_45%/0.4)]">Aurora Vault</span>
      <div className="hidden md:flex items-center gap-8 text-base font-semibold">
        <a href="#buy" className="text-primary hover:text-primary/80 transition-colors">Buy Keys</a>
        <a href="#treasury" className="text-accent hover:text-accent/80 transition-colors">Treasury</a>
        <a href="#waitlist" className="text-foreground hover:text-primary transition-colors">Waitlist</a>
        <a href="/travel" className="aurora-text hover:opacity-80 transition-opacity">Travel</a>
      </div>
      <div className="flex items-center gap-3">
        <ComplianceBadge />
        <WalletConnectButton />
      </div>
    </div>
  </motion.nav>
);

export default Navbar;
