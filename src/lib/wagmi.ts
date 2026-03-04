import { createConfig, http } from 'wagmi';
import { arbitrum, aurora } from 'wagmi/chains';
import { injected, walletConnect, coinbaseWallet } from '@wagmi/connectors';

const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;

if (!WALLETCONNECT_PROJECT_ID) {
  throw new Error('VITE_WALLET_CONNECT_PROJECT_ID is not set in environment variables');
}

export const wagmiConfig = createConfig({
  chains: [arbitrum, aurora],
  connectors: [
    injected(),
    walletConnect({
      projectId: WALLETCONNECT_PROJECT_ID,
      metadata: {
        name: 'Aurora Vault',
        description: 'Aurora Vault — Arctic Investment Platform',
        url: window.location.origin,
        icons: [`${window.location.origin}/favicon.ico`],
      },
    }),
    coinbaseWallet({
      appName: 'Aurora Vault',
    }),
  ],
  transports: {
    [arbitrum.id]: http(),
    [aurora.id]: http(),
  },
});
