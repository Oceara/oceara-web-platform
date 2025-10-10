'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { blockchainService, WalletInfo, Transaction } from '@/services/blockchain'
import toast from 'react-hot-toast'

interface BlockchainWalletProps {
  onTransactionComplete?: (tx: Transaction) => void
}

type WalletProvider = 'metamask' | 'walletconnect' | 'coinbase' | 'trust' | 'phantom'

interface WalletOption {
  id: WalletProvider
  name: string
  icon: string
  description: string
  available: boolean
}

export default function BlockchainWallet({ onTransactionComplete }: BlockchainWalletProps) {
  const [wallet, setWallet] = useState<WalletInfo | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isConnecting, setIsConnecting] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showTransactions, setShowTransactions] = useState(false)
  const [networkInfo, setNetworkInfo] = useState(blockchainService.getNetworkInfo())

  const walletOptions: WalletOption[] = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      description: 'Most popular Ethereum wallet',
      available: typeof window !== 'undefined' && !!(window as any).ethereum
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: '🔗',
      description: 'Connect via QR code',
      available: true
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: '🔵',
      description: 'Coinbase\'s self-custody wallet',
      available: true
    },
    {
      id: 'trust',
      name: 'Trust Wallet',
      icon: '🛡️',
      description: 'Mobile-first crypto wallet',
      available: true
    },
    {
      id: 'phantom',
      name: 'Phantom',
      icon: '👻',
      description: 'Solana & Ethereum wallet',
      available: true
    }
  ]

  useEffect(() => {
    const existingWallet = blockchainService.getWallet()
    if (existingWallet) {
      setWallet(existingWallet)
      loadTransactions()
    }
  }, [])

  const loadTransactions = () => {
    const txs = blockchainService.getTransactions()
    setTransactions(txs)
  }

  const handleConnect = async (provider: WalletProvider) => {
    setIsConnecting(true)
    setShowWalletModal(false)
    
    try {
      const connectedWallet = await blockchainService.connectWallet()
      setWallet(connectedWallet)
      loadTransactions()
      toast.success(`${provider.charAt(0).toUpperCase() + provider.slice(1)} connected!`, {
        icon: '🎉',
        duration: 3000
      })
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      toast.error('Failed to connect wallet. Please try again.')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    blockchainService.disconnectWallet()
    setWallet(null)
    setTransactions([])
    setShowMenu(false)
    toast.success('Wallet disconnected')
  }

  const copyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address)
      toast.success('Address copied!', { icon: '📋' })
    }
  }

  const addToMetaMask = async () => {
    try {
      await (window as any).ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: blockchainService.getContractAddress(),
            symbol: 'OCC',
            decimals: 18,
            image: 'https://oceara.com/token-icon.png'
          }
        }
      })
      toast.success('Token added to MetaMask!')
    } catch (error) {
      toast.error('Failed to add token')
    }
  }

  const switchNetwork = async () => {
    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${networkInfo.chainId.toString(16)}` }]
      })
      toast.success('Network switched!')
    } catch (error) {
      toast.error('Failed to switch network')
    }
  }

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="relative">
      {/* Connect Wallet Button */}
      {!wallet ? (
        <button
          onClick={() => setShowWalletModal(true)}
          disabled={isConnecting}
          className="px-6 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 rounded-xl text-white font-bold transition-all shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 group"
        >
          {isConnecting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <span className="text-lg group-hover:scale-110 transition-transform">👛</span>
              <span>Connect Wallet</span>
            </>
          )}
        </button>
      ) : (
        <div className="flex items-center gap-2">
          {/* Connected Wallet Info */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="bg-gradient-to-r from-purple-600/20 via-indigo-600/20 to-blue-600/20 backdrop-blur-lg border-2 border-purple-500/40 hover:border-purple-400/60 rounded-xl px-4 py-2 flex items-center gap-3 transition-all group"
            >
              {/* Status Indicator */}
              <div className="relative">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75" />
              </div>

              {/* Wallet Info */}
              <div className="text-left">
                <div className="text-white text-sm font-mono font-bold group-hover:text-purple-300 transition-colors">
                  {formatAddress(wallet.address)}
                </div>
                <div className="text-purple-300 text-xs font-semibold flex items-center gap-1">
                  <span>💎</span>
                  <span>{wallet.balance.toLocaleString()} OCC</span>
                </div>
              </div>

              {/* Dropdown Arrow */}
              <svg 
                className={`w-4 h-4 text-purple-300 transition-transform ${showMenu ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-0 mt-2 w-72 bg-slate-900/95 backdrop-blur-xl border-2 border-purple-500/30 rounded-2xl shadow-2xl z-50 overflow-hidden"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 p-4 border-b border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-xl">
                        👛
                      </div>
                      <div>
                        <p className="text-white font-bold">My Wallet</p>
                        <p className="text-purple-300 text-xs">Connected to {networkInfo.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-400 text-sm">Balance:</span>
                      <span className="text-white font-bold text-lg">{wallet.balance.toLocaleString()} OCC</span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <button
                      onClick={copyAddress}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-left group"
                    >
                      <span className="text-2xl group-hover:scale-110 transition-transform">📋</span>
                      <div>
                        <p className="text-white font-semibold">Copy Address</p>
                        <p className="text-gray-400 text-xs">Copy wallet address to clipboard</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowTransactions(true)
                        setShowMenu(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-left group"
                    >
                      <span className="text-2xl group-hover:scale-110 transition-transform">📜</span>
                      <div className="flex-1">
                        <p className="text-white font-semibold">Transaction History</p>
                        <p className="text-gray-400 text-xs">View all transactions</p>
                      </div>
                      {transactions.length > 0 && (
                        <span className="px-2 py-1 bg-purple-500 rounded-full text-white text-xs font-bold">
                          {transactions.length}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={addToMetaMask}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-left group"
                    >
                      <span className="text-2xl group-hover:scale-110 transition-transform">🦊</span>
                      <div>
                        <p className="text-white font-semibold">Add Token to MetaMask</p>
                        <p className="text-gray-400 text-xs">Watch OCC token in wallet</p>
                      </div>
                    </button>

                    <button
                      onClick={switchNetwork}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-left group"
                    >
                      <span className="text-2xl group-hover:scale-110 transition-transform">🔄</span>
                      <div>
                        <p className="text-white font-semibold">Switch Network</p>
                        <p className="text-gray-400 text-xs">Change blockchain network</p>
                      </div>
                    </button>

                    <a
                      href={blockchainService.getExplorerUrl(wallet.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-left group"
                    >
                      <span className="text-2xl group-hover:scale-110 transition-transform">🔍</span>
                      <div>
                        <p className="text-white font-semibold">View on Explorer</p>
                        <p className="text-gray-400 text-xs">Open in Polygonscan</p>
                      </div>
                    </a>

                    <div className="my-2 border-t border-white/10" />

                    <button
                      onClick={handleDisconnect}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/20 rounded-xl transition-all text-left group"
                    >
                      <span className="text-2xl group-hover:scale-110 transition-transform">🚪</span>
                      <div>
                        <p className="text-red-400 font-semibold">Disconnect Wallet</p>
                        <p className="text-gray-400 text-xs">Sign out from wallet</p>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Wallet Selection Modal */}
      <AnimatePresence>
        {showWalletModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowWalletModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 rounded-3xl p-8 max-w-2xl w-full border-2 border-purple-500/30 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-2">Connect Wallet</h3>
                  <p className="text-gray-400">Choose your preferred wallet to connect</p>
                </div>
                <button
                  onClick={() => setShowWalletModal(false)}
                  className="text-gray-400 hover:text-white transition-colors text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Wallet Options Grid */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {walletOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => option.available && handleConnect(option.id)}
                    disabled={!option.available}
                    className={`relative p-6 rounded-2xl border-2 transition-all text-left group ${
                      option.available
                        ? 'bg-white/5 border-purple-500/30 hover:border-purple-400 hover:bg-white/10 cursor-pointer'
                        : 'bg-gray-800/30 border-gray-700/30 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl group-hover:scale-110 transition-transform">
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-bold text-lg mb-1 flex items-center gap-2">
                          {option.name}
                          {!option.available && (
                            <span className="text-xs bg-gray-700 px-2 py-1 rounded">Soon</span>
                          )}
                        </h4>
                        <p className="text-gray-400 text-sm">{option.description}</p>
                      </div>
                    </div>
                    {option.available && (
                      <div className="mt-3 flex items-center text-purple-400 text-sm font-semibold">
                        <span>Connect</span>
                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Info Box */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <div className="flex gap-3">
                  <span className="text-2xl">ℹ️</span>
                  <div>
                    <p className="text-blue-300 font-semibold mb-1">First time connecting?</p>
                    <p className="text-gray-400 text-sm">
                      We recommend MetaMask for beginners. Make sure you're on Polygon Mumbai Testnet. 
                      No wallet? <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Download MetaMask</a>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction History Modal */}
      <AnimatePresence>
        {showTransactions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowTransactions(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[80vh] overflow-hidden border-2 border-purple-500/30 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 p-6 border-b border-white/10">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">Transaction History</h3>
                    <p className="text-purple-300 text-sm">Network: {networkInfo.name}</p>
                  </div>
                  <button
                    onClick={() => setShowTransactions(false)}
                    className="text-gray-400 hover:text-white transition-colors text-2xl"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Transactions List */}
              <div className="max-h-[60vh] overflow-y-auto p-6">
                {transactions.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-7xl mb-4">📜</div>
                    <p className="text-gray-400 text-lg">No transactions yet</p>
                    <p className="text-gray-500 text-sm mt-2">Your transaction history will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((tx) => (
                      <div
                        key={tx.txHash}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-5 transition-all"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-2xl">
                              {tx.type === 'MINT' && '🪙'}
                              {tx.type === 'TRANSFER' && '➡️'}
                              {tx.type === 'APPROVE' && '✅'}
                              {tx.type === 'BURN' && '🔥'}
                            </div>
                            <div>
                              <span className="text-white font-bold text-lg">{tx.type}</span>
                              <p className="text-gray-400 text-sm">{formatTimestamp(tx.timestamp)}</p>
                            </div>
                          </div>
                          <span
                            className={`px-4 py-2 rounded-xl text-sm font-bold ${
                              tx.status === 'confirmed'
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : tx.status === 'pending'
                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {tx.status.toUpperCase()}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div className="bg-white/5 rounded-lg p-3">
                            <p className="text-gray-400 text-xs mb-1">Amount</p>
                            <p className="text-white font-bold text-lg">{tx.amount} OCC</p>
                          </div>
                          {tx.blockNumber && (
                            <div className="bg-white/5 rounded-lg p-3">
                              <p className="text-gray-400 text-xs mb-1">Block</p>
                              <p className="text-purple-300 font-mono font-bold">#{tx.blockNumber}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-white/10">
                          <p className="text-gray-400 text-xs">Transaction Hash:</p>
                          <a
                            href={blockchainService.getExplorerUrl(tx.txHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300 text-xs font-mono flex items-center gap-1 transition-colors"
                          >
                            <span>🔍</span>
                            <span>{tx.txHash.substring(0, 12)}...{tx.txHash.substring(tx.txHash.length - 8)}</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-white/5 p-4 border-t border-white/10">
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <div>
                    <span>Contract: </span>
                    <span className="text-purple-300 font-mono">
                      {formatAddress(blockchainService.getContractAddress())}
                    </span>
                  </div>
                  <div>
                    <span>Chain ID: </span>
                    <span className="text-blue-300 font-bold">{networkInfo.chainId}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
