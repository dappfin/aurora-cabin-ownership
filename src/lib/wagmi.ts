import { createConfig, http } from 'wagmi';
import { arbitrum } from 'wagmi/chains';
import { walletConnect, injected, coinbaseWallet } from '@wagmi/connectors';

const projectId = 'd93ecd859d8e0c7872c34ddb15209e54';

export const wagmiConfig = createConfig({
  chains: [arbitrum],
  connectors: [
    walletConnect({
      projectId,
      metadata: {
        name: 'Aurora Vault',
        description: 'Aurora Vault — Arctic Investment Platform',
        url: window.location.origin,
        icons: [`${window.location.origin}/favicon.ico`],
      },
    }),
    injected(),
    coinbaseWallet({ appName: 'Aurora Vault' }),
  ],
  transports: {
    [arbitrum.id]: http(),
  },
});

export const walletConnectProjectId = projectId;
