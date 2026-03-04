import { ethers } from 'ethers';
import { PermissionSignature, EIP712Domain } from '../types';

export class Web3Service {
  private wallet: ethers.Wallet;
  private provider: ethers.Provider;

  constructor() {
    const privateKey = process.env.PRIVATE_KEY;
    const rpcUrl = process.env.RPC_URL || 'https://mainnet.aurora.dev';

    if (!privateKey) {
      throw new Error('PRIVATE_KEY environment variable is required');
    }

    this.wallet = new ethers.Wallet(privateKey);
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet.connect(this.provider);
  }

  async signPermission(
    walletAddress: string,
    envelopeId: string,
    contractAddress: string
  ): Promise<PermissionSignature> {
    const domain: EIP712Domain = {
      name: 'Aurora Vault RWA',
      version: '1',
      chainId: 1313161554, // Aurora Mainnet
      verifyingContract: contractAddress
    };

    const types = {
      Permission: [
        { name: 'user', type: 'address' },
        { name: 'envelopeId', type: 'string' },
        { name: 'timestamp', type: 'uint256' }
      ]
    };

    const value = {
      user: walletAddress,
      envelopeId: envelopeId,
      timestamp: Math.floor(Date.now() / 1000)
    };

    const signature = await this.wallet.signTypedData(domain, types, value);

    return {
      domain,
      types,
      value,
      signature
    };
  }

  verifyPermission(
    signature: PermissionSignature,
    expectedAddress: string
  ): boolean {
    try {
      const recoveredAddress = ethers.verifyTypedData(
        signature.domain,
        signature.types,
        signature.value,
        signature.signature
      );

      return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    } catch (error) {
      console.error('Error verifying permission signature:', error);
      return false;
    }
  }

  getWalletAddress(): string {
    return this.wallet.address;
  }

  async getTransactionReceipt(txHash: string): Promise<ethers.TransactionReceipt | null> {
    try {
      return await this.provider.getTransactionReceipt(txHash);
    } catch (error) {
      console.error('Error fetching transaction receipt:', error);
      return null;
    }
  }
}
