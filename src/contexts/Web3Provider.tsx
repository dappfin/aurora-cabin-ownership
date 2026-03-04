import { type ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from '@/lib/wagmi';
import { KYCProvider } from './KYCContext';

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <KYCProvider>
        {children}
      </KYCProvider>
    </WagmiProvider>
  );
};
