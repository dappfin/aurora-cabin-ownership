import { type ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi';
import { wagmiConfig, walletConnectProjectId } from '@/lib/wagmi';
import { KYCProvider } from './KYCContext';

const queryClient = new QueryClient();

createWeb3Modal({
  wagmiConfig,
  projectId: walletConnectProjectId,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#22c55e',
    '--w3m-border-radius-master': '1px',
  },
});

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
