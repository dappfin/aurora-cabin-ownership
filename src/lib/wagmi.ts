import { createConfig, http } from 'wagmi';
import { arbitrum } from 'wagmi/chains';
import { walletConnect, injected, coinbaseWallet } from '@wagmi/connectors';
import { createWeb3Modal } from '@web3modal/wagmi';

const projectId = 'd93ecd859d8e0c7872c34ddb15209e54';

export const wagmiConfig = createConfig({
  chains: [arbitrum],
  connectors: [
    walletConnect({
      projectId,
      metadata: {
        name: 'Aurora Vault',
        description: 'Aurora Vault — Arctic Investment Platform',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://auroravault.app',
        icons: [typeof window !== 'undefined' ? `${window.location.origin}/favicon.ico` : ''],
      },
    }),
    injected(),
    coinbaseWallet({ appName: 'Aurora Vault' }),
  ],
  transports: {
    [arbitrum.id]: http(),
  },
});

// Initialize Web3Modal IMMEDIATELY after config creation
createWeb3Modal({
  wagmiConfig,
  projectId,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#22c55e',
    '--w3m-border-radius-master': '1px',
  },
});
