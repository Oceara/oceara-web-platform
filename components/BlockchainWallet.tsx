'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { blockchainService, WalletInfo, Transaction } from '@/services/blockchain'

interface BlockchainWalletProps {
  onTransactionComplete?: (tx: Transaction) => void
}

export default function BlockchainWallet({ onTransactionComplete }: BlockchainWalletProps) {
  const [wallet, setWallet] = useState<WalletInfo | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isConnecting, setIsConnecting] = useState(false)
  const [showTransactions, setShowTransactions] = useState(false)
  const [networkInfo, setNetworkInfo] = useState(blockchainService.getNetworkInfo())

  useEffect(() => {
    // Check if wallet is already connected
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

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      const connectedWallet = await blockchainService.connectWallet()
      setWallet(connectedWallet)
      loadTransactions()
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      alert('Failed to connect wallet. Please try again.')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    blockchainService.disconnectWallet()
    setWallet(null)
    setTransactions([])
  }

  const copyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address)
      alert('Address copied to clipboard!')
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
      {/* Wallet Button */}
      {!wallet ? (
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 rounded-full text-white font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isConnecting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <span>🔗</span>
              <span>Connect Wallet</span>
            </>
          )}
        </button>
      ) : (
        <div className="flex items-center gap-3">
          {/* Wallet Info */}
          <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 backdrop-blur-lg border border-purple-500/30 rounded-full px-4 py-2 flex items-center gap-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <div className="text-right">
              <div className="text-white text-sm font-mono">{formatAddress(wallet.address)}</div>
              <div className="text-purple-300 text-xs">{wallet.balance} Credits</div>
            </div>
            <button
              onClick={copyAddress}
              className="text-purple-300 hover:text-white transition-colors"
              title="Copy address"
            >
              📋
            </button>
          </div>

          {/* Transactions Button */}
          <button
            onClick={() => setShowTransactions(!showTransactions)}
            className="relative px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
          >
            📜
            {transactions.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                {transactions.length}
              </span>
            )}
          </button>

          {/* Disconnect Button */}
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-full text-red-300 hover:text-red-200 transition-all border border-red-500/30"
          >
            ⏻
          </button>
        </div>
      )}

      {/* Transactions Panel */}
      <AnimatePresence>
        {showTransactions && wallet && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full right-0 mt-4 w-[500px] max-h-[600px] overflow-hidden bg-slate-900/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl z-50"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 p-4 border-b border-white/10">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-bold text-lg">Transaction History</h3>
                <button
                  onClick={() => setShowTransactions(false)}
                  className="text-white hover:text-red-400 transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="mt-2 text-sm text-purple-300">
                Network: {networkInfo.name}
              </div>
            </div>

            {/* Transactions List */}
            <div className="max-h-[500px] overflow-y-auto p-4 space-y-3">
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📜</div>
                  <p className="text-gray-400">No transactions yet</p>
                </div>
              ) : (
                transactions.map((tx) => (
                  <div
                    key={tx.txHash}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {tx.type === 'MINT' && '🪙'}
                          {tx.type === 'TRANSFER' && '➡️'}
                          {tx.type === 'APPROVE' && '✅'}
                          {tx.type === 'BURN' && '🔥'}
                        </span>
                        <span className="text-white font-semibold">{tx.type}</span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          tx.status === 'confirmed'
                            ? 'bg-green-500/20 text-green-400'
                            : tx.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {tx.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between text-gray-400">
                        <span>Amount:</span>
                        <span className="text-white font-semibold">{tx.amount} Credits</span>
                      </div>
                      {tx.blockNumber && (
                        <div className="flex justify-between text-gray-400">
                          <span>Block:</span>
                          <span className="text-purple-300 font-mono">#{tx.blockNumber}</span>
                        </div>
                      )}
                      {tx.gasUsed && (
                        <div className="flex justify-between text-gray-400">
                          <span>Gas:</span>
                          <span className="text-blue-300">{tx.gasUsed} MATIC</span>
                        </div>
                      )}
                      <div className="flex justify-between text-gray-400">
                        <span>Time:</span>
                        <span className="text-gray-300">{formatTimestamp(tx.timestamp)}</span>
                      </div>
                      <div className="pt-2 border-t border-white/10">
                        <a
                          href={blockchainService.getExplorerUrl(tx.txHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:text-purple-300 text-xs font-mono break-all flex items-center gap-1"
                        >
                          <span>🔍</span>
                          <span>{tx.txHash.substring(0, 20)}...{tx.txHash.substring(tx.txHash.length - 8)}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Contract Info */}
            <div className="bg-white/5 p-4 border-t border-white/10">
              <div className="text-xs text-gray-400 space-y-1">
                <div className="flex justify-between">
                  <span>Contract:</span>
                  <span className="text-purple-300 font-mono">
                    {formatAddress(blockchainService.getContractAddress())}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Chain ID:</span>
                  <span className="text-blue-300">{networkInfo.chainId}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

