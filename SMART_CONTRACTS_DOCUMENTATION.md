# Smart Contracts Documentation

## Overview

The Oceara platform implements a comprehensive smart contract system for carbon credit tokenization, management, and trading. The system consists of three main contracts deployed on Polygon/Ethereum networks.

## Contract Architecture

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   CarbonCreditNFT   │    │   CarbonRegistry    │    │  CarbonMarketplace  │
│   (ERC-721)         │    │   (Lifecycle Mgmt)  │    │   (Trading)         │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
           │                           │                           │
           └───────────────────────────┼───────────────────────────┘
                                       │
                              ┌─────────────────────┐
                              │   Backend API       │
                              │   (Web3.js/Ethers)  │
                              └─────────────────────┘
```

## Smart Contracts

### 1. CarbonCreditNFT.sol

**Purpose**: ERC-721 NFT contract for unique carbon credits

**Key Features**:
- **Unique Tokenization**: Each carbon credit is a unique NFT
- **Rich Metadata**: Comprehensive carbon credit data storage
- **Role-Based Access**: Admin, Minter, Verifier roles
- **Retirement Mechanism**: Burn NFTs when credits are retired
- **Transfer Tracking**: Monitor credit ownership changes

**Core Functions**:
```solidity
function mintCredit(
    address to,
    uint256 projectId,
    uint256 carbonAmount,
    uint256 vintageYear,
    string memory methodology,
    string memory location,
    string memory species,
    string memory tokenURI
) external returns (uint256)

function retireCredit(
    uint256 tokenId,
    string memory retirementReason
) external

function verifyCredit(
    uint256 tokenId,
    bool verified,
    string memory verificationNotes
) external
```

**Events**:
- `CreditIssued`: When a new credit is minted
- `CreditTransferred`: When a credit is transferred
- `CreditRetired`: When a credit is retired/burned
- `CreditVerified`: When a credit is verified
- `ProjectVerified`: When a project is verified

### 2. CarbonRegistry.sol

**Purpose**: Registry for carbon project lifecycle management

**Key Features**:
- **Project Management**: Create and manage carbon projects
- **Verification System**: Submit and review verification reports
- **Credit Issuance**: Issue credits for verified projects
- **Status Tracking**: Monitor project and verification status
- **Role Management**: Admin, Verifier, Project Manager roles

**Core Functions**:
```solidity
function createProject(
    string memory name,
    string memory description,
    string memory location,
    string memory methodology,
    uint256 totalArea,
    uint256 estimatedCarbon,
    uint256 vintageYear
) external returns (uint256)

function submitVerificationReport(
    uint256 projectId,
    uint256 carbonAmount,
    string memory reportHash,
    string memory notes,
    uint256 expiryDate
) external returns (uint256)

function issueCredits(
    uint256 projectId,
    address recipient,
    uint256 carbonAmount,
    string memory tokenURI
) external returns (uint256[])
```

**Project Status**:
- `Pending`: Newly created project
- `UnderReview`: Verification in progress
- `Verified`: Project verified and ready for credit issuance
- `Rejected`: Project verification failed
- `Suspended`: Project suspended by admin

### 3. CarbonMarketplace.sol

**Purpose**: Marketplace for trading carbon credits

**Key Features**:
- **Fixed Price Listings**: Set fixed prices for credits
- **Auction System**: Bid-based credit sales
- **Payment Integration**: Support for ERC-20 tokens (USDC, USDT)
- **Platform Fees**: Configurable fee system
- **Bid Management**: Handle auction bids and withdrawals

**Core Functions**:
```solidity
function createFixedPriceListing(
    uint256 tokenId,
    uint256 price,
    uint256 duration
) external returns (uint256)

function createAuctionListing(
    uint256 tokenId,
    uint256 startingPrice,
    uint256 duration
) external returns (uint256)

function buyCredit(uint256 listingId) external

function placeBid(uint256 listingId, uint256 bidAmount) external
```

**Listing Types**:
- `FixedPrice`: Fixed price per ton of carbon
- `Auction`: Bid-based auction system

## Data Structures

### CarbonCreditData
```solidity
struct CarbonCreditData {
    uint256 projectId;           // Reference to carbon project
    uint256 carbonAmount;        // Amount of carbon in tons
    uint256 vintageYear;         // Year carbon was sequestered
    uint256 issuanceDate;        // When credit was issued
    uint256 retirementDate;      // When credit was retired (0 if active)
    string methodology;          // Verification methodology
    string location;             // Geographic location
    string species;              // Tree species involved
    bool isRetired;              // Whether credit is retired
    bool isVerified;             // Whether credit is verified
    address issuer;              // Address that issued credit
    address currentOwner;        // Current owner of credit
}
```

### CarbonProject
```solidity
struct CarbonProject {
    uint256 projectId;
    string name;
    string description;
    string location;
    string methodology;
    address projectOwner;
    uint256 totalArea;           // Area in hectares
    uint256 estimatedCarbon;     // Estimated carbon in tons
    uint256 issuedCarbon;        // Already issued carbon in tons
    uint256 vintageYear;
    ProjectStatus status;
    uint256 creationDate;
    uint256 lastUpdateDate;
    string[] verificationReports;
    mapping(address => bool) verifiers;
}
```

### CarbonListing
```solidity
struct CarbonListing {
    uint256 listingId;
    uint256 tokenId;
    address seller;
    uint256 price;              // Price per ton of carbon
    uint256 totalPrice;         // Total price for entire credit
    uint256 carbonAmount;       // Amount of carbon in tons
    ListingType listingType;
    ListingStatus status;
    uint256 startTime;
    uint256 endTime;
    address highestBidder;
    uint256 highestBid;
    mapping(address => uint256) bids;
    address[] bidders;
}
```

## Role-Based Access Control

### Roles

1. **DEFAULT_ADMIN_ROLE**: Full administrative access
2. **ADMIN_ROLE**: Administrative functions
3. **MINTER_ROLE**: Can mint new carbon credits
4. **VERIFIER_ROLE**: Can verify credits and projects
5. **PROJECT_MANAGER_ROLE**: Can create and manage projects
6. **MARKETPLACE_ROLE**: Can manage marketplace operations

### Permission Matrix

| Function | Admin | Minter | Verifier | Project Manager | Marketplace |
|----------|-------|--------|----------|-----------------|-------------|
| Mint Credit | ✅ | ✅ | ❌ | ❌ | ❌ |
| Verify Credit | ✅ | ❌ | ✅ | ❌ | ❌ |
| Create Project | ✅ | ❌ | ❌ | ✅ | ❌ |
| Submit Verification | ✅ | ❌ | ✅ | ❌ | ❌ |
| Issue Credits | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create Listing | ✅ | ❌ | ❌ | ❌ | ✅ |
| Buy Credit | ✅ | ❌ | ❌ | ❌ | ❌ |

## API Integration

### Backend Service

The `BlockchainService` class provides a comprehensive interface for interacting with smart contracts:

```typescript
class BlockchainService {
  // Credit Management
  async mintCredit(to, projectId, carbonAmount, ...): Promise<Result>
  async transferCredit(tokenId, from, to): Promise<Result>
  async retireCredit(tokenId, reason): Promise<Result>
  async verifyCredit(tokenId, verified, notes): Promise<Result>
  
  // Project Management
  async createProject(name, description, ...): Promise<Result>
  async submitVerificationReport(projectId, ...): Promise<Result>
  async issueCredits(projectId, recipient, ...): Promise<Result>
  
  // Marketplace
  async createFixedPriceListing(tokenId, price, duration): Promise<Result>
  async createAuctionListing(tokenId, startingPrice, duration): Promise<Result>
  async buyCredit(listingId): Promise<Result>
  
  // Data Retrieval
  async getCarbonCreditData(tokenId): Promise<CarbonCreditData>
  async getProjectInfo(projectId): Promise<ProjectData>
  async getListingInfo(listingId): Promise<ListingData>
}
```

### API Endpoints

#### Credit Management
- `POST /api/blockchain/mint-credit` - Mint new carbon credit
- `POST /api/blockchain/transfer-credit` - Transfer credit
- `POST /api/blockchain/retire-credit` - Retire credit
- `POST /api/blockchain/verify-credit` - Verify credit
- `GET /api/blockchain/credit/:tokenId` - Get credit data

#### Project Management
- `POST /api/blockchain/create-project` - Create new project
- `POST /api/blockchain/submit-verification-report` - Submit verification
- `POST /api/blockchain/issue-credits` - Issue credits
- `GET /api/blockchain/project/:projectId` - Get project info

#### Marketplace
- `POST /api/blockchain/create-listing` - Create marketplace listing
- `POST /api/blockchain/buy-credit` - Buy credit from marketplace
- `GET /api/blockchain/listing/:listingId` - Get listing info

## Deployment

### Prerequisites

1. **Node.js** (v18+)
2. **Hardhat** framework
3. **Private Key** for deployment account
4. **RPC URL** for target network
5. **Etherscan API Key** (for verification)

### Environment Setup

```bash
# Install dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts

# Create .env file
cp .env.example .env
```

### Environment Variables

```env
# Network Configuration
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
POLYGON_RPC_URL=https://polygon-rpc.com
GOERLI_RPC_URL=https://goerli.infura.io/v3/YOUR_PROJECT_ID
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID

# Deployment
PRIVATE_KEY=your_private_key_here
INFURA_PROJECT_ID=your_infura_project_id

# API Keys
POLYGONSCAN_API_KEY=your_polygonscan_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key

# Backend Configuration
BLOCKCHAIN_RPC_URL=https://rpc-mumbai.maticvigil.com
ADMIN_PRIVATE_KEY=your_private_key_here
CARBON_CREDIT_NFT_ADDRESS=deployed_contract_address
CARBON_REGISTRY_ADDRESS=deployed_contract_address
CARBON_MARKETPLACE_ADDRESS=deployed_contract_address
PAYMENT_TOKEN_ADDRESS=usdc_contract_address
```

### Deployment Commands

```bash
# Compile contracts
npm run blockchain:compile

# Run tests
npm run blockchain:test

# Deploy to local network
npm run blockchain:deploy:local

# Deploy to Mumbai testnet
npm run blockchain:deploy:mumbai

# Deploy to Polygon mainnet
npm run blockchain:deploy:polygon

# Deploy to Ethereum Goerli
npm run blockchain:deploy:goerli

# Verify contracts
npm run blockchain:verify
```

### Deployment Process

1. **Compile Contracts**: `npx hardhat compile`
2. **Run Tests**: `npx hardhat test`
3. **Deploy Contracts**: `npx hardhat run scripts/deploy.js --network mumbai`
4. **Verify Contracts**: `npx hardhat verify --network mumbai`
5. **Update Environment**: Add contract addresses to `.env`
6. **Test Integration**: Verify API endpoints work

## Gas Optimization

### Optimizations Implemented

1. **Packed Structs**: Efficient data storage
2. **Batch Operations**: Process multiple items in single transaction
3. **Event Indexing**: Optimized event parameters
4. **Storage Optimization**: Minimize storage operations
5. **Function Visibility**: Use appropriate visibility modifiers

### Gas Costs (Estimated)

| Operation | Gas Cost | USD (20 gwei) |
|-----------|----------|---------------|
| Mint Credit | ~150,000 | ~$3.00 |
| Transfer Credit | ~65,000 | ~$1.30 |
| Retire Credit | ~80,000 | ~$1.60 |
| Create Project | ~200,000 | ~$4.00 |
| Create Listing | ~120,000 | ~$2.40 |
| Buy Credit | ~100,000 | ~$2.00 |

## Security Considerations

### Security Features

1. **Access Control**: Role-based permissions
2. **Reentrancy Protection**: ReentrancyGuard modifier
3. **Pausable Contracts**: Emergency pause functionality
4. **Input Validation**: Comprehensive parameter validation
5. **Event Logging**: Complete audit trail

### Best Practices

1. **Private Key Security**: Use hardware wallets for mainnet
2. **Multi-signature**: Implement multi-sig for admin functions
3. **Regular Audits**: Conduct security audits
4. **Upgrade Strategy**: Plan for contract upgrades
5. **Monitoring**: Set up transaction monitoring

## Testing

### Test Coverage

- **Unit Tests**: Individual function testing
- **Integration Tests**: Contract interaction testing
- **Gas Tests**: Gas consumption optimization
- **Security Tests**: Vulnerability assessment

### Running Tests

```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/CarbonCreditNFT.test.js

# Run with gas reporting
REPORT_GAS=true npx hardhat test
```

## Monitoring and Analytics

### Key Metrics

1. **Credit Issuance**: Number of credits minted
2. **Credit Retirement**: Number of credits retired
3. **Trading Volume**: Marketplace transaction volume
4. **Project Verification**: Verification success rate
5. **Gas Usage**: Transaction cost optimization

### Monitoring Tools

1. **Etherscan/Polygonscan**: Transaction monitoring
2. **The Graph**: Decentralized indexing
3. **Custom Analytics**: Backend metrics collection
4. **Alert Systems**: Real-time notifications

## Future Enhancements

### Planned Features

1. **Cross-Chain Support**: Multi-chain deployment
2. **Automated Verification**: AI-powered verification
3. **Carbon Pooling**: Aggregate small projects
4. **Derivative Products**: Carbon credit derivatives
5. **Governance Token**: Decentralized governance

### Upgrade Path

1. **Proxy Contracts**: Upgradeable implementation
2. **Migration Scripts**: Data migration tools
3. **Backward Compatibility**: Maintain API compatibility
4. **Gradual Rollout**: Phased deployment strategy

## Support and Resources

### Documentation
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.io/)

### Community
- [Discord Server](https://discord.gg/oceara)
- [GitHub Repository](https://github.com/oceara/smart-contracts)
- [Telegram Group](https://t.me/oceara)

### Support
- **Technical Issues**: GitHub Issues
- **Security Concerns**: security@oceara.com
- **General Questions**: support@oceara.com

---

*This documentation is maintained by the Oceara development team. Last updated: January 2024*
