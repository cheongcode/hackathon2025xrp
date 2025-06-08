# MicroLoanX
🎉 3rd Place Winner at EasyA x Ripple Apex Hackathon (XRP Ledger Track)

**Decentralized Microloan Platform for Financial Inclusion**

MicroLoanX is a revolutionary lending platform built on the XRP Ledger that connects unbanked borrowers with global lenders through pseudonymous, reputation-based microloans. Built for the Ripple x EasyA Singapore Hackathon, this platform demonstrates how blockchain technology can solve real-world financial inclusion challenges.

<img width="250" alt="Screenshot 2025-06-08 at 11 23 05 AM" src="https://github.com/user-attachments/assets/056e52de-cb26-4063-ad21-02ef06a08aa5" />

<img width="250" alt="Screenshot 2025-06-08 at 11 25 04 AM" src="https://github.com/user-attachments/assets/25253f30-ec0f-4da9-a9e0-23456e2ecd61" />

<img width="250" alt="Screenshot 2025-06-08 at 11 25 17 AM" src="https://github.com/user-attachments/assets/6d4fa096-f29a-4e9b-bc6b-3370c25d6d01" />

<img width="250" alt="Screenshot 2025-06-08 at 11 25 32 AM" src="https://github.com/user-attachments/assets/95613edc-ed20-4b7e-85a7-9634bebdd152" />

<img width="250" alt="Screenshot 2025-06-08 at 11 25 43 AM" src="https://github.com/user-attachments/assets/8dc101d0-65d2-48c6-9dc6-472613c0af8e" />

<img width="250" alt="Screenshot 2025-06-08 at 11 25 51 AM" src="https://github.com/user-attachments/assets/17514cb0-a811-4cca-af23-82ba40670e00" />

<img width="250" alt="Screenshot 2025-06-08 at 11 26 05 AM" src="https://github.com/user-attachments/assets/aa8fd1da-de91-4673-960d-ec4a7756abbf" />

<img width="250" alt="Screenshot 2025-06-08 at 11 26 23 AM" src="https://github.com/user-attachments/assets/ab6cda11-1790-4d94-986a-3b84f35fe1a2" />


<img width="250" alt="Screenshot 2025-06-08 at 11 26 31 AM" src="https://github.com/user-attachments/assets/3b0d01c4-56aa-4d6a-bdae-dad56070fc9e" />


<img width="250" alt="Screenshot 2025-06-08 at 11 26 48 AM" src="https://github.com/user-attachments/assets/c96db6a4-c54f-46bf-92f3-8e3908792e13" />


<img width="250" alt="Screenshot 2025-06-08 at 11 26 57 AM" src="https://github.com/user-attachments/assets/30015ba9-9aac-4068-b3ca-48449d0d7c98" />


<img width="250" alt="Screenshot 2025-06-08 at 11 28 04 AM" src="https://github.com/user-attachments/assets/0d86e5a8-2f38-48d8-af51-dac51a5ed8ef" />



## What MicroLoanX Solves

Financial exclusion affects over 1.7 billion people worldwide who lack access to traditional banking services. MicroLoanX addresses this by:

- **Eliminating KYC barriers** while maintaining trust through decentralized identity
- **Enabling cross-border lending** with instant settlements via RLUSD
- **Building reputation without revealing identity** through pseudonymous profiles
- **Providing automated escrow protection** using XRP Ledger's native functionality
- **Reducing lending costs** through blockchain efficiency

## Quick Start

### Prerequisites

- Node.js 18 or higher
- npm package manager
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/hackathon2025xrp.git
cd hackathon2025xrp
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to [http://localhost:3000](http://localhost:3000)

### Using the Demo

The application comes pre-loaded with test accounts. Click "Select Test Account" to choose from:

**Borrower Accounts:**
- **Maria Santos** - Agriculture specialist with 92/100 trust score
- **Ahmed Hassan** - Healthcare & business loans, 88/100 trust score  
- **Priya Sharma** - Education loans, 76/100 trust score
- **Carlos Rodriguez** - General loans, 68/100 trust score

**Lender Accounts:**
- **Jennifer Chen** - $50,000 available, low risk tolerance
- **Michael Thompson** - $75,000 available, medium risk tolerance
- **Sarah Williams** - $100,000 available, high risk tolerance
- **Ashton Hall** - $25,000 available, low risk tolerance

### How It Works

1. **Select an account** from the demo accounts
2. **Switch between views** - borrower or lender dashboard
3. **Create loan requests** (borrowers) with purpose and amount
4. **Browse and fund loans** (lenders) based on risk assessment
5. **Track transactions** on the XRP Ledger testnet

## Core Features

### For Borrowers

- **Pseudonymous profiles** using Decentralized Identifiers (DIDs)
- **Dynamic interest rates** based on reputation score
- **Categorical expertise** tracking (agriculture, healthcare, education, business)
- **Loan request system** with purpose tagging
- **Reputation building** through successful repayments

### For Lenders

- **Risk assessment tools** with borrower trust scores
- **Portfolio management** dashboard
- **Real-time transaction tracking** on XRP Ledger
- **Automated loan matching** based on risk preferences
- **Complete audit trail** of all lending activity

### Privacy & Security

- **Pseudonymous lending** - no personal information required
- **Decentralized identity** through mock DID implementation
- **XRPL escrow protection** for all transactions
- **Local data persistence** using IndexedDB
- **Transparent reputation system** without revealing identity

## Technology Stack

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** with custom glass morphism design
- **Framer Motion** for smooth animations
- **Headless UI** for accessible components

### Blockchain Integration
- **XRP Ledger** for transaction processing
- **RLUSD** (Ripple USD stablecoin) for stable value
- **xrpl.js v4.2.5** SDK for blockchain interaction
- **XRPL Testnet** for development and demo

### Data & State Management
- **IndexedDB** for local data persistence
- **React Context** for state management
- **Mock DID system** for pseudonymous identity

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Main dashboard
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── borrower/          # Borrower interface
│   ├── lender/            # Lender interface
│   ├── layout/            # Navigation components
│   └── ui/                # Reusable UI components
├── lib/
│   ├── contexts/          # React Context providers
│   ├── database/          # IndexedDB operations
│   └── xrpl/              # XRP Ledger integration
└── types/
    └── index.ts           # TypeScript definitions
```

## XRP Ledger Integration

### Network Configuration
- **Network**: XRPL Testnet (`wss://s.altnet.rippletest.net:51233`)
- **Currency**: RLUSD (Ripple USD stablecoin)
- **Explorer**: [XRPL Testnet Explorer](https://testnet.xrpl.org)

### Key XRPL Features Used

1. **Native Escrow Objects** - Trustless loan agreements with time-based or conditional release
2. **RLUSD Stablecoin** - Stable value lending without cryptocurrency volatility
3. **Trust Lines** - Multi-currency support within the XRP ecosystem
4. **Memo Fields** - On-chain metadata for loan transparency
5. **Instant Settlement** - 3-4 second transaction finality

### Current Implementation Status

**Working Features:**
- XRPL Testnet connectivity
- Real XRP transactions for loan funding/repayment
- Account balance checking with RLUSD support
- Transaction history tracking
- Testnet explorer integration

**In Development:**
- Full RLUSD trust line implementation
- Production escrow contracts
- Automated loan lifecycle management
- Enhanced reputation algorithms

## Development

### Available Scripts

```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run ESLint
npm run lint

# Type checking
npx tsc --noEmit
```

### Project Structure Guidelines

- All new code should use TypeScript
- Follow the existing component patterns
- Use the established styling system (Tailwind + custom CSS)
- Implement proper error handling
- Add comprehensive code comments

### Key Files

- `src/lib/xrpl/client.ts` - Core XRPL integration
- `src/lib/xrpl/escrow.ts` - Loan escrow management
- `src/lib/database/db.ts` - Local database operations
- `src/lib/contexts/AccountContext.tsx` - Global state management
- `src/components/borrower/EnhancedBorrowerView.tsx` - Borrower interface
- `src/components/lender/EnhancedLenderView.tsx` - Lender interface

## Video Demonstration
https://youtu.be/cS2ByRk722U


## Troubleshooting

### Common Issues

**Database initialization fails:**
- Refresh the page to retry initialization
- Check browser console for specific errors
- Clear browser storage if issues persist

**XRPL connection problems:**
- Verify internet connectivity
- Check if XRPL testnet is operational
- Look for connection errors in browser console

**User switching not working:**
- Wait for database initialization to complete
- Try refreshing the page
- Check that test data has loaded properly

### Debug Information

Open browser developer tools to see detailed logs:
- Database operations and initialization status
- XRPL connection and transaction details
- User switching and authentication flow
- Error messages and stack traces

## Known Limitations

### Current Demo Limitations

1. **Mock escrow system** - Uses simulated blockchain transactions for demo
2. **Local data storage** - Data resets when browser storage is cleared
3. **Single session** - No persistent user authentication
4. **Testnet only** - Not connected to XRP Ledger mainnet

### Planned Improvements

1. **Real XRPL escrow integration** with production contracts
2. **Persistent user sessions** with secure authentication
3. **IPFS metadata storage** for decentralized loan data
4. **Mainnet deployment** with real RLUSD transactions
5. **Enhanced security** with production-grade practices

## Future Roadmap

### Phase 1: MVP Enhancement
- Complete RLUSD trust line integration
- Implement real XRPL escrow contracts
- Add comprehensive error handling
- Improve mobile responsiveness

### Phase 2: Advanced Features
- Multi-currency loan support
- Lending pool functionality
- Advanced reputation algorithms
- Social verification systems

### Phase 3: Production Ready
- Mainnet deployment
- Real DID integration with established standards
- Regulatory compliance framework
- Mobile application development
- Partnership integrations

## Design Philosophy

MicroLoanX employs a modern, accessible design system:

- **Glass morphism UI** for a premium, modern feel
- **Dark theme optimization** for extended usage
- **Mobile-first responsive design** for global accessibility
- **High contrast ratios** for visual accessibility
- **Smooth animations** that enhance rather than distract

The color palette emphasizes trust and reliability:
- **Primary blue** for trustworthiness
- **Secondary teal** for growth and stability
- **Success green** for positive outcomes
- **Warning amber** for pending states
- **Error red** for negative states

## Contributing

We welcome contributions to MicroLoanX. Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper TypeScript typing
4. Add tests for new functionality
5. Submit a pull request with detailed description

## Hackathon Context

**Built for:** Ripple x EasyA Singapore Hackathon 2025
**Problem addressed:** Financial inclusion through blockchain technology
**Innovation:** Pseudonymous reputation-based lending on XRP Ledger
**Impact:** Enabling microfinance for the unbanked globally

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **Ripple** for XRP Ledger technology and RLUSD infrastructure
- **EasyA** for organizing the hackathon and fostering innovation
- **Next.js team** for the excellent React framework
- **Tailwind CSS** for the utility-first styling approach
- **xrpl.js contributors** for the comprehensive SDK

---

**Experience the future of inclusive finance - start by selecting a test account and exploring decentralized microloans powered by the XRP Ledger.**

---

Presentation slides : https://www.canva.com/design/DAGpptDxMJ0/PL_4naT3VGxGMMhm3XxQ1A/edit?ui=eyJBIjp7fX0

Transaction link : https://testnet.xrpl.org/transactions/764B959E857334986422B9BA51B9054D3CD3BC4A37519E018144F1465D70822E

