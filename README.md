# MicroLoanX 🚀

**Decentralized, Pseudonymous Microloan Platform for Financial Inclusion**

Built for the **Ripple x EasyA Singapore Hackathon** - Empowering unbanked entrepreneurs and privacy-conscious borrowers through the XRP Ledger.

![MicroLoanX Banner](https://images.unsplash.com/photo-1559526324-4b87b5e36e44?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400&q=80)

## 🌟 **Overview**

MicroLoanX is a revolutionary decentralized microloan platform that bridges the gap between unbanked borrowers and global lenders. Using XRP Ledger's escrow functionality and RLUSD, we enable **private, reputation-based microloans** where borrowers maintain anonymity through Decentralized Identifiers (DIDs) while building verifiable trust scores.

### 🎯 **Key Value Propositions**

- **Privacy First**: Borrowers remain pseudonymous via DIDs, protecting personal information
- **Reputation-Based Lending**: Dynamic trust scores based on repayment history and loan categories
- **Global Access**: XRPL enables instant, low-cost cross-border transactions
- **Financial Inclusion**: Serves unbanked populations through crypto-native lending
- **Transparent Escrows**: All transactions are verifiable on XRPL testnet

## ✨ **Features**

### 🏦 **For Borrowers**
- **Anonymous Profile Creation**: Generate DID-based pseudonymous identities
- **Smart Loan Requests**: Create requests with purpose tags (#education, #healthcare, #business, etc.)
- **Dynamic Interest Rates**: Better trust scores = lower interest rates
- **Reputation Building**: Successful repayments improve your trust score across categories
- **RLUSD Integration**: Borrow in stable USD-pegged token

### 💰 **For Lenders**
- **De-identified Profiles**: View borrower reputation without personal data
- **Risk Assessment**: See trust scores, repayment history, and risk levels
- **Escrow Protection**: Funds locked in XRPL escrows until loan terms are met
- **Portfolio Dashboard**: Track all funded loans and returns
- **Transaction Transparency**: Direct links to XRPL block explorer

### 🔐 **Privacy & Security**
- **Pseudonymous IDs**: Borrowers identified only by cryptographic IDs
- **DID Integration**: Decentralized identity management (mock implementation)
- **Encrypted Metadata**: Loan purposes and details stored securely
- **XRPL Escrows**: Smart contract-like functionality for secure fund management

### 📊 **Reputation System**
- **Multi-dimensional Scoring**: Track performance across loan categories
- **Verification Levels**: Unverified → Basic → Enhanced
- **Timely Repayment Bonuses**: Faster repayment improves trust score
- **Category Expertise**: Build reputation in specific loan types

## 🛠 **Technology Stack**

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with custom glass morphism design
- **Animations**: Framer Motion for smooth interactions
- **Blockchain**: XRP Ledger (XRPL) with xrpl.js SDK
- **Currency**: RLUSD (Ripple USD stablecoin)
- **Identity**: Mock DID implementation for demo
- **State Management**: React hooks with TypeScript
- **Deployment**: Vercel-ready configuration

## 🚀 **Getting Started**

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

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

### 🎮 **Demo Usage**

1. **Select a Demo User**: Choose from pre-configured borrower/lender profiles
2. **Borrower Portal**: 
   - Create loan requests with purpose and tags
   - View reputation score and loan history
   - See dynamic interest rates based on trust score
3. **Lender Dashboard**:
   - Browse available loan opportunities
   - Fund loans through mock XRPL escrows
   - Track portfolio performance
4. **Transaction Links**: Click transaction hashes to view on XRPL testnet explorer

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
│   │   └── BorrowerView.tsx
│   └── lender/            # Lender-specific components
│       └── LenderView.tsx
├── lib/
│   └── xrpl/              # XRPL integration layer
│       ├── client.ts      # XRPL connection & utilities
│       └── escrow.ts      # Escrow & reputation management
└── types/
    └── index.ts           # TypeScript type definitions
```

### **Data Flow**

1. **Loan Request Creation**: Borrower creates request → Stored with DID metadata
2. **Lender Discovery**: Available loans displayed with risk scores
3. **Escrow Creation**: Lender funds loan → XRPL escrow created
4. **Repayment**: Borrower repays → Escrow released → Reputation updated

## 🔗 **XRPL Integration**

### **Testnet Configuration**
- **Network**: XRPL Testnet (`wss://s.altnet.rippletest.net:51233`)
- **Currency**: RLUSD (Ripple USD)
- **Explorer**: [XRPL Testnet Explorer](https://testnet.xrpl.org)

### **Smart Contract Features**
- **EscrowCreate**: Lock funds with time-based conditions
- **EscrowFinish**: Release funds on successful repayment
- **Memo Fields**: Store encrypted loan metadata
- **Multi-signature**: Support for complex approval flows

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
- **Primary**: Teal/Cyan for trust and stability
- **Secondary**: Blue for reliability
- **Accent**: Orange for calls-to-action
- **Success**: Green for positive states
- **Warning**: Yellow for pending states
- **Error**: Red for negative states

### **UI/UX Principles**
- **Glass Morphism**: Modern frosted glass effects
- **Micro-interactions**: Smooth Framer Motion animations
- **Dark Theme**: Optimized for extended usage
- **Responsive Design**: Mobile-first approach
- **Accessibility**: High contrast ratios and semantic HTML

## 📈 **Roadmap**

### **Phase 1: MVP (Current)**
- ✅ Basic borrower/lender interface
- ✅ Mock DID integration
- ✅ Reputation system
- ✅ RLUSD support
- ✅ XRPL escrow simulation

### **Phase 2: Enhanced Features**
- 🔄 Real XRPL testnet integration
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

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

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
npm run type-check
```

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
- ⚡ **XRPL Integration**: Leveraging XRPL's unique escrow capabilities
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

<div align="center">

**Built with ❤️ for financial inclusion and powered by XRP Ledger**

[🌐 Website](https://microloanx.vercel.app) • [📧 Contact](mailto:your-email@example.com) • [🐦 Twitter](https://twitter.com/yourusername)

</div>
