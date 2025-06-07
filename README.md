# MicroLoanX 🚀

**Decentralized, Pseudonymous Microloan Platform for Financial Inclusion**

Built for the **Ripple x EasyA Singapore Hackathon** - Empowering unbanked entrepreneurs and privacy-conscious borrowers through the XRP Ledger.

![MicroLoanX Banner](https://images.unsplash.com/photo-1559526324-4b87b5e36e44?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400&q=80)

## 🌟 **Overview**

MicroLoanX is a revolutionary decentralized microloan platform that bridges the gap between unbanked borrowers and global lenders. Using XRP Ledger's escrow functionality and RLUSD, we enable **private, reputation-based microloans** where borrowers maintain anonymity through Decentralized Identifiers (DIDs) while building verifiable trust scores.

## 🚀 **Quick Start**

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation & Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/hackathon2025xrp.git
cd hackathon2025xrp
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm run dev
```

4. **Open in browser**
Navigate to [http://localhost:3000](http://localhost:3000)

### 🔑 **Demo Login Credentials**

The application automatically initializes with test data. Click "Select Test Account" to choose from pre-configured demo accounts:

#### **Borrower Accounts**
| Name | Role | Balance | Trust Score | Specialization |
|------|------|---------|-------------|----------------|
| **Maria Santos** | Borrower | $5,000 RLUSD | 92/100 | Agriculture |
| **Ahmed Hassan** | Borrower | $3,200 RLUSD | 88/100 | Healthcare & Business |
| **Priya Sharma** | Borrower | $2,800 RLUSD | 76/100 | Education |
| **Carlos Rodriguez** | Borrower | $1,500 RLUSD | 68/100 | General |

#### **Lender Accounts**
| Name | Role | Balance | Risk Tolerance | Auto-Funding |
|------|------|---------|----------------|--------------|
| **Jennifer Chen** | Lender | $50,000 RLUSD | Low Risk | Enabled |
| **Michael Thompson** | Lender | $75,000 RLUSD | Medium Risk | Disabled |
| **Sarah Williams** | Lender | $100,000 RLUSD | High Risk | Enabled |
| **David Kim** | Lender | $25,000 RLUSD | Low Risk | Disabled |

### 🎮 **How to Use**

1. **Select Account**: Click "Select Test Account" and choose a user
2. **Switch Views**: Toggle between Borrower and Lender dashboards
3. **Create Loans** (Borrowers): Submit loan requests with purpose and amount
4. **Fund Loans** (Lenders): Browse and fund available loan opportunities
5. **Track Progress**: Monitor loan status and reputation scores

## ✅ **Current Features (Working)**

### 🏦 **For Borrowers**
- ✅ **Anonymous Profile Creation**: DID-based pseudonymous identities
- ✅ **Smart Loan Requests**: Create requests with purpose tags
- ✅ **Dynamic Interest Rates**: Trust score affects rates
- ✅ **Reputation Building**: Track successful repayments
- ✅ **Portfolio Dashboard**: View active and past loans

### 💰 **For Lenders**
- ✅ **De-identified Profiles**: View borrower reputation without personal data
- ✅ **Risk Assessment**: See trust scores and repayment history
- ✅ **Portfolio Dashboard**: Track all funded loans
- ✅ **Transaction History**: Complete audit trail
- ✅ **User Switching**: Test different lender profiles

### 🔐 **Privacy & Security**
- ✅ **Pseudonymous IDs**: Cryptographic identity protection
- ✅ **DID Integration**: Mock decentralized identity system
- ✅ **Encrypted Metadata**: Secure loan data storage
- ✅ **Local Database**: IndexedDB for demo data persistence

### 📊 **Reputation System**
- ✅ **Multi-dimensional Scoring**: Category-based trust scores
- ✅ **Verification Levels**: Unverified → Basic → Enhanced
- ✅ **Historical Tracking**: Complete repayment history
- ✅ **Dynamic Updates**: Real-time score calculations

## 🔧 **XRPL Integration Status**

### ✅ **Implemented**
- XRPL Testnet connection
- Wallet generation and management
- Account balance checking
- Basic payment functionality
- Transaction history tracking
- Testnet explorer integration

### 🚧 **In Progress**
- RLUSD trust line setup
- Escrow contract implementation
- Automated loan funding
- Real-time balance updates

### 📋 **To Implement**
- Mainnet deployment
- Production escrow contracts
- IPFS metadata storage
- Real DID integration

## 🛠 **Technology Stack**

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with custom glass morphism design
- **Animations**: Framer Motion for smooth interactions
- **Blockchain**: XRP Ledger (XRPL) with xrpl.js SDK
- **Currency**: RLUSD (Ripple USD stablecoin)
- **Database**: IndexedDB for local data persistence
- **Identity**: Mock DID implementation for demo
- **State Management**: React Context with TypeScript

## 🏗 **Architecture**

### **Core Components**

```
src/
├── app/                    # Next.js 13+ app directory
│   ├── page.tsx           # Main dashboard with user switching
│   ├── layout.tsx         # Root layout with animations
│   └── globals.css        # Tailwind styles + custom theme
├── components/
│   ├── borrower/          # Borrower-specific components
│   │   └── EnhancedBorrowerView.tsx
│   ├── lender/            # Lender-specific components
│   │   └── EnhancedLenderView.tsx
│   └── layout/            # Navigation and layout
│       └── Navbar.tsx
├── lib/
│   ├── contexts/          # React Context providers
│   │   └── AccountContext.tsx
│   ├── database/          # IndexedDB management
│   │   ├── db.ts          # Database operations
│   │   └── seed-data.ts   # Test data seeding
│   └── xrpl/              # XRPL integration layer
│       ├── client.ts      # Basic XRPL connection
│       ├── enhanced-client.ts # Advanced XRPL features
│       └── escrow.ts      # Escrow management
└── types/
    └── index.ts           # TypeScript type definitions
```

## 🔗 **XRPL Integration**

### **Testnet Configuration**
- **Network**: XRPL Testnet (`wss://s.altnet.rippletest.net:51233`)
- **Currency**: RLUSD (Ripple USD)
- **Explorer**: [XRPL Testnet Explorer](https://testnet.xrpl.org)

### **Demo Wallets** (Testnet Only)
```
Borrowers:
- Maya Patel: rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh
- Ahmed Hassan: rUn84CJowRBX4T9w7qjpDC8BreMnqZNYhh

Lenders:
- Sarah Chen: rDdECVmwpkRo8FtY3ywCYhHX8VfuSAqghj
- Michael Torres: rPp4qpHWGYBV8wC5KvCf5G8aGBkR5kZ4Ts
```

## 🎨 **Design System**

### **Color Palette**
- **Primary**: Blue (#3B82F6) for trust and reliability
- **Secondary**: Teal (#14B8A6) for growth and stability
- **Success**: Green (#10B981) for positive states
- **Accent**: Orange (#F59E0B) for calls-to-action
- **Warning**: Yellow (#EAB308) for pending states
- **Error**: Red (#EF4444) for negative states

### **UI/UX Features**
- **Glass Morphism**: Modern frosted glass effects
- **Micro-interactions**: Smooth Framer Motion animations
- **Dark Theme**: Optimized for extended usage
- **Responsive Design**: Mobile-first approach
- **Accessibility**: High contrast ratios and semantic HTML

## 🐛 **Known Issues & Limitations**

### **Current Limitations**
1. **Mock Data**: Uses simulated blockchain transactions
2. **Local Storage**: Data resets on browser clear
3. **Single Session**: No persistent authentication
4. **Testnet Only**: Not connected to mainnet

### **Planned Fixes**
1. Real XRPL escrow integration
2. Persistent user sessions
3. IPFS metadata storage
4. Production-ready security

## 📈 **Roadmap**

### **Phase 1: MVP (Current)**
- ✅ Basic borrower/lender interface
- ✅ Mock DID integration
- ✅ Reputation system
- ✅ RLUSD support
- ✅ XRPL testnet connection

### **Phase 2: Enhanced Features**
- 🔄 Real XRPL escrow integration
- 🔄 IPFS metadata storage
- 🔄 Advanced reputation algorithms
- 🔄 Multi-currency support
- 🔄 Lending pools

### **Phase 3: Production Ready**
- ⏳ Mainnet deployment
- ⏳ Real DID integration
- ⏳ Regulatory compliance
- ⏳ Mobile app
- ⏳ Partnership integrations

## 🤝 **Contributing**

### **Development Setup**
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Type checking
npx tsc --noEmit
```

### **Project Structure**
- Follow existing component patterns
- Use TypeScript for all new code
- Implement proper error handling
- Add comprehensive comments

## 🔍 **Troubleshooting**

### **Common Issues**

1. **Database not initialized**
   - Refresh the page to trigger re-initialization
   - Check browser console for errors

2. **XRPL connection failed**
   - Ensure internet connection
   - Check if testnet is accessible

3. **User switching not working**
   - Wait for database initialization to complete
   - Try refreshing the page

### **Debug Mode**
Open browser console to see detailed logs:
- Database operations
- XRPL connection status
- Transaction details

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 **Hackathon Submission**

### **Demo Video**
🎥 [Watch Demo Video](https://loom.com/your-demo-video) *(Coming Soon)*

### **Live Demo**
🌐 [Try MicroLoanX](https://microloanx.vercel.app) *(Coming Soon)*

### **Team**
- **Your Name** - Full Stack Developer
- **Built for**: Ripple x EasyA Singapore Hackathon 2025

### **Achievements**
- 🎯 **Financial Inclusion**: Addressing real-world problem of unbanked populations
- 🔒 **Privacy Innovation**: Pseudonymous lending with reputation building
- ⚡ **XRPL Integration**: Leveraging XRPL's unique capabilities
- 🎨 **Modern UX**: Beautiful, accessible interface design
- 🌍 **Global Impact**: Enabling cross-border microfinance

---

## 🙏 **Acknowledgments**

- **Ripple** for the XRP Ledger technology
- **EasyA** for organizing the hackathon
- **Next.js** team for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Framer Motion** for smooth animations

---

**Ready to explore decentralized microfinance? Start by selecting a test account and dive into the future of inclusive lending!** 🚀
