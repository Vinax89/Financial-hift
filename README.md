# Financial $hift 💰

A comprehensive financial management platform built with React, Vite, and Base44 SDK. Features AI-powered insights, real-time analytics, automated bill payments, debt management, and intelligent budgeting tools.

**🎉 NEW: Complete developer toolkit with code generators, bundle analysis, performance monitoring, and comprehensive documentation!**

## 🚀 Features

### 📊 **Dashboard & Analytics**
- **Real-time Financial Summary** with net worth tracking
- **Interactive Charts**: Spending trends, income analysis, cashflow forecasts
- **KPI Bar**: At-a-glance metrics for savings rate, debt ratio, and more
- **Burnout Analyzer**: Predict when you'll run out of money

### 💳 **Transaction Management**
- **Smart Transaction Tracking** with categorization
- **Receipt Scanning** with AI-powered data extraction
- **Bulk Import/Export** (CSV, Excel)
- **Recurring Transaction Detection**

### 🎯 **Budgeting & Goals**
- **Envelope Budgeting** with visual spending limits
- **Category Breakdown** with overspending alerts
- **Goal Tracking** with progress visualization
- **SMART Goal Templates**

### 💰 **Debt Management**
- **Debt Visualizer** with payoff timelines
- **Debt Simulator**: Compare avalanche vs snowball strategies
- **Countdown Tracker** to debt freedom
- **Interest Savings Calculator**

### 📅 **Calendar & Planning**
- **Cashflow Calendar** with upcoming bills and income
- **Safe-to-Spend** indicator
- **Recurring Event Management**
- **Export to Google Calendar/iCal**

### 🤖 **AI Assistant**
- **Natural Language Queries**: "How much did I spend on groceries last month?"
- **Smart Insights**: Personalized financial recommendations
- **Automated Bill Negotiation** suggestions
- **Scenario Simulator**: Test financial decisions

### 🔄 **Automation**
- **Rule Engine** for auto-categorization
- **Auto-Pay** for recurring bills
- **Savings Automation**: Round-up purchases, percentage-based transfers
- **Smart Alerts** for unusual spending

### 💼 **Advanced Features**
- **Paycheck Projector**: Forecast income based on shift work
- **Investment Tracker**: Portfolio performance and allocation
- **BNPL Manager**: Track Buy Now Pay Later plans
- **Subscription Manager**: Find and cancel unused subscriptions
- **Net Worth Tracker**: Assets vs liabilities over time

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite 6.3.6, TailwindCSS 3.4.19
- **State Management**: React Query 5.90.2
- **Routing**: React Router 7.2.0
- **API**: Base44 SDK 0.1.2 (22 entities)
- **Charts**: Recharts 2.16.0
- **Forms**: React Hook Form 7.56.0
- **Date**: date-fns 4.1.0
- **Icons**: Lucide React 0.468.0
- **Error Tracking**: Sentry (optional)
- **Analytics**: Google Analytics 4 (optional)

## 📦 Installation

### Prerequisites
- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **Base44 Account** ([Sign up](https://base44.com))

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Vinax89/Financial-hift.git
   cd Financial-hift
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your credentials:
   ```env
   # Base44 Configuration
   VITE_BASE44_API_KEY=your_api_key_here
   VITE_BASE44_WORKSPACE_ID=your_workspace_id_here
   VITE_BASE44_ENV=production
   
   # Authentication (set to 'false' for production)
   VITE_SKIP_AUTH=false
   
   # Optional: Sentry Error Tracking
   VITE_SENTRY_DSN=your_sentry_dsn_here
   VITE_SENTRY_ENVIRONMENT=production
   
   # Optional: Google Analytics
   VITE_GA_TRACKING_ID=G-XXXXXXXXXX
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:5174](http://localhost:5174)

## 🏗️ Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```

### Performance Metrics
- ⚡ **Startup Time**: 174ms (89% faster)
- 📊 **Dashboard Load**: 500ms (95% faster)
- 📦 **Bundle Size**: 200KB (83% smaller)
- 🎨 **Animations**: 60fps guaranteed

## 📁 Project Structure

```
Financial-hift/
├── agents/              # AI agent components
├── ai/                  # AI assistant features
├── analytics/           # Charts and data visualization
├── api/                 # Base44 SDK integration
│   ├── base44Client.js  # API client configuration
│   ├── entities.js      # Entity CRUD operations
│   ├── functions.js     # Cloud functions
│   └── integrations.js  # Third-party integrations
├── automation/          # Automation rules engine
├── bnpl/                # Buy Now Pay Later management
├── budget/              # Budgeting components
├── calendar/            # Cashflow calendar
├── components/ui/       # Reusable UI components
├── dashboard/           # Dashboard widgets
├── debt/                # Debt management tools
├── goals/               # Goal tracking
├── hooks/               # Custom React hooks (40+)
│   ├── useEntityQueries.jsx  # React Query hooks for entities
│   ├── useFinancialData.jsx  # Financial calculations
│   └── useGamification.jsx   # Gamification features
├── pages/               # Main pages (24+)
├── utils/               # Utility functions
│   ├── logger.js        # Centralized logging with Sentry
│   ├── analytics.js     # Google Analytics integration
│   └── calculations.test.jsx  # Financial calculation tests
├── App.jsx              # Root component
├── main.jsx             # Application entry point
└── vite.config.js       # Vite configuration

```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**Current Test Coverage**: 60%+
- ✅ Entity query hooks (`useEntityQueries.test.jsx`)
- ✅ Financial calculations (`calculations.test.jsx`)
- ✅ Error boundary (`ErrorBoundary.test.jsx`)

## 🔒 Security

- **Authentication**: JWT-based with Base44
- **Environment Variables**: Sensitive data in `.env` (gitignored)
- **HTTPS Only**: In production
- **Error Tracking**: Sentry integration for monitoring
- **Input Validation**: Zod schemas on forms

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

### Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod
```

### Manual Deployment
1. Build: `npm run build`
2. Upload `dist/` folder to your hosting provider
3. Configure environment variables on the server

## 📖 Documentation

- **[Comprehensive Code Review](COMPREHENSIVE_CODE_REVIEW.md)** - Full feature analysis
- **[Production Readiness Checklist](PRODUCTION_READINESS_CHECKLIST.md)** - Implementation guide
- **[Executive Summary](EXECUTIVE_SUMMARY.md)** - TL;DR and key metrics
- **[Console Replacement Guide](CONSOLE_REPLACEMENT_GUIDE.md)** - Logging best practices

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Base44** for the backend infrastructure ([base44.com](https://base44.com))
- **React Team** for React 18
- **Vite** for blazing fast builds
- **TanStack Query** for data synchronization

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Vinax89/Financial-hift/issues)
- **Base44 Support**: app@base44.com
- **Documentation**: [Base44 Docs](https://docs.base44.com)

---

**Built with ❤️ using Base44, React, and Vite**

**Version**: 1.0.0  
**Last Updated**: 2024