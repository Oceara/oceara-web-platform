/**
 * Deployment Script for Carbon Credit Smart Contracts
 * Deploys to Polygon Mumbai testnet or Ethereum Goerli testnet
 */

const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🚀 Starting deployment of Carbon Credit Smart Contracts...\n');

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);
  console.log('Account balance:', ethers.utils.formatEther(await deployer.getBalance()), 'ETH\n');

  // Network information
  const network = await ethers.provider.getNetwork();
  console.log('Network:', network.name, 'Chain ID:', network.chainId);
  
  // Check if we have enough balance
  const balance = await deployer.getBalance();
  if (balance.lt(ethers.utils.parseEther('0.01'))) {
    console.error('❌ Insufficient balance for deployment. Please add funds to your account.');
    process.exit(1);
  }

  try {
    // 1. Deploy CarbonCreditNFT
    console.log('📄 Deploying CarbonCreditNFT...');
    const CarbonCreditNFT = await ethers.getContractFactory('CarbonCreditNFT');
    const carbonCreditNFT = await CarbonCreditNFT.deploy(
      'Oceara Carbon Credits',
      'OCC',
      'https://api.oceara.com/metadata/'
    );
    await carbonCreditNFT.deployed();
    console.log('✅ CarbonCreditNFT deployed to:', carbonCreditNFT.address);

    // 2. Deploy CarbonRegistry
    console.log('📄 Deploying CarbonRegistry...');
    const CarbonRegistry = await ethers.getContractFactory('CarbonRegistry');
    const carbonRegistry = await CarbonRegistry.deploy(carbonCreditNFT.address);
    await carbonRegistry.deployed();
    console.log('✅ CarbonRegistry deployed to:', carbonRegistry.address);

    // 3. Deploy CarbonMarketplace
    console.log('📄 Deploying CarbonMarketplace...');
    const CarbonMarketplace = await ethers.getContractFactory('CarbonMarketplace');
    
    // For testnet, we'll use a mock USDC token address
    // In production, use the actual USDC contract address
    const mockUSDC = '0x2058A9D7613eEE744279e3856Ef0eAda5FCbaA7e'; // Mock USDC on Mumbai
    const feeRecipient = deployer.address; // Use deployer as fee recipient for now
    
    const carbonMarketplace = await CarbonMarketplace.deploy(
      carbonCreditNFT.address,
      mockUSDC,
      feeRecipient
    );
    await carbonMarketplace.deployed();
    console.log('✅ CarbonMarketplace deployed to:', carbonMarketplace.address);

    // 4. Set up roles and permissions
    console.log('🔐 Setting up roles and permissions...');
    
    // Grant MINTER_ROLE to CarbonRegistry
    const MINTER_ROLE = await carbonCreditNFT.MINTER_ROLE();
    await carbonCreditNFT.grantRole(MINTER_ROLE, carbonRegistry.address);
    console.log('✅ Granted MINTER_ROLE to CarbonRegistry');

    // Grant VERIFIER_ROLE to deployer (admin)
    const VERIFIER_ROLE = await carbonCreditNFT.VERIFIER_ROLE();
    await carbonCreditNFT.grantRole(VERIFIER_ROLE, deployer.address);
    console.log('✅ Granted VERIFIER_ROLE to deployer');

    // Grant ADMIN_ROLE to deployer
    const ADMIN_ROLE = await carbonCreditNFT.ADMIN_ROLE();
    await carbonCreditNFT.grantRole(ADMIN_ROLE, deployer.address);
    console.log('✅ Granted ADMIN_ROLE to deployer');

    // Grant roles in CarbonRegistry
    const REGISTRY_ADMIN_ROLE = await carbonRegistry.ADMIN_ROLE();
    await carbonRegistry.grantRole(REGISTRY_ADMIN_ROLE, deployer.address);
    console.log('✅ Granted ADMIN_ROLE in CarbonRegistry to deployer');

    const REGISTRY_VERIFIER_ROLE = await carbonRegistry.VERIFIER_ROLE();
    await carbonRegistry.grantRole(REGISTRY_VERIFIER_ROLE, deployer.address);
    console.log('✅ Granted VERIFIER_ROLE in CarbonRegistry to deployer');

    const REGISTRY_PROJECT_MANAGER_ROLE = await carbonRegistry.PROJECT_MANAGER_ROLE();
    await carbonRegistry.grantRole(REGISTRY_PROJECT_MANAGER_ROLE, deployer.address);
    console.log('✅ Granted PROJECT_MANAGER_ROLE in CarbonRegistry to deployer');

    const REGISTRY_MINTER_ROLE = await carbonRegistry.MINTER_ROLE();
    await carbonRegistry.grantRole(REGISTRY_MINTER_ROLE, deployer.address);
    console.log('✅ Granted MINTER_ROLE in CarbonRegistry to deployer');

    // Grant roles in CarbonMarketplace
    const MARKETPLACE_ADMIN_ROLE = await carbonMarketplace.ADMIN_ROLE();
    await carbonMarketplace.grantRole(MARKETPLACE_ADMIN_ROLE, deployer.address);
    console.log('✅ Granted ADMIN_ROLE in CarbonMarketplace to deployer');

    // 5. Save deployment information
    const deploymentInfo = {
      network: {
        name: network.name,
        chainId: network.chainId.toString()
      },
      deployer: deployer.address,
      contracts: {
        CarbonCreditNFT: {
          address: carbonCreditNFT.address,
          transactionHash: carbonCreditNFT.deployTransaction.hash
        },
        CarbonRegistry: {
          address: carbonRegistry.address,
          transactionHash: carbonRegistry.deployTransaction.hash
        },
        CarbonMarketplace: {
          address: carbonMarketplace.address,
          transactionHash: carbonMarketplace.deployTransaction.hash
        }
      },
      roles: {
        minter: carbonRegistry.address,
        verifier: deployer.address,
        admin: deployer.address
      },
      deploymentTime: new Date().toISOString()
    };

    // Save to file
    const deploymentPath = path.join(__dirname, '..', 'deployments', `${network.name}-${network.chainId}.json`);
    const deploymentsDir = path.dirname(deploymentPath);
    
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log('💾 Deployment info saved to:', deploymentPath);

    // 6. Verify contracts (optional - requires etherscan API key)
    if (process.env.ETHERSCAN_API_KEY) {
      console.log('🔍 Verifying contracts on Etherscan...');
      
      try {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
        
        await hre.run('verify:verify', {
          address: carbonCreditNFT.address,
          constructorArguments: [
            'Oceara Carbon Credits',
            'OCC',
            'https://api.oceara.com/metadata/'
          ]
        });
        console.log('✅ CarbonCreditNFT verified');

        await hre.run('verify:verify', {
          address: carbonRegistry.address,
          constructorArguments: [carbonCreditNFT.address]
        });
        console.log('✅ CarbonRegistry verified');

        await hre.run('verify:verify', {
          address: carbonMarketplace.address,
          constructorArguments: [carbonCreditNFT.address, mockUSDC, feeRecipient]
        });
        console.log('✅ CarbonMarketplace verified');
      } catch (error) {
        console.log('⚠️  Contract verification failed:', error.message);
      }
    } else {
      console.log('⚠️  ETHERSCAN_API_KEY not set, skipping contract verification');
    }

    // 7. Display summary
    console.log('\n🎉 Deployment completed successfully!');
    console.log('=====================================');
    console.log('Network:', network.name, '(Chain ID:', network.chainId, ')');
    console.log('Deployer:', deployer.address);
    console.log('Gas used:', ethers.utils.formatEther(await deployer.getBalance()), 'ETH remaining');
    console.log('\nContract Addresses:');
    console.log('CarbonCreditNFT:', carbonCreditNFT.address);
    console.log('CarbonRegistry:', carbonRegistry.address);
    console.log('CarbonMarketplace:', carbonMarketplace.address);
    console.log('\nNext Steps:');
    console.log('1. Update your .env file with the contract addresses');
    console.log('2. Test the contracts with sample transactions');
    console.log('3. Deploy to mainnet when ready');
    console.log('4. Set up monitoring and alerts');

    // 8. Create environment file template
    const envTemplate = `# Blockchain Configuration
BLOCKCHAIN_RPC_URL=https://rpc-mumbai.maticvigil.com
ADMIN_PRIVATE_KEY=your_private_key_here
CARBON_CREDIT_NFT_ADDRESS=${carbonCreditNFT.address}
CARBON_REGISTRY_ADDRESS=${carbonRegistry.address}
CARBON_MARKETPLACE_ADDRESS=${carbonMarketplace.address}
PAYMENT_TOKEN_ADDRESS=${mockUSDC}
ETHERSCAN_API_KEY=your_etherscan_api_key_here
`;

    const envPath = path.join(__dirname, '..', '.env.blockchain');
    fs.writeFileSync(envPath, envTemplate);
    console.log('📝 Environment template saved to:', envPath);

  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment script failed:', error);
    process.exit(1);
  });
