# Oceara Web Platform 🌊

**Official Web Application for Blue Carbon Ecosystem Management**

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://oceara.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Note**: This is the **web platform** for Oceara. Looking for the mobile app? Check out the [Oceara Flutter Mobile App](https://github.com/Oceara/Oceara-blue-carbon-mrv).

## 🌐 Live Demo

- **Production**: [oceara.vercel.app](https://oceara.vercel.app)
- **API Documentation**: [oceara.vercel.app/api-docs](https://oceara.vercel.app/api-docs)

## 🌊 What is Oceara?

Oceara is a comprehensive **full-stack web platform** for blue carbon ecosystem management that combines:

- **🌍 Interactive 3D Globe** - Three.js visualization of global blue carbon projects
- **🔗 Blockchain Integration** - Carbon credit NFTs and decentralized marketplace
- **🤖 AI/ML Verification** - Automated project verification using CNN and XGBoost models
- **📊 Scientific Calculations** - IPCC-compliant carbon sequestration formulas
- **💰 Carbon Credit Trading** - Transparent marketplace for verified credits
- **📱 Real-time Updates** - WebSocket-powered live data synchronization

### Key Differentiators

| Feature | Oceara Web Platform | Oceara Mobile App |
|---------|-------------------|------------------|
| **Platform** | Web (Next.js) | Mobile (Flutter) |
| **Use Case** | Full management & trading | On-the-go monitoring |
| **3D Globe** | ✅ Interactive Three.js | ❌ |
| **Admin Dashboard** | ✅ Complete workflow | ❌ |
| **AI/ML Integration** | ✅ Full pipeline | ❌ |
| **Blockchain** | ✅ Smart contracts | ✅ Basic integration |
| **Target Users** | Land owners, buyers, admins | Land owners primarily |

## 🔗 Related Repositories

- **[Oceara Mobile App](https://github.com/Oceara/Oceara-blue-carbon-mrv)** - Flutter mobile application for MRV
- **Oceara Smart Contracts** - Solidity contracts (included in this repo)
- **Oceara ML Models** - AI/ML models (included in this repo)

## 🏗️ Architecture

```
oceara-fullstack/
├── frontend/                 # Next.js React application
│   ├── app/                 # Next.js 14 app directory
│   ├── components/          # React components
│   ├── threejs/            # Three.js globe integration
│   ├── styles/             # Tailwind CSS styles
│   └── utils/              # Frontend utilities
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── models/         # MongoDB schemas
│   │   ├── middleware/     # Authentication, validation
│   │   ├── services/       # Business logic
│   │   └── config/         # Database, Redis config
├── contracts/              # Solidity smart contracts
│   ├── CarbonCredit.sol    # ERC721 carbon credit NFT
│   └── CarbonMarketplace.sol # Trading marketplace
├── ml-models/              # Machine Learning models
│   ├── src/
│   │   ├── models/         # ML model implementations
│   │   └── services/       # Model serving
│   └── requirements.txt    # Python dependencies
└── docs/                   # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+ and pip
- MongoDB
- Redis
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd oceara-fullstack
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend && npm install && cd ..
   
   # Install backend dependencies
   cd backend && npm install && cd ..
   
   # Install ML dependencies
   cd ml-models && pip install -r requirements.txt && cd ..
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB and Redis
   mongod
   redis-server
   ```

5. **Start Development Servers**
   ```bash
   # Start all services
   npm run dev
   
   # Or start individually:
   npm run dev:frontend  # Frontend on :3000
   npm run dev:backend   # Backend on :5000
   ```

## 🛠️ Development

### Frontend Development

The frontend is built with Next.js 14, React, and Three.js:

```bash
cd frontend
npm run dev
```

**Key Features:**
- Interactive 3D Earth globe with hotspot markers
- Real-time carbon credit marketplace
- User authentication and profiles
- Responsive design with Tailwind CSS

### Backend Development

The backend provides REST APIs and WebSocket support:

```bash
cd backend
npm run dev
```

**API Endpoints:**
- `/api/auth` - Authentication
- `/api/ecosystems` - Ecosystem management
- `/api/carbon` - Carbon credit operations
- `/api/blockchain` - Blockchain interactions
- `/api/ml` - Machine learning predictions

### Smart Contracts

Deploy and interact with Solidity contracts:

```bash
# Install Hardhat
npm install -g hardhat

# Deploy contracts
cd contracts
npx hardhat compile
npx hardhat deploy --network localhost
```

### Machine Learning Models

Train and serve ML models:

```bash
cd ml-models

# Train carbon sequestration model
python src/models/carbon_sequestration_model.py

# Train satellite classifier
python src/models/satellite_image_classifier.py

# Start model service
python src/services/model_service.py
```

## 📊 Features

### 🌍 Interactive Globe
- 3D Earth visualization with Three.js
- Global hotspot markers for blue carbon ecosystems
- Real-time data visualization
- Satellite imagery integration

### 🔗 Blockchain Integration
- ERC721 carbon credit NFTs
- Decentralized marketplace
- Smart contract automation
- Web3 wallet integration

### 🤖 Machine Learning
- Carbon sequestration prediction
- Satellite image classification
- Ecosystem health monitoring
- Automated verification

### 📈 Marketplace
- Buy/sell carbon credits
- Price discovery mechanisms
- Verification and certification
- Transaction history

## 🔧 Configuration

### Environment Variables

Key configuration options in `.env`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/oceara
REDIS_URL=redis://localhost:6379

# Blockchain
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your-private-key

# APIs
GOOGLE_MAPS_API_KEY=your-google-maps-key
SENTINEL_HUB_CLIENT_ID=your-sentinel-hub-id

# ML Models
ML_MODELS_PATH=./ml-models/models
TENSORFLOW_GPU=false
```

### Database Schema

**Users**: Authentication, profiles, wallet addresses
**Ecosystems**: Geographic data, carbon measurements
**CarbonCredits**: NFT metadata, ownership, verification
**Transactions**: Blockchain transaction history
**Verifications**: Third-party verification data

## 🧪 Testing

```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test

# ML model tests
cd ml-models && python -m pytest

# Integration tests
npm run test:integration
```

## 📦 Deployment

### Production Build

```bash
# Build all services
npm run build

# Start production servers
npm start
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Cloud Deployment

- **Frontend**: Vercel, Netlify, or AWS S3
- **Backend**: AWS EC2, Google Cloud Run, or Heroku
- **Database**: MongoDB Atlas, AWS DocumentDB
- **Blockchain**: Ethereum mainnet, Polygon, or BSC

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Three.js community for 3D graphics
- OpenZeppelin for smart contract standards
- TensorFlow team for ML frameworks
- Google Earth Engine for satellite data
- Blue carbon research community

## 📞 Support

- Documentation: [docs.oceara.com](https://docs.oceara.com)
- Issues: [GitHub Issues](https://github.com/oceara/issues)
- Discord: [Oceara Community](https://discord.gg/oceara)
- Email: support@oceara.com

---

**Oceara** - Where Oceans decide the future of Carbon and the earth 🌊
