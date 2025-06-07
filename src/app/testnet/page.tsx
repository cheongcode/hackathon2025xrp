'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  BeakerIcon,
  WifiIcon,
  BanknotesIcon,
  WalletIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { 
  testXRPLConnection, 
  createTestnetFundedWallet, 
  sendRealXRPPayment, 
  getAccountBalance,
  DEMO_TESTNET_WALLETS
} from '@/lib/xrpl/client';

export default function TestnetPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 relative">
      <div className="container-responsive section-spacing">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <BeakerIcon className="h-16 w-16 text-accent-400 mr-4" />
            <div>
              <h1 className="text-responsive-3xl gradient-text-premium">XRPL Testnet Laboratory</h1>
              <p className="text-responsive-lg text-slate-300 mt-2">
                Experiment with real blockchain transactions in a safe testnet environment
              </p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-warning-500/10 to-accent-500/10 border border-warning-400/30 rounded-xl p-4 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-warning-400" />
              <span className="text-warning-300 font-semibold">Testnet Environment</span>
            </div>
            <p className="text-slate-300 text-sm">
              This page uses the XRPL Testnet for safe experimentation. All transactions are on the test network 
              and have no real-world value. Perfect for learning and development!
            </p>
          </div>
        </motion.div>

        {/* Main Testing Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Connection & Wallet Management */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* XRPL Connection Status */}
            <div className="glass-card">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-success-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <WifiIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">XRPL Connection</h3>
                  <p className="text-sm text-slate-300">Test blockchain connectivity</p>
                </div>
              </div>
              
              <button
                onClick={async () => {
                  const result = await testXRPLConnection();
                  if (result.success) {
                    alert(`✅ XRPL Connected!\n\nNetwork: ${result.data?.network}\nLedger: ${result.data?.ledger_index}\nReserve: ${result.data?.reserve || 'N/A'}`);
                  } else {
                    alert(`❌ Connection Failed: ${result.message}`);
                  }
                }}
                className="btn-primary w-full"
              >
                <WifiIcon className="h-5 w-5 mr-2" />
                Test Connection
              </button>
            </div>

            {/* Create New Testnet Wallet */}
            <div className="glass-card">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-warning-500 rounded-lg flex items-center justify-center">
                  <WalletIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Create Testnet Wallet</h3>
                  <p className="text-sm text-slate-300">Generate a funded test wallet</p>
                </div>
              </div>
              
              <button
                onClick={async () => {
                  try {
                    const result = await createTestnetFundedWallet();
                    const message = `🎉 New Wallet Created!\n\nAddress: ${result.wallet.address}\n\nSeed: ${result.wallet.seed}\n\nFunded: ${result.funded ? 'Yes' : 'No'}\nBalance: ${result.balance || 0} XRP\n\n💡 Copy this address for testing!\n\n⚠️ This is a testnet wallet - no real value`;
                    alert(message);
                    console.log('New testnet wallet:', result);
                  } catch (error) {
                    console.error('Failed to create wallet:', error);
                    alert('❌ Failed to create wallet. Check console for details.');
                  }
                }}
                className="btn-secondary w-full"
              >
                <WalletIcon className="h-5 w-5 mr-2" />
                Create & Fund Wallet
              </button>
            </div>

            {/* Check Account Balance */}
            <div className="glass-card">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <CurrencyDollarIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Check Balance</h3>
                  <p className="text-sm text-slate-300">Query account balances</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter XRPL address (rXXXXXXXXX...)"
                  className="input-primary"
                  id="balanceAddress"
                />
                <button
                  onClick={async () => {
                    const address = (document.getElementById('balanceAddress') as HTMLInputElement)?.value;
                    
                    if (!address) {
                      alert('⚠️ Please enter an address');
                      return;
                    }

                    if (!/^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(address)) {
                      alert('❌ Invalid XRPL address format');
                      return;
                    }

                    try {
                      const balance = await getAccountBalance(address);
                      const message = `💰 Account Balance\n\nAddress: ${address.slice(0, 12)}...${address.slice(-8)}\n\nXRP: ${balance.xrp.toFixed(6)}\nRLUSD: ${balance.rlusd.toFixed(2)}\n\nData: ${JSON.stringify(balance, null, 2)}`;
                      alert(message);
                      console.log('Balance result:', balance);
                    } catch (error) {
                      console.error('Balance check error:', error);
                      alert('❌ Failed to check balance. Account may not exist or be funded.');
                    }
                  }}
                  className="btn-accent w-full"
                >
                  <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                  Check Balance
                </button>
              </div>
            </div>
          </motion.div>

          {/* Payment Testing */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="glass-card h-full">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-error-500 to-warning-500 rounded-lg flex items-center justify-center">
                  <BanknotesIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Send XRP Payment</h3>
                  <p className="text-sm text-slate-300">Execute real testnet transactions</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Destination Address
                  </label>
                  <input
                    type="text"
                    placeholder="rXXXXXXXXXX... (e.g., rDdECVmwpkRo8FtY3ywCYhHX8VfuSAqghj)"
                    className="input-primary"
                    id="toAddress"
                  />
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="text-slate-400">Quick fill:</span>
                    <button 
                      onClick={() => {
                        const input = document.getElementById('toAddress') as HTMLInputElement;
                        if (input) input.value = DEMO_TESTNET_WALLETS.lender1.address;
                      }}
                      className="text-primary-400 hover:text-primary-300 underline"
                    >
                      Lender1
                    </button>
                    <button 
                      onClick={() => {
                        const input = document.getElementById('toAddress') as HTMLInputElement;
                        if (input) input.value = DEMO_TESTNET_WALLETS.lender2.address;
                      }}
                      className="text-primary-400 hover:text-primary-300 underline"
                    >
                      Lender2
                    </button>
                    <button 
                      onClick={() => {
                        const input = document.getElementById('toAddress') as HTMLInputElement;
                        if (input) input.value = DEMO_TESTNET_WALLETS.borrower1.address;
                      }}
                      className="text-primary-400 hover:text-primary-300 underline"
                    >
                      Borrower1
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Amount (XRP)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 1.5"
                    step="0.000001"
                    min="0.000001"
                    max="1000"
                    className="input-primary"
                    id="xrpAmount"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Min: 0.000001 XRP, Max: 1000 XRP
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Memo (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Test payment from MicroLoanX"
                    className="input-primary"
                    id="paymentMemo"
                    defaultValue="MicroLoanX Testnet Payment"
                  />
                </div>

                <button
                  onClick={async () => {
                    const toAddressInput = document.getElementById('toAddress') as HTMLInputElement;
                    const amountInput = document.getElementById('xrpAmount') as HTMLInputElement;
                    const memoInput = document.getElementById('paymentMemo') as HTMLInputElement;
                    
                    const toAddress = toAddressInput?.value?.trim();
                    const amount = amountInput?.value?.trim();
                    const memo = memoInput?.value?.trim() || 'MicroLoanX Testnet Payment';
                    
                    if (!toAddress || !amount) {
                      alert('⚠️ Please enter both destination address and amount');
                      return;
                    }

                    // Validation
                    if (!/^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(toAddress)) {
                      alert('❌ Invalid XRPL address format. Address must start with "r" and be 25-34 characters long.');
                      return;
                    }

                    const amountNumber = parseFloat(amount);
                    if (isNaN(amountNumber) || amountNumber <= 0) {
                      alert('❌ Invalid amount. Must be a positive number.');
                      return;
                    }

                    if (amountNumber < 0.000001) {
                      alert('❌ Amount too small. Minimum is 0.000001 XRP.');
                      return;
                    }

                    if (amountNumber > 1000) {
                      alert('❌ Amount too large. Maximum is 1000 XRP for demo.');
                      return;
                    }

                    try {
                      // Use the first demo wallet as sender
                      const result = await sendRealXRPPayment(
                        DEMO_TESTNET_WALLETS.borrower1.seed,
                        toAddress,
                        amount,
                        memo
                      );
                      
                      if (result.success) {
                        const explorerUrl = `https://testnet.xrpl.org/transactions/${result.txHash}`;
                        const message = `🎉 Payment Successful!\n\nFrom: ${DEMO_TESTNET_WALLETS.borrower1.address}\nTo: ${toAddress}\nAmount: ${amount} XRP\n\nTransaction Hash: ${result.txHash}\nLedger Index: ${result.ledgerIndex}\n\n🔍 View on Explorer:\n${explorerUrl}`;
                        alert(message);
                        console.log('Payment result:', result);
                        
                        // Clear form on success
                        toAddressInput.value = '';
                        amountInput.value = '';
                        
                        // Option to open explorer
                        if (confirm('Open transaction in XRPL Explorer?')) {
                          window.open(explorerUrl, '_blank');
                        }
                      } else {
                        alert(`❌ Payment Failed: ${result.error}`);
                      }
                    } catch (error) {
                      console.error('Payment error:', error);
                      alert('❌ Payment failed. Check console for details.');
                    }
                  }}
                  className="btn-warning w-full py-3"
                >
                  <BanknotesIcon className="h-5 w-5 mr-2" />
                  Send XRP Payment
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Demo Wallets Reference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <div className="glass-card">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <WalletIcon className="h-6 w-6 mr-2 text-accent-400" />
              Demo Testnet Wallets
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(DEMO_TESTNET_WALLETS).map(([key, wallet]) => (
                <div key={key} className="bg-dark-800/50 rounded-lg p-4 border border-slate-600/30">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-secondary-500 to-primary-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {wallet.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{wallet.name}</h4>
                      <p className="text-xs text-slate-400">{key}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Address:</p>
                      <div className="flex items-center space-x-2">
                        <code className="text-xs bg-dark-700/50 rounded px-2 py-1 text-slate-300 flex-1 truncate">
                          {wallet.address}
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(wallet.address);
                            alert('Address copied to clipboard!');
                          }}
                          className="text-primary-400 hover:text-primary-300 transition-colors"
                          title="Copy address"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Seed (Secret):</p>
                      <div className="flex items-center space-x-2">
                        <code className="text-xs bg-dark-700/50 rounded px-2 py-1 text-slate-300 flex-1 truncate">
                          {wallet.seed.slice(0, 8)}...
                        </code>
                        <button
                          onClick={() => {
                            if (confirm('⚠️ Copying wallet seed to clipboard. This is sensitive information - only use in testnet!')) {
                              navigator.clipboard.writeText(wallet.seed);
                              alert('Seed copied to clipboard!');
                            }
                          }}
                          className="text-warning-400 hover:text-warning-300 transition-colors"
                          title="Copy seed (use caution)"
                        >
                          🔐
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-warning-500/10 to-error-500/10 border border-warning-400/30 rounded-lg">
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-warning-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-warning-300 font-semibold mb-1">Security Notice</h4>
                  <p className="text-slate-300 text-sm">
                    These wallets are for testnet demonstration only. Never use these seeds on mainnet 
                    or with real XRP. Always generate new, secure wallets for production use.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 