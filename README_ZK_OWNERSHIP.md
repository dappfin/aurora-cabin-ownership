# Aurora Vault ZK-Proof Ownership System

A sophisticated zero-knowledge proof system for Aurora Vault Keys that provides privacy, prevents double-spending, and enables partial refunds.

## 🔐 **Core Architecture**

### **ZK-Circuit** (`circuits/merkle_proof.circom`)
- **Merkle Tree Verification**: Proves knowledge of a valid leaf in Merkle tree
- **Nullifier System**: Unique hash to prevent double-spending/double-refunding
- **Poseidon Hashing**: Efficient cryptographic hashing for ZK proofs
- **Public Inputs**: Root, nullifier, path elements, path indices
- **Private Inputs**: Secret, nullifier, leaf secret, leaf nullifier

### **Enhanced Database Schema** (`database/zk_enhanced.ts`)
```sql
CREATE TABLE keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wallet_address TEXT NOT NULL,           -- Track owner wallet
  commitment_hash TEXT UNIQUE NOT NULL,   -- Commitment identifier
  nullifier_hash TEXT UNIQUE NOT NULL,  -- Nullifier for double-spend protection
  is_spent BOOLEAN DEFAULT FALSE,      -- Spent status tracking
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### **Backend Services** (`services/zk.ts`)
- **ZKService**: Circuit compilation, proof generation, and verification
- **ZKEnhancedDatabase**: Enhanced database operations with wallet tracking
- **Commitment Generation**: Cryptographically secure random secrets and nullifiers

## 🎯 **Key Features**

### **Privacy & Security**
- ✅ **Zero-Knowledge Proofs**: Ownership without revealing secrets
- ✅ **Nullifier System**: Prevents double-spending attacks
- ✅ **Partial Refunds**: Refund individual keys without affecting others
- ✅ **Wallet Tracking**: Associate keys with owner wallet addresses
- ✅ **On-Chain Verification**: Smart contract integration for ZK proofs

### **User Experience**
- ✅ **Granular Control**: Own and refund specific keys
- ✅ **Real-time Balance**: Live unspent key count per wallet
- ✅ **Privacy-Preserving**: No public exposure of sensitive data
- ✅ **Efficient**: Optimized database queries with proper indexing

## 📊 **API Endpoints**

### **Ownership & Balance**
- `GET /api/keys/balance/:walletAddress` - Get unspent key count
- `POST /api/keys/generate-commitment` - Create new key commitment
- `POST /api/keys/verify-ownership` - Verify ZK proof of ownership
- `POST /api/keys/execute-refund` - Execute partial refund with nullifier proof

### **Enhanced Features**
- **Wallet Address Tracking**: All operations tied to specific wallets
- **Nullifier Hashing**: SHA-256 based nullifier generation and tracking
- **Partial Refunds**: Refund individual keys with ZK proof verification
- **Statistics**: Comprehensive tracking and reporting

## 🔄 **Workflow Examples**

### **Key Generation & Purchase**
```javascript
// 1. Generate commitment
const response = await fetch('/api/keys/generate-commitment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ merkleIndex: 0 })
});

// 2. User generates ZK proof (frontend)
const proof = await zkService.generateProof(witness);

// 3. Verify ownership (backend)
const verification = await fetch('/api/keys/verify-ownership', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ commitment, proof, merkleProof })
});
```

### **Partial Refund Process**
```javascript
// 1. Generate nullifier proof for specific key
const nullifierProof = await zkService.generateProof({
  // Witness data for the specific key to refund
  root: currentMerkleRoot,
  nullifier: key.nullifier,
  secret: key.secret,
  // ... other witness data
});

// 2. Execute refund with ZK proof
const refund = await fetch('/api/keys/execute-refund', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    commitmentHash: key.commitment,
    nullifierProof: nullifierProof
  })
});
```

## 🛡️ **Security Benefits**

### **Double-Spend Protection**
- **Nullifier Tracking**: Each key has unique nullifier hash
- **Spent Nullifiers**: Database of used nullifiers prevents reuse
- **ZK Verification**: Cryptographic proof of ownership required

### **Privacy Preservation**
- **Secret Protection**: User secrets never exposed to backend
- **Zero-Knowledge**: Prove ownership without revealing underlying secret
- **Selective Disclosure**: Only reveal necessary information

### **Scalability**
- **Merkle Trees**: Efficient O(log n) verification for large datasets
- **Database Indexing**: Optimized queries for high-performance lookups
- **Batch Operations**: Process multiple operations efficiently

## 📈 **Integration Points**

### **Smart Contract Integration**
```solidity
contract AuroraVaultZK {
    function verifyKeyOwnership(
        bytes commitmentHash,
        bytes nullifierHash,
        bytes proof
    ) external pure returns (bool);
    
    function refundKeyWithProof(
        bytes commitmentHash,
        bytes nullifierHash,
        bytes proof
    ) external returns (bool);
}
```

### **Frontend Components**
```typescript
// ZK Proof Generation Hook
const useZKProof = (commitment) => {
  const [proof, setProof] = useState(null);
  
  const generateProof = async () => {
    const result = await zkService.generateProof(witness);
    setProof(result);
  };
  
  return { proof, generateProof };
};
```

## 🚀 **Deployment**

### **Environment Setup**
```env
# ZK Circuit Configuration
ZK_CIRCUIT_PATH=./circuits/merkle_proof.wasm
ZK_PROVING_KEY=./circuits/merkle_proof.zkey

# Enhanced Database
DATABASE_ZK_PATH=./database/zk_aurora_vault.db
```

### **Circuit Compilation**
```bash
# Compile ZK circuit
npx circom circuits/merkle_proof.circom --r1cs --wasm --sym

# Setup proving key
npx snarkjs powersoftau28 ceremony.circuit --protocol groth16 --pot powersOfTau28.pot
```

## 📋 **Monitoring & Analytics**

### **Key Metrics**
- Total commitments created
- Keys spent vs unspent ratio
- Refund success rate
- ZK proof verification success rate
- Wallet activity tracking

### **Security Monitoring**
- Failed proof attempts
- Double-spend attempts detection
- Unusual nullifier patterns
- Database performance metrics

---

**Status**: ✅ ZK-Ownership System Complete  
**Ready for**: Production Deployment  
**Security**: Enterprise-Grade Privacy & Double-Spend Protection  
**Scalability**: High-Performance Merkle Tree Verification
