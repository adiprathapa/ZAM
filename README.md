# ZAM - Market Sizing & Venture Analysis Tool

ZAM helps founders and investors map markets and size opportunities with the precision of a VC. Input your venture details through a guided wizard, and get AI powered TAM/SAM/SOM analysis with actionable insights.

##  Features

- **Guided Analysis Wizard** - 4-step wizard to capture product, target market, go-to-market, and competitive context
- **TAM/SAM/SOM Calculation** - Automated market sizing using industry benchmarks and intelligent heuristics
- **AI-Powered Insights** - Google Gemini integration for executive summaries, market drivers, risks, and sanity checks
- **Venture Portfolio** - Save, view, and manage multiple market analyses
- **Pitch Deck Charts** - Export-ready visualizations for presentations
- **Real-time Fine-tuning** - Adjust assumptions and see instant recalculations

##  Tech Stack

- **Frontend**: React 18, Vite
- **Backend**: Express.js, Node.js
- **Database**: MongoDB (Mongoose ODM)
- **AI**: Google Generative AI (Gemini)
- **Deployment**: Vercel

##  Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Google Generative AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/zam.git
   cd zam
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   

4. **Seed the database** (optional - loads industry benchmarks)
   ```bash
   npm run seed
   ```

5. **Start development servers**
   ```bash
   npm run dev:all
   ```
   This runs both the Vite frontend (http://localhost:5173) and Express backend (http://localhost:5001) concurrently.

### Individual Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend only |
| `npm run server` | Start backend only |
| `npm run dev:all` | Start both frontend and backend |
| `npm run build` | Build for production |
| `npm run seed` | Seed database with reference data |
| `npm run lint` | Run ESLint |

## 📁 Project Structure

```
├── public/              # Static assets
├── server/              # Express backend
│   ├── middleware/      # Rate limiting, etc.
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API endpoints
│   └── seed/            # Database seed data
├── src/                 # React frontend
│   ├── components/      # UI components
│   │   └── wizard/      # Analysis wizard steps
│   ├── services/        # API & business logic
│   └── data/            # Static reference data
└── vercel.json          # Vercel deployment config
```

## How Market Sizing Works

ZAM uses a **top-down approach**:

1. **TAM (Total Addressable Market)** - Total potential customers × Average contract value
2. **SAM (Serviceable Available Market)** - TAM filtered by geography, segment, and reach (~25%)
3. **SOM (Serviceable Obtainable Market)** - Realistic capture based on market share target (~2%)

The calculation engine factors in:
- Customer type (B2B vs B2C)
- Geographic reach
- Company size targets
- Industry benchmarks
- Pricing model

