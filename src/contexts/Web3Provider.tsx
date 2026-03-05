import { type ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '@/lib/wagmi'; // Side-effect: createWeb3Modal runs on import
import { KYCProvider } from './KYCContext';

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <KYCProvider>
          {children}
        </KYCProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
