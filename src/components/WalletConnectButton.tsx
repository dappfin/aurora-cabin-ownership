import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';

const WalletConnectButton = () => {
  const { address, isConnected, chain } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [showConnectors, setShowConnectors] = useState(false);

  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 6)}…${addr.slice(-4)}`;

  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="aurora" size="sm" className="rounded-xl text-sm gap-2">
            <div className="h-2 w-2 rounded-full bg-primary-foreground animate-pulse" />
            {truncateAddress(address)}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="glass border-border">
          <DropdownMenuItem className="text-muted-foreground text-xs" disabled>
            {chain?.name || 'Unknown Chain'}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => disconnect()}
            className="text-destructive cursor-pointer"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="aurora"
        size="sm"
        className="rounded-xl text-sm"
        onClick={() => setShowConnectors(!showConnectors)}
        disabled={isPending}
      >
        <Wallet className="mr-2 h-4 w-4" />
        {isPending ? 'Connecting…' : 'Connect Wallet'}
      </Button>

      <AnimatePresence>
        {showConnectors && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-56 glass rounded-xl p-2 z-50"
          >
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => {
                  connect({ connector });
                  setShowConnectors(false);
                }}
                className="w-full text-left px-4 py-3 rounded-lg text-sm text-foreground hover:bg-secondary transition-colors flex items-center gap-3"
              >
                <div className="h-2 w-2 rounded-full bg-primary" />
                {connector.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WalletConnectButton;
