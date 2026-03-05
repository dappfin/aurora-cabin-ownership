import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const WalletConnectButton = () => {
  const { address, isConnected, chain } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="aurora"
          size="sm"
          className="rounded-xl text-sm"
          disabled={isPending}
        >
          <Wallet className="mr-2 h-4 w-4" />
          {isPending ? 'Connecting…' : 'Connect Wallet'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="glass border-border min-w-[200px]">
        {connectors.map((connector) => (
          <DropdownMenuItem
            key={connector.uid}
            onClick={() => connect({ connector })}
            className="cursor-pointer flex items-center gap-3"
          >
            <div className="h-2 w-2 rounded-full bg-primary" />
            {connector.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WalletConnectButton;
