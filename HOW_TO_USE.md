# 🚀 How to Use MicroLoanX - Complete Guide

## 📋 Quick Start

1. **Start the Application**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

2. **Wait for Initialization**
   - You'll see "Initializing MicroLoanX" screen for a few seconds
   - The app automatically seeds test data and connects to XRPL testnet

3. **Select a Test Account**
   - Click "Select Test Account" in the top-right corner
   - Choose from 8 pre-configured demo accounts (4 borrowers, 4 lenders)

## 👥 Test Accounts Available

### **Borrowers** (People seeking loans)
- **Maria Santos**: 92/100 trust score, $5K balance, Agriculture focus
- **Ahmed Hassan**: 88/100 trust score, $3.2K balance, Healthcare/Business
- **Priya Sharma**: 76/100 trust score, $2.8K balance, Education
- **Carlos Rodriguez**: 68/100 trust score, $1.5K balance, General business

### **Lenders** (People providing loans)
- **Jennifer Chen**: $50K balance, Low risk tolerance, Auto-funding enabled
- **Michael Thompson**: $75K balance, Medium risk tolerance
- **Sarah Williams**: $100K balance, High risk tolerance, Auto-funding enabled
- **David Kim**: $25K balance, Low risk tolerance

## 🎯 Main Features

### **1. Dashboard Overview**
- **View Mode Toggle**: Switch between "Borrower" and "Lender" modes in the navbar
- **Balance Display**: See available RLUSD balance in top-right
- **Trust Score**: Reputation score shown for borrowers
- **Platform Statistics**: Live stats on homepage

### **2. Borrower Features** 

#### **Create Loan Request**
1. Switch to borrower account (Maria, Ahmed, Priya, or Carlos)
2. Fill out the loan request form:
   - **Amount**: $10 - $25,000 RLUSD
   - **Purpose**: Select from predefined categories
   - **Repayment Period**: 7-60 days
   - **Tags**: Add relevant tags for categorization
3. Review the **Loan Preview** showing:
   - Interest rate (based on trust score)
   - Total repayment amount
   - Risk assessment
4. Click "Submit Loan Request"

#### **View Loan History**
- See all your past and current loans
- Track status: PENDING → FUNDED → REPAID
- View transaction hashes and explorer links

### **3. Lender Features**

#### **Browse Available Loans**
1. Switch to lender account (Jennifer, Michael, Sarah, or David)
2. Browse marketplace of loan requests
3. Filter by:
   - Amount range
   - Risk level
   - Purpose category
   - Repayment period

#### **Fund a Loan**
1. Click on any loan request
2. Review borrower's:
   - Trust score and history
   - Purpose and amount
   - Risk assessment
3. Click "Fund Loan" to approve
4. Funds are escrowed automatically

## 🧪 Real Testnet Features

### **XRPL Connection Testing**
In the borrower dashboard, find the **"Real Testnet Transactions"** section:

#### **1. Test XRPL Connection**
- Click "Test Connection" to verify live XRPL testnet connectivity
- Shows network info, ledger index, server version

#### **2. Create Funded Wallet**
- Click "Create & Fund Wallet" 
- Generates a new XRPL testnet address
- Auto-funds it with testnet XRP via faucet
- **Save the address for testing!**

#### **3. Send Real XRP Payments**
1. Enter a destination address (use the wallet you just created)
2. Enter amount in XRP (minimum 0.000001)
3. Click "Send XRP Payment"
4. Uses demo wallet seeds to send **actual transactions** on XRPL testnet
5. Get transaction hash and ledger confirmation

#### **4. Check Account Balances**
1. Enter any XRPL address
2. Click "Check Balance" 
3. See real XRP and RLUSD balances from the blockchain

#### **5. Demo Wallet Addresses**
- **Maria Santos (Testnet)**: `rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh`
- **Ahmed Hassan (Testnet)**: `rUn84CJowRBX4T9w7qjpDC8BreMnqZNYhh`
- **Jennifer Chen (Testnet)**: `rDdECVmwpkRo8FtY3ywCYhHX8VfuSAqghj`
- **Sarah Williams (Testnet)**: `rPp4qpHWGYBV8wC5KvCf5G8aGBkR5kZ4Ts`

## 🔗 Testing Real Transactions

### **Step-by-Step Real XRPL Testing**

1. **Create a Test Wallet**
   ```
   Go to: Borrower Dashboard → Real Testnet Transactions → Create Funded Wallet
   Result: New address with ~1000 XRP funded
   Example: rABC123...DEF456 (copy this address)
   ```

2. **Send XRP Between Addresses**
   ```
   From: Demo wallet (Maria Santos)
   To: Your new wallet address
   Amount: 10 XRP
   Memo: "MicroLoanX Test"
   ```

3. **Verify Transaction**
   ```
   Check console for transaction hash
   Visit: https://testnet.xrpl.org/transactions/[HASH]
   Confirm transaction on XRPL explorer
   ```

4. **Check Balance**
   ```
   Enter your new wallet address
   Should show: 1010 XRP (1000 + 10 received)
   ```

## 🎨 UI Features

### **Account Switching**
- Beautiful gradient modal with all test accounts
- Role indicators (borrower/lender badges)
- Balance display for each account
- One-click switching between users

### **Real-time Updates**
- Loan statuses update automatically
- Balance changes reflect immediately
- Transaction confirmations via console
- Live XRPL network connection status

### **Responsive Design**
- Works on desktop, tablet, and mobile
- Dark theme optimized for readability
- Smooth animations and transitions
- Glass morphism design elements

## 📊 Understanding the Data

### **Trust Scores** (for Borrowers)
- **90-100**: Excellent (lowest interest rates)
- **80-89**: Very Good (favorable rates)
- **70-79**: Good (standard rates)
- **60-69**: Fair (higher rates)
- **Below 60**: Poor (highest rates or declined)

### **Loan Statuses**
- **PENDING**: Waiting for lender approval
- **FUNDED**: Money escrowed, borrower can access funds
- **REPAID**: Loan completed successfully
- **DEFAULTED**: Loan not repaid on time

### **Interest Rates**
- Calculated dynamically based on trust score
- Range: 6.8% - 9.8% annually
- Lower trust score = higher interest rate
- Risk premium applied automatically

## 🛠 Troubleshooting

### **Common Issues**

1. **"Database not initialized" Error**
   - Refresh the page
   - Wait for full initialization (10-15 seconds)

2. **XRPL Connection Failed**
   - Check internet connection
   - Testnet might be temporarily down
   - Try again in a few minutes

3. **Transaction Failed**
   - Check if destination address is valid XRPL format
   - Ensure sufficient balance in sender wallet
   - Amount must be at least 0.000001 XRP

4. **Input Fields Not Visible**
   - Updated CSS should fix this
   - Text should be white on dark background
   - Focus states highlight in primary blue

### **Browser Console**
Always check the browser console (F12) for:
- Detailed error messages
- Transaction confirmations
- XRPL connection status
- Network responses

## 🔧 Technical Details

### **What's Real vs Mock**

#### **Real XRPL Integration** ✅
- Connection to XRPL testnet servers
- Wallet generation and funding
- XRP payment transactions
- Balance queries from blockchain
- Transaction history from XRPL

#### **Demo/Mock Elements** 🎭
- Loan escrow contracts (simulated)
- RLUSD token transactions (simulated)
- User profiles and reputation data (demo)
- IndexedDB for local data storage

### **Data Persistence**
- User data: Stored locally (resets on cache clear)
- XRPL transactions: Permanent on testnet blockchain
- Wallet keys: Demo keys for testing only

## 🚀 Advanced Usage

### **For Developers**
1. **Inspect Network Calls**: Watch XRPL API requests in DevTools
2. **Custom Addresses**: Use your own testnet addresses
3. **Transaction Monitoring**: Follow transactions on XRPL explorer
4. **Error Handling**: Check console for detailed error information

### **For Demo/Presentation**
1. **Quick Demo Flow**: 
   - Switch between accounts
   - Create loan request as borrower
   - Switch to lender and fund the loan
   - Show real XRP transaction
2. **Key Points to Highlight**:
   - Real blockchain integration
   - Beautiful UI/UX
   - Complete loan lifecycle
   - Privacy-preserving design

## 📈 Next Steps / Enhancements

See the enhancement suggestions in the next section of this guide!

## 🎯 Success Metrics

**You'll know it's working when:**
- ✅ You can switch between all 8 test accounts smoothly
- ✅ Loan requests are created and displayed properly
- ✅ XRPL connection test passes
- ✅ You can create and fund new testnet wallets
- ✅ XRP payments complete with transaction hashes
- ✅ Balance queries return real data from XRPL
- ✅ All text in input fields is clearly visible
- ✅ UI animations are smooth and responsive

**Enjoy exploring the future of decentralized finance!** 🌟 