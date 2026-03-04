# Aurora Vault RWA Backend

Secure Node.js/TypeScript backend for Aurora Vault RWA platform with institutional-grade compliance.

## Features

### Phase 1: Security & API Proxy Layer
- ✅ Secure API proxy for Authesure KYC services
- ✅ Environment variable isolation for sensitive keys
- ✅ POST `/api/kyc/create-session` - Create KYC sessions
- ✅ GET `/api/kyc/status/:envelopeId` - Check KYC status

### Phase 2: Webhook Architecture
- ✅ POST `/api/webhooks/authensure` - Authesure webhook handler
- ✅ Signature verification for webhook security
- ✅ Real-time WebSocket notifications
- ✅ SQLite database for KYC status tracking

### Phase 3: RWA Document Automation
- ✅ Dynamic template integration with Authesure
- ✅ Automatic wallet address injection
- ✅ Timestamp tracking for compliance

### Phase 4: Smart Contract Gating
- ✅ EIP-712 signature generation
- ✅ Permission-based contract access
- ✅ Aurora network integration

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env with your actual API keys and configuration
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
npm start
```

## API Endpoints

### KYC Routes
- `POST /api/kyc/create-session` - Create new KYC session
- `GET /api/kyc/status/:envelopeId` - Get KYC status with permission signature
- `GET /api/kyc/user/:walletAddress` - Get user KYC status

### Webhook Routes
- `POST /api/webhooks/authensure` - Authesure webhook handler
- `GET /api/webhooks/status` - Webhook service health check

### System Routes
- `GET /health` - Server health check

## WebSocket Events

### Client to Server
- `ping` - Keep-alive message
- `subscribe_kyc` - Subscribe to KYC updates for a wallet

### Server to Client
- `connection_established` - Initial connection confirmation
- `kyc_completed` - KYC completion notification
- `pong` - Response to ping

## Environment Variables

```env
# Authesure API Configuration
AUTHESURE_API_KEY=your_authensure_api_key_here
AUTHESURE_BASE_URL=https://api.authensure.app

# Web3 Configuration
PRIVATE_KEY=your_private_key_here
RPC_URL=https://mainnet.aurora.dev
VERIFICATION_CONTRACT_ADDRESS=0x...

# Database Configuration
DATABASE_PATH=./database/aurora_vault.db

# Server Configuration
PORT=3001
NODE_ENV=development

# Webhook Security
WEBHOOK_SECRET=your_webhook_secret_here

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

## Security Features

- **API Key Isolation**: All sensitive keys stored in environment variables
- **Webhook Signature Verification**: HMAC-SHA256 verification for all webhooks
- **CORS Protection**: Configurable CORS for frontend integration
- **Rate Limiting**: Built-in protection against API abuse
- **Input Validation**: Zod schema validation for all inputs

## Database Schema

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  walletAddress TEXT UNIQUE NOT NULL,
  envelopeId TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  completedAt DATETIME
);
```

## Integration Examples

### Frontend Integration

```javascript
// Create KYC session
const response = await fetch('http://localhost:3001/api/kyc/create-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ walletAddress: '0x...' })
});

const { data } = await response.json();
window.location.href = data.signing_url;

// WebSocket for real-time updates
const ws = new WebSocket('ws://localhost:3001');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'kyc_completed') {
    // Enable invest button
    enableInvestButton(data.permissionSignature);
  }
};
```

### Smart Contract Integration

```solidity
contract AuroraVault {
    function invest(bytes calldata signature) external {
        require(verifyPermission(signature), "Invalid KYC signature");
        // Investment logic
    }
}
```

## Development

### Project Structure
```
backend/
├── src/
│   ├── database/     # SQLite database layer
│   ├── routes/       # API route handlers
│   ├── services/     # Business logic services
│   ├── types/        # TypeScript type definitions
│   └── server.ts     # Main server entry point
├── database/         # SQLite database files
├── dist/            # Compiled JavaScript
└── package.json
```

### Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Production Deployment

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["npm", "start"]
```

### Environment Security
- Use strong, unique secrets for production
- Enable HTTPS with valid SSL certificates
- Configure firewall rules for API access
- Regular security audits and updates

## Monitoring & Logging

- Structured logging with Morgan
- Health check endpoints for monitoring
- WebSocket connection tracking
- Error tracking and alerting

## License

MIT License - Aurora Vault RWA Platform
