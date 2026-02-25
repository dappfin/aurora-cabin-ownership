import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Navbar = () => (
  <motion.nav
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="fixed top-0 left-0 right-0 z-50 glass"
  >
    <div className="container mx-auto px-6 h-16 flex items-center justify-between">
      <span className="aurora-text font-serif text-xl font-bold">Aurora Vault</span>
      <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
        <a href="#buy" className="hover:text-foreground transition-colors">Buy Bricks</a>
        <a href="#treasury" className="hover:text-foreground transition-colors">Treasury</a>
        <a href="#waitlist" className="hover:text-foreground transition-colors">Waitlist</a>
      </div>
      <Button variant="aurora" size="sm" className="rounded-xl">
        Connect Wallet
      </Button>
    </div>
  </motion.nav>
);

export default Navbar;
