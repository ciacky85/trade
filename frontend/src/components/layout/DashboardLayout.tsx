import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  PieChart,
  Activity,
  BookOpen,
  Newspaper,
  HardDrive,
  PlusCircle,
  TrendingUp,
  Search,
  Trash2,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  Maximize2,
  Eye,
  EyeOff,
  X
} from 'lucide-react';
import { CombinedChart } from '../charts/CombinedChart';

const SCALE_OPTIONS = ['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y'];

const translateRec = (rec?: string) => {
  if (!rec) return 'MANTIENI';
  const u = rec.toUpperCase();
  if (u === 'BUY' || u === 'BULLISH') return 'ACQUISTA';
  if (u === 'SELL' || u === 'BEARISH') return 'VENDI';
  if (u === 'HOLD') return 'MANTIENI';
  return rec;
};

const translateSentiment = (s?: string) => {
  if (!s) return 'NEUTRO';
  const u = s.toUpperCase();
  if (u === 'BULLISH' || u === 'POSITIVE' || u === 'RIALZISTA') return 'RIALZISTA';
  if (u === 'BEARISH' || u === 'NEGATIVE' || u === 'RIBASSISTA') return 'RIBASSISTA';
  if (u === 'NEUTRAL' || u === 'NEUTRO') return 'NEUTRO';
  return s;
};

interface Position {
  ticker: string;
  company_name: string;
  quantity: number;
  avg_buy_price: number;
  current_price: number;
  total_value: number;
  pnl: number;
  pnl_pct: number;
  trades_count: number;
}

interface PortfolioSummary {
  total_value: number;
  total_cost: number;
  total_pnl: number;
  total_pnl_pct: number;
  active_positions_count: number;
  ai_consensus: string;
  confidence_score: number;
  positions: Position[];
}

interface Transaction {
  id: string;
  ticker: string;
  company_name: string;
  type: string;
  date: string;
  quantity: number;
  price: number;
  total: number;
  fees: number;
  notes: string;
}

interface ChartSource {
  id: string;
  ticker: string;
  url: string;
  source_type: string;
  created_at: string;
}

interface Strategy {
  id: string;
  name: string;
  category: string;
  description: string;
  indicators: string[];
  buy_condition: string;
  sell_condition: string;
  risk_reward_ratio: string;
  confidence: number;
}

interface NewsItem {
  id: string;
  ticker: string;
  title: string;
  source: string;
  published_at: string;
  url: string;
  sentiment_label: string;
  sentiment_score: number;
  impact: string;
  summary: string;
}

interface TrainingMetrics {
  trained_samples_days: number;
  directional_accuracy_pct: number;
  mape_pct: number;
  epochs_converged: number;
  status: string;
  trained_at: string;
}

interface AnalysisData {
  ticker: string;
  currency?: string;
  timeframe: string;
  current_price: number;
  recommendation: string;
  recommendation_label?: string;
  confidence: number;
  reason: string;
  target_price: number;
  stop_loss: number;
  risk_reward_ratio: string;
  active_patterns: { name: string; signal: number }[];
  historical_candles: any[];
  prediction_candles: any[];
  training_metrics?: TrainingMetrics;
  scenarios: {
    bullish: { target: number; probability: string };
    neutral: { target: number; probability: string };
    bearish: { target: number; probability: string };
  };
}

const getCurrencySymbol = (ticker?: string, currency?: string): string => {
  if (currency === 'EUR' || (ticker && ticker.toUpperCase().endsWith('.MI'))) return '€';
  if (currency === 'GBP' || (ticker && ticker.toUpperCase().endsWith('.L'))) return '£';
  return '$';
};

const CLIENT_STOCK_CATALOG = [
  // Top FTSE MIB & Italian Stocks
  { ticker: 'ENI.MI', company_name: 'Eni S.p.A.', exchange: 'Milano', keywords: 'ENI PETROLIO GAS OIL ENERGIA' },
  { ticker: 'ENEL.MI', company_name: 'Enel S.p.A.', exchange: 'Milano', keywords: 'ENEL ENERGIA ELETTRICA RINNOVABILI UTILITY' },
  { ticker: 'ISP.MI', company_name: 'Intesa Sanpaolo S.p.A.', exchange: 'Milano', keywords: 'INTESA SANPAOLO BANCA FINANZA' },
  { ticker: 'UCG.MI', company_name: 'UniCredit S.p.A.', exchange: 'Milano', keywords: 'UNICREDIT UNICREDITO BANCA' },
  { ticker: 'STLAM.MI', company_name: 'Stellantis N.V.', exchange: 'Milano', keywords: 'STELLANTIS FIAT CHRYSLER PEUGEOT AUTO' },
  { ticker: 'STLA', company_name: 'Stellantis N.V. (NYSE)', exchange: 'NYSE', keywords: 'STELLANTIS FIAT AUTO' },
  { ticker: 'RACE.MI', company_name: 'Ferrari N.V. (Milano)', exchange: 'Milano', keywords: 'FERRARI AUTO ROSSO MARANELLO' },
  { ticker: 'RACE', company_name: 'Ferrari N.V. (NYSE)', exchange: 'NYSE', keywords: 'FERRARI AUTO' },
  { ticker: 'STMMI.MI', company_name: 'STMicroelectronics N.V.', exchange: 'Milano', keywords: 'STM SEMICONDUTTORI CHIP ELETTRONICA' },
  { ticker: 'STM', company_name: 'STMicroelectronics N.V. (NYSE)', exchange: 'NYSE', keywords: 'STM SEMICONDUCTOR CHIP' },
  { ticker: 'PRY.MI', company_name: 'Prysmian S.p.A.', exchange: 'Milano', keywords: 'PRYSMIAN CAVI ENERGIA TELECOM' },
  { ticker: 'LDO.MI', company_name: 'Leonardo S.p.A.', exchange: 'Milano', keywords: 'LEONARDO FINMECCANICA DIFESA AEROSPACE' },
  { ticker: 'PST.MI', company_name: 'Poste Italiane S.p.A.', exchange: 'Milano', keywords: 'POSTE ITALIANE ASSICURAZIONI LOGISTICA' },
  { ticker: 'CPR.MI', company_name: 'Davide Campari-Milano N.V.', exchange: 'Milano', keywords: 'CAMPARI APEROL BEVANDE SPIRITS' },
  { ticker: 'G.MI', company_name: 'Assicurazioni Generali S.p.A.', exchange: 'Milano', keywords: 'GENERALI ASSICURAZIONI LEONE' },
  { ticker: 'MONC.MI', company_name: 'Moncler S.p.A.', exchange: 'Milano', keywords: 'MONCLER PIUMINI MODA LUXURY' },
  { ticker: 'SRG.MI', company_name: 'Snam S.p.A.', exchange: 'Milano', keywords: 'SNAM GAS METANODOTTI' },
  { ticker: 'TRN.MI', company_name: 'Terna S.p.A.', exchange: 'Milano', keywords: 'TERNA RETE ELETTRICA GRID' },
  { ticker: 'TIT.MI', company_name: 'Telecom Italia S.p.A.', exchange: 'Milano', keywords: 'TELECOM ITALIA TIM TELEFONIA' },
  { ticker: 'A2A.MI', company_name: 'A2A S.p.A.', exchange: 'Milano', keywords: 'A2A UTILITY ENERGIA AMBIENTE' },
  { ticker: 'HER.MI', company_name: 'Hera S.p.A.', exchange: 'Milano', keywords: 'HERA UTILITY AMBIENTE' },
  { ticker: 'TEN.MI', company_name: 'Tenaris S.A.', exchange: 'Milano', keywords: 'TENARIS ACCIAIO TUBI OIL PIPE' },
  { ticker: 'SPM.MI', company_name: 'Saipem S.p.A.', exchange: 'Milano', keywords: 'SAIPEM INGEGNERIA TRIVELLAZIONI DRILLING' },
  { ticker: 'BAMI.MI', company_name: 'Banco BPM S.p.A.', exchange: 'Milano', keywords: 'BANCO BPM BANCA MILANO' },
  { ticker: 'BPE.MI', company_name: 'BPER Banca S.p.A.', exchange: 'Milano', keywords: 'BPER BANCA EMILIA ROMAGNA' },
  { ticker: 'MB.MI', company_name: 'Mediobanca S.p.A.', exchange: 'Milano', keywords: 'MEDIOBANCA BANCA INVESTIMENTO' },
  { ticker: 'FBK.MI', company_name: 'FinecoBank S.p.A.', exchange: 'Milano', keywords: 'FINECO FINECOBANK BANCA TRADING' },
  { ticker: 'NEXI.MI', company_name: 'Nexi S.p.A.', exchange: 'Milano', keywords: 'NEXI PAGAMENTI DIGITALI POS CARD' },
  { ticker: 'AMP.MI', company_name: 'Amplifon S.p.A.', exchange: 'Milano', keywords: 'AMPLIFON UDITO HEARING' },
  { ticker: 'DIA.MI', company_name: 'DiaSorin S.p.A.', exchange: 'Milano', keywords: 'DIASORIN DIAGNOSTICA BIOTECH' },
  { ticker: 'REC.MI', company_name: 'Recordati S.p.A.', exchange: 'Milano', keywords: 'RECORDATI FARMACEUTICA PHARMA' },
  { ticker: 'IP.MI', company_name: 'Interpump Group S.p.A.', exchange: 'Milano', keywords: 'INTERPUMP POMPE IDRAULICA' },
  { ticker: 'BC.MI', company_name: 'Brunello Cucinelli S.p.A.', exchange: 'Milano', keywords: 'BRUNELLO CUCINELLI CASHMERE MODA' },
  { ticker: 'INW.MI', company_name: 'Infrastrutture Wireless Italiane (INWIT)', exchange: 'Milano', keywords: 'INWIT TORRI WIRELESS ANTENNE' },
  { ticker: 'IG.MI', company_name: 'Italgas S.p.A.', exchange: 'Milano', keywords: 'ITALGAS DISTRIBUZIONE GAS' },
  { ticker: 'IVG.MI', company_name: 'Iveco Group N.V.', exchange: 'Milano', keywords: 'IVECO CAMION TRUCKS VEICOLI COMMERCIALI' },
  { ticker: 'BZU.MI', company_name: 'Buzzi S.p.A.', exchange: 'Milano', keywords: 'BUZZI CEMENTO MATERIALI' },
  { ticker: 'PIRC.MI', company_name: 'Pirelli & C. S.p.A.', exchange: 'Milano', keywords: 'PIRELLI PNEUMATICI TYRES GOMME' },
  { ticker: 'BRE.MI', company_name: 'Brembo S.p.A.', exchange: 'Milano', keywords: 'BREMBO FRENI BRAKES AUTO' },
  { ticker: 'BMED.MI', company_name: 'Banca Mediolanum S.p.A.', exchange: 'Milano', keywords: 'MEDIOLANUM BANCA RISPARMIO' },
  { ticker: 'BPSO.MI', company_name: 'Banca Popolare di Sondrio S.p.A.', exchange: 'Milano', keywords: 'POPOLARE SONDRIO BANCA' },
  { ticker: 'UNI.MI', company_name: 'Unipol Gruppo S.p.A.', exchange: 'Milano', keywords: 'UNIPOL ASSICURAZIONI UNIPOLSAI' },
  { ticker: 'ERG.MI', company_name: 'ERG S.p.A.', exchange: 'Milano', keywords: 'ERG RINNOVABILI EOLICO' },
  { ticker: 'AZM.MI', company_name: 'Azimut Holding S.p.A.', exchange: 'Milano', keywords: 'AZIMUT ASSET MANAGEMENT RISPARMIO' },

  // Top US & Global Tech Giants
  { ticker: 'NVDA', company_name: 'NVIDIA Corporation', exchange: 'NASDAQ', keywords: 'NVIDIA AI CHIP GPU GRAPHICS SEMICONDUCTOR' },
  { ticker: 'AAPL', company_name: 'Apple Inc.', exchange: 'NASDAQ', keywords: 'APPLE IPHONE MAC IPAD TECH' },
  { ticker: 'MSFT', company_name: 'Microsoft Corporation', exchange: 'NASDAQ', keywords: 'MICROSOFT WINDOWS AZURE AI OFFICE XBOX' },
  { ticker: 'TSLA', company_name: 'Tesla Inc.', exchange: 'NASDAQ', keywords: 'TESLA ELON MUSK EV AUTO ELETTRICHE BATTERIE' },
  { ticker: 'AMZN', company_name: 'Amazon.com Inc.', exchange: 'NASDAQ', keywords: 'AMAZON ECOMMERCE AWS CLOUD PRIME' },
  { ticker: 'GOOGL', company_name: 'Alphabet Inc. (Google)', exchange: 'NASDAQ', keywords: 'GOOGLE ALPHABET YOUTUBE SEARCH ANDROID' },
  { ticker: 'GOOG', company_name: 'Alphabet Inc. Class C', exchange: 'NASDAQ', keywords: 'GOOGLE ALPHABET YOUTUBE' },
  { ticker: 'META', company_name: 'Meta Platforms Inc.', exchange: 'NASDAQ', keywords: 'META FACEBOOK INSTAGRAM WHATSAPP VR' },
  { ticker: 'AMD', company_name: 'Advanced Micro Devices Inc.', exchange: 'NASDAQ', keywords: 'AMD RYZEN RADEON CHIP SEMICONDUCTORS' },
  { ticker: 'PLTR', company_name: 'Palantir Technologies Inc.', exchange: 'NYSE', keywords: 'PALANTIR AI BIG DATA DIFESA DEFENSE' },
  { ticker: 'INTC', company_name: 'Intel Corporation', exchange: 'NASDAQ', keywords: 'INTEL CPU SEMICONDUCTOR CHIP' },
  { ticker: 'NFLX', company_name: 'Netflix Inc.', exchange: 'NASDAQ', keywords: 'NETFLIX STREAMING CINEMA SERIE TV' },
  { ticker: 'DIS', company_name: 'Walt Disney Co.', exchange: 'NYSE', keywords: 'DISNEY CINEMA PARCHI MARVEL STAR WARS' },
  { ticker: 'BABA', company_name: 'Alibaba Group Holding', exchange: 'NYSE', keywords: 'ALIBABA ECOMMERCE CINA CLOUD' },
  { ticker: 'BRK-B', company_name: 'Berkshire Hathaway Inc.', exchange: 'NYSE', keywords: 'BERKSHIRE HATHAWAY BUFFETT WARREN' },
  { ticker: 'AVGO', company_name: 'Broadcom Inc.', exchange: 'NASDAQ', keywords: 'BROADCOM CHIP SEMICONDUCTORS NETWORKING' },
  { ticker: 'TSM', company_name: 'Taiwan Semiconductor (TSMC)', exchange: 'NYSE', keywords: 'TSMC TAIWAN CHIP FOUNDRY' },
  { ticker: 'ASML', company_name: 'ASML Holding N.V.', exchange: 'NASDAQ', keywords: 'ASML LITOGRAFIA CHIP EUV SEMICONDUCTOR' },
  { ticker: 'QCOM', company_name: 'Qualcomm Inc.', exchange: 'NASDAQ', keywords: 'QUALCOMM SNAPDRAGON 5G MOBILE CHIP' },
  { ticker: 'CSCO', company_name: 'Cisco Systems Inc.', exchange: 'NASDAQ', keywords: 'CISCO NETWORKING ROUTER SWITCH' },
  { ticker: 'ADBE', company_name: 'Adobe Inc.', exchange: 'NASDAQ', keywords: 'ADOBE PHOTOSHOP CREATIVE CLOUD PDF' },
  { ticker: 'ORCL', company_name: 'Oracle Corporation', exchange: 'NYSE', keywords: 'ORACLE DATABASE CLOUD ERP' },
  { ticker: 'IBM', company_name: 'International Business Machines', exchange: 'NYSE', keywords: 'IBM CLOUD MAINFRAME QUANTUM COMPUTING' },
  { ticker: 'COIN', company_name: 'Coinbase Global Inc.', exchange: 'NASDAQ', keywords: 'COINBASE CRYPTO BITCOIN ETHEREUM' },
  { ticker: 'UBER', company_name: 'Uber Technologies Inc.', exchange: 'NYSE', keywords: 'UBER MOBILITA TAXI FOOD DELIVERY' },
  { ticker: 'ABNB', company_name: 'Airbnb Inc.', exchange: 'NASDAQ', keywords: 'AIRBNB VIAGGI CASE ALLOGGI' },
  { ticker: 'SPOT', company_name: 'Spotify Technology S.A.', exchange: 'NYSE', keywords: 'SPOTIFY MUSICA PODCAST STREAMING' },
  { ticker: 'CRM', company_name: 'Salesforce Inc.', exchange: 'NYSE', keywords: 'SALESFORCE CRM CLOUD SOFTWARE' },
  { ticker: 'V', company_name: 'Visa Inc.', exchange: 'NYSE', keywords: 'VISA CARTE PAGAMENTI' },
  { ticker: 'MA', company_name: 'Mastercard Inc.', exchange: 'NYSE', keywords: 'MASTERCARD CARTE PAGAMENTI' },
  { ticker: 'JPM', company_name: 'JPMorgan Chase & Co.', exchange: 'NYSE', keywords: 'JPMORGAN CHASE BANCA WALL STREET' },
  { ticker: 'BAC', company_name: 'Bank of America Corp.', exchange: 'NYSE', keywords: 'BANK OF AMERICA BANCA' },
  { ticker: 'XOM', company_name: 'Exxon Mobil Corp.', exchange: 'NYSE', keywords: 'EXXON MOBIL PETROLIO OIL ENERGY' },
  { ticker: 'CVX', company_name: 'Chevron Corp.', exchange: 'NYSE', keywords: 'CHEVRON PETROLIO GAS' },
  { ticker: 'PFE', company_name: 'Pfizer Inc.', exchange: 'NYSE', keywords: 'PFIZER FARMACI VACCINI' },
  { ticker: 'MRNA', company_name: 'Moderna Inc.', exchange: 'NASDAQ', keywords: 'MODERNA BIOTECH MRNA VACCINI' }
];

export const DashboardLayout = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'portfolio' | 'analysis' | 'knowledge' | 'news' | 'settings'>('dashboard');
  const [selectedTicker, setSelectedTicker] = useState('');
  const [searchTicker, setSearchTicker] = useState('');
  const [timeframe, setTimeframe] = useState('6M');
  const [showPredictions, setShowPredictions] = useState(true);
  const [isFullscreenChartOpen, setIsFullscreenChartOpen] = useState(false);

  // Modals & form state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txFormData, setTxFormData] = useState({
    ticker: '',
    company_name: '',
    type: 'BUY',
    quantity: 10,
    price: 150.0,
    fees: 0,
    notes: ''
  });

  // Autocomplete stock search state
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [stockSuggestions, setStockSuggestions] = useState<Array<{ ticker: string; company_name: string; exchange: string }>>([]);
  const [isSearchingStocks, setIsSearchingStocks] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Chart source input
  const [chartSourceUrl, setChartSourceUrl] = useState('');
  const [chartSourceTicker, setChartSourceTicker] = useState('NVDA');

  // Data states
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartSources, setChartSources] = useState<ChartSource[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [storageStatus, setStorageStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isRetraining, setIsRetraining] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleRetrainModel = async (ticker: string) => {
    if (!ticker) return;
    setIsRetraining(true);
    showToast(`Avviato auto-apprendimento ricorsivo su 2 anni per ${ticker}...`);
    try {
      const res = await fetch(`/api/v1/analysis/${ticker}/retrain`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        showToast(`Apprendimento ${ticker} completato! Accuratezza: ${data.training_metrics.directional_accuracy_pct}% (${data.training_metrics.trained_samples_days} giorni)`);
        await fetchAnalysis(ticker, timeframe);
      } else {
        alert('Errore durante la calibrazione del modello.');
      }
    } catch (e) {
      console.error('Error retraining model:', e);
      alert('Errore di connessione durante la calibrazione.');
    } finally {
      setIsRetraining(false);
    }
  };

  // Close fullscreen on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreenChartOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch initial portfolio & analysis
  useEffect(() => {
    fetchPortfolio();
    fetchTransactions();
    fetchChartSources();
    fetchStrategies();
    fetchNews();
    fetchStorageStatus();
  }, []);

  useEffect(() => {
    if (activeTab === 'analysis') {
      fetchChartSources();
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedTicker) {
      fetchAnalysis(selectedTicker, timeframe);
    } else {
      setAnalysis(null);
    }
  }, [selectedTicker, timeframe]);

  const fetchPortfolio = async () => {
    try {
      const res = await fetch('/api/v1/portfolios/summary');
      if (res.ok) {
        const data = await res.json();
        setPortfolio(data);
        if (data.positions && data.positions.length > 0) {
          // If no ticker selected or current ticker not in portfolio, default to first registered stock
          if (!selectedTicker || !data.positions.some((p: Position) => p.ticker === selectedTicker)) {
            setSelectedTicker(data.positions[0].ticker);
          }
        } else {
          setSelectedTicker('');
          setAnalysis(null);
        }
      }
    } catch (e) {
      console.error('Error fetching portfolio:', e);
    }
  };

  const handleDeletePosition = async (ticker: string) => {
    if (!confirm(`Sei sicuro di voler eliminare l'azione ${ticker} dal portafoglio e tutte le sue transazioni registrate?`)) return;
    try {
      const res = await fetch(`/api/v1/portfolios/positions/${encodeURIComponent(ticker)}`, { method: 'DELETE' });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        showToast(`Azione ${ticker} rimossa dal portafoglio!`);
        await fetchPortfolio();
        await fetchTransactions();
      } else {
        alert(`Errore: ${data?.detail || 'Impossibile eliminare l\'azione'}`);
      }
    } catch (e) {
      console.error(e);
      alert('Errore di comunicazione con il server');
    }
  };

  // Debounced search effect for real stock catalog & live Yahoo search
  useEffect(() => {
    if (!stockSearchQuery || stockSearchQuery.includes('—')) {
      return;
    }
    const clean = stockSearchQuery.trim();
    if (clean.length < 1) {
      setStockSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingStocks(true);
      setShowSuggestions(true);
      try {
        const res = await fetch(`/api/v1/system/search-stocks?query=${encodeURIComponent(clean)}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setStockSuggestions(prev => {
              const seen = new Set<string>();
              const merged: Array<{ ticker: string; company_name: string; exchange: string }> = [];
              for (const item of [...data, ...prev]) {
                const tk = item.ticker?.toUpperCase();
                if (tk && !seen.has(tk)) {
                  seen.add(tk);
                  merged.push(item);
                }
              }
              return merged.slice(0, 15);
            });
          }
        }
      } catch (e) {
        console.error('Stock search error:', e);
      } finally {
        setIsSearchingStocks(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [stockSearchQuery]);

  const handleStockSearchInput = (val: string) => {
    setStockSearchQuery(val);
    const clean = val.trim().toUpperCase();
    if (clean && !val.includes('—') && clean.length <= 10 && !clean.includes(' ')) {
      setTxFormData(prev => ({ ...prev, ticker: clean }));
    }
    if (clean.length >= 1 && !val.includes('—')) {
      setShowSuggestions(true);
      // Instant client-side search across 70+ stocks with 0ms latency
      const instant = CLIENT_STOCK_CATALOG.filter(s =>
        s.ticker.toUpperCase().includes(clean) ||
        s.company_name.toUpperCase().includes(clean) ||
        s.keywords.toUpperCase().includes(clean)
      ).map(s => ({ ticker: s.ticker, company_name: s.company_name, exchange: s.exchange }));
      setStockSuggestions(instant);
    } else {
      setShowSuggestions(false);
      setStockSuggestions([]);
    }
  };

  const handleSelectStock = async (stock: { ticker: string; company_name: string; exchange: string }) => {
    setTxFormData(prev => ({
      ...prev,
      ticker: stock.ticker,
      company_name: stock.company_name
    }));
    setStockSearchQuery(`${stock.ticker} — ${stock.company_name}`);
    setShowSuggestions(false);

    try {
      const res = await fetch(`/api/v1/system/quote/${stock.ticker}`);
      if (res.ok) {
        const quote = await res.json();
        if (quote.price && quote.price > 0) {
          setTxFormData(prev => ({ ...prev, price: quote.price }));
        }
      }
    } catch (e) {
      console.error('Quote fetch error:', e);
    }
  };

  const openNewTransactionModal = () => {
    setTxFormData({
      ticker: '',
      company_name: '',
      type: 'BUY',
      quantity: 1,
      price: 0,
      fees: 0,
      notes: ''
    });
    setStockSearchQuery('');
    setStockSuggestions([]);
    setShowSuggestions(false);
    setIsTxModalOpen(true);
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/v1/transactions/');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (e) {
      console.error('Error fetching transactions:', e);
    }
  };

  const fetchChartSources = async () => {
    try {
      const res = await fetch('/api/v1/chart-sources/');
      if (res.ok) {
        const data = await res.json();
        setChartSources(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch chart sources, status:', res.status);
      }
    } catch (e) {
      console.error('Error fetching chart sources:', e);
    }
  };

  const fetchStrategies = async () => {
    try {
      const res = await fetch('/api/v1/knowledge/strategies');
      if (res.ok) {
        const data = await res.json();
        setStrategies(data);
      }
    } catch (e) {
      console.error('Error fetching strategies:', e);
    }
  };

  const fetchNews = async (ticker?: string) => {
    try {
      const url = ticker ? `/api/v1/news/?ticker=${encodeURIComponent(ticker)}` : '/api/v1/news/';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setNews(data);
      }
    } catch (e) {
      console.error('Error fetching news:', e);
    }
  };

  const fetchStorageStatus = async () => {
    try {
      const res = await fetch('/api/v1/system/status');
      if (res.ok) {
        const data = await res.json();
        setStorageStatus(data);
      }
    } catch (e) {
      console.error('Error fetching storage status:', e);
    }
  };

  const fetchAnalysis = async (ticker: string, tf: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/analysis/${ticker}?timeframe=${tf}`);
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);
      }
    } catch (e) {
      console.error('Error fetching analysis:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/transactions/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txFormData)
      });
      if (res.ok) {
        setIsTxModalOpen(false);
        showToast(`Transazione ${txFormData.ticker} registrata con successo!`);
        fetchTransactions();
        fetchPortfolio();
        setTxFormData({
          ticker: '',
          company_name: '',
          type: 'BUY',
          quantity: 10,
          price: 150.0,
          fees: 0,
          notes: ''
        });
      } else {
        let errMsg = `Errore del server (HTTP ${res.status})`;
        try {
          const err = await res.json();
          errMsg = err.detail || err.message || errMsg;
        } catch {
          const text = await res.text().catch(() => '');
          if (text) errMsg = `Errore HTTP ${res.status}: ${text.slice(0, 150)}`;
        }
        alert(errMsg);
      }
    } catch (e: any) {
      console.error('Network error saving transaction:', e);
      alert(`Errore di comunicazione: ${e?.message || 'Impossibile connettersi al backend'}`);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa transazione?')) return;
    try {
      const res = await fetch(`/api/v1/transactions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Transazione eliminata');
        fetchTransactions();
        fetchPortfolio();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateChartSource = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = chartSourceUrl.trim();
    const cleanTicker = chartSourceTicker.trim().toUpperCase();
    if (!cleanUrl || !cleanTicker) return;

    let detectedType = 'tradingview';
    const lowerUrl = cleanUrl.toLowerCase();
    if (lowerUrl.includes('finviz.com')) detectedType = 'finviz';
    else if (lowerUrl.includes('yahoo.com') || lowerUrl.includes('yahoofinance')) detectedType = 'yahoo';
    else if (lowerUrl.includes('investing.com')) detectedType = 'investing';
    else if (lowerUrl.includes('marketwatch.com')) detectedType = 'marketwatch';
    else if (!lowerUrl.includes('tradingview.com')) detectedType = 'web';

    try {
      const res = await fetch('/api/v1/chart-sources/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: cleanTicker,
          url: cleanUrl,
          source_type: detectedType
        })
      });
      if (res.ok) {
        showToast(`Fonte grafico per ${cleanTicker} salvata!`);
        setChartSourceUrl('');
        await fetchChartSources();
      } else {
        const err = await res.json().catch(() => null);
        alert(`Errore salvataggio fonte: ${err?.detail || 'Errore HTTP ' + res.status}`);
      }
    } catch (e: any) {
      alert(`Errore di comunicazione: ${e?.message || 'Impossibile connettersi al backend'}`);
    }
  };

  const handleDeleteChartSource = async (id: string) => {
    if (!confirm('Sei sicuro di voler rimuovere questa fonte grafico?')) return;
    try {
      const res = await fetch(`/api/v1/chart-sources/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Fonte grafico rimossa con successo');
        await fetchChartSources();
      } else {
        const err = await res.json().catch(() => null);
        alert(`Errore eliminazione fonte: ${err?.detail || 'Errore HTTP ' + res.status}`);
      }
    } catch (e: any) {
      alert(`Errore di comunicazione: ${e?.message || 'Impossibile connettersi al backend'}`);
    }
  };

  const handleSyncStorage = async () => {
    try {
      const res = await fetch('/api/v1/system/sync-storage', { method: 'POST' });
      if (res.ok) {
        showToast('Cartelle persistenti sincronizzate su /srv/docker_conf/trade!');
        fetchStorageStatus();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleHeaderSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTicker.trim()) {
      const clean = searchTicker.trim().toUpperCase();
      setSelectedTicker(clean);
      setSearchTicker('');
      setActiveTab('dashboard');
    }
  };

  return (
    <div className="dashboard-grid">
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'rgba(16, 185, 129, 0.95)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} />
          {toastMsg}
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div>
          <div className="sidebar-logo" onClick={() => setActiveTab('dashboard')}>
            <TrendingUp size={30} color="#38bdf8" />
            <h2>TradeAnalyzer Pro</h2>
          </div>
          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={19} /> Dashboard
            </button>
            <button
              className={`nav-item ${activeTab === 'portfolio' ? 'active' : ''}`}
              onClick={() => setActiveTab('portfolio')}
            >
              <PieChart size={19} /> Portfolio & Transazioni
              {portfolio?.active_positions_count !== undefined && portfolio.active_positions_count > 0 && (
                <span className="nav-badge">{portfolio.active_positions_count}</span>
              )}
            </button>
            <button
              className={`nav-item ${activeTab === 'analysis' ? 'active' : ''}`}
              onClick={() => setActiveTab('analysis')}
            >
              <Activity size={19} /> Analisi & Fonti Grafici
            </button>
            <button
              className={`nav-item ${activeTab === 'knowledge' ? 'active' : ''}`}
              onClick={() => setActiveTab('knowledge')}
            >
              <BookOpen size={19} /> Knowledge Engine
            </button>
            <button
              className={`nav-item ${activeTab === 'news' ? 'active' : ''}`}
              onClick={() => setActiveTab('news')}
            >
              <Newspaper size={19} /> Notizie & Sentiment
            </button>
            <button
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <HardDrive size={19} /> Archiviazione & Dati
            </button>
          </nav>
        </div>

        <div className="sidebar-footer">
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Docker Server</span>
          <div className="version-badge">v0.7.0</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <form className="header-search" onSubmit={handleHeaderSearch}>
            <input
              type="text"
              placeholder="Cerca ticker (es. NVDA, AAPL)..."
              className="search-input"
              value={searchTicker}
              onChange={(e) => setSearchTicker(e.target.value)}
            />
            <button type="submit" className="btn-secondary" style={{ padding: '0.6rem 0.8rem' }}>
              <Search size={16} />
            </button>
          </form>

          <div className="header-actions">
            <button className="btn-primary" onClick={openNewTransactionModal}>
              <PlusCircle size={18} /> Nuova Transazione
            </button>
          </div>
        </header>

        {/* Dynamic Views */}
        <div className="content-scroll">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <>
              <div className="page-header">
                <div>
                  <h1>Panoramica Portafoglio & Mercato</h1>
                  <p>Analisi predittiva combinata con candele storiche e forecast quantitativi.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn-secondary" onClick={() => { fetchPortfolio(); fetchAnalysis(selectedTicker, timeframe); }}>
                    <RefreshCw size={15} /> Aggiorna
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Valore Totale Portafoglio</h3>
                  <div className="stat-value">
                    ${portfolio?.total_value ? portfolio.total_value.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
                  </div>
                  <div className={`stat-change ${portfolio?.total_pnl && portfolio.total_pnl >= 0 ? 'positive' : 'negative'}`}>
                    {portfolio?.total_pnl && portfolio.total_pnl >= 0 ? '+' : ''}${portfolio?.total_pnl?.toFixed(2) || '0.00'} ({portfolio?.total_pnl_pct || 0}%)
                  </div>
                </div>

                <div className="stat-card">
                  <h3>Posizioni Attive</h3>
                  <div className="stat-value">{portfolio?.active_positions_count || 0}</div>
                  <div className="stat-change" style={{ color: '#94a3b8' }}>Titoli monitorati</div>
                </div>

                <div className="stat-card">
                  <h3>Consenso AI Knowledge Engine</h3>
                  <div className="stat-value" style={{ color: analysis?.recommendation === 'BUY' ? '#10b981' : analysis?.recommendation === 'SELL' ? '#ef4444' : '#38bdf8' }}>
                    {analysis?.recommendation_label || translateRec(analysis?.recommendation)}
                  </div>
                  <div className="stat-change positive">Confidenza: {analysis?.confidence || 86}%</div>
                </div>

                <div className="stat-card">
                  <h3>Prezzo Attuale {selectedTicker || '—'}</h3>
                  <div className="stat-value" style={{ color: '#f8fafc' }}>
                    {getCurrencySymbol(selectedTicker, analysis?.currency)}{analysis?.current_price ? analysis.current_price.toFixed(2) : '0.00'}
                  </div>
                  <div className="stat-change positive">Rapporto R/R: {analysis?.risk_reward_ratio || '1:2.4'}</div>
                </div>
              </div>

              {/* Chart Section */}
              <div className="chart-section">
                <div className="chart-header">
                  <div className="chart-title-area">
                    <h2 style={{ margin: 0 }}>
                      {selectedTicker ? `${selectedTicker} — Grafico & Previsione Sovrapposta` : 'Grafico Titolo'}
                    </h2>
                    {portfolio?.positions && portfolio.positions.length > 0 ? (
                      <div className="ticker-pills">
                        {portfolio.positions.map((p) => (
                          <button
                            key={p.ticker}
                            className={`ticker-pill ${selectedTicker === p.ticker ? 'active' : ''}`}
                            onClick={() => setSelectedTicker(p.ticker)}
                          >
                            {p.ticker}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div className="chart-legend">
                      <div className="legend-item">
                        <div className="legend-color" style={{ background: '#10b981' }}></div>
                        <span>Storico Reale</span>
                      </div>
                      <div
                        className="legend-item interactive"
                        onClick={() => setShowPredictions(!showPredictions)}
                        title="Clicca per mostrare/nascondere le candele di previsione"
                      >
                        <div className="legend-color" style={{ background: showPredictions ? '#38bdf8' : '#64748b' }}></div>
                        <span style={{ textDecoration: showPredictions ? 'none' : 'line-through', color: showPredictions ? '#38bdf8' : '#64748b' }}>
                          Candele Previste (Previsione AI)
                        </span>
                      </div>
                    </div>

                    <button
                      className={`btn-toggle-pred ${showPredictions ? 'active' : ''}`}
                      onClick={() => setShowPredictions(!showPredictions)}
                      title={showPredictions ? "Disattiva candele di previsione" : "Attiva candele di previsione"}
                    >
                      {showPredictions ? <Eye size={15} /> : <EyeOff size={15} />}
                      Previsioni AI: {showPredictions ? 'ON' : 'OFF'}
                    </button>

                    <div className="scale-selector-bar">
                      {SCALE_OPTIONS.map((scale) => (
                        <button
                          key={scale}
                          className={`scale-btn ${timeframe === scale ? 'active' : ''}`}
                          onClick={() => setTimeframe(scale)}
                        >
                          {scale}
                        </button>
                      ))}
                    </div>

                    {selectedTicker && (
                      <button
                        className="btn-maximize"
                        title="Ingrandisci a tutto schermo"
                        onClick={() => setIsFullscreenChartOpen(true)}
                      >
                        <Maximize2 size={16} /> Schermo Intero
                      </button>
                    )}
                  </div>
                </div>

                <div className="chart-container-inner">
                  {!portfolio?.positions || portfolio.positions.length === 0 ? (
                    <div style={{ height: '380px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: '#94a3b8', padding: '2rem', textAlign: 'center' }}>
                      <p style={{ margin: 0, fontSize: '1.05rem', color: '#f8fafc' }}>Non hai ancora registrato alcuna azione nel tuo portafoglio.</p>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>Registra una nuova azione per visualizzare il relativo grafico con dati storici, candele previste e analisi tecnica.</p>
                      <button className="btn-primary" onClick={openNewTransactionModal}>
                        <PlusCircle size={18} /> Registra Azione nel Portafoglio
                      </button>
                    </div>
                  ) : loading ? (
                    <div style={{ height: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                      <RefreshCw size={24} className="animate-spin" style={{ marginRight: '8px' }} /> Caricamento dati e calcolo previsione scala {timeframe}...
                    </div>
                  ) : (
                    <CombinedChart
                      data={analysis?.historical_candles || []}
                      predictions={analysis?.prediction_candles || []}
                      showPredictions={showPredictions}
                      height={380}
                    />
                  )}
                </div>
              </div>

              {/* AI Recursive Learning & 2-Year Backtesting Card */}
              {selectedTicker && analysis?.training_metrics && (
                <div className="ai-training-card">
                  <div className="ai-training-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="ai-status-pulse"></div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#f8fafc' }}>
                          Auto-Apprendimento Ricorsivo & Validazione Storica (2 Anni) — {selectedTicker}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
                          Simulazione giorno per giorno (walkforward) verificata su {analysis.training_metrics.trained_samples_days} sessioni reali.
                        </p>
                      </div>
                    </div>

                    <button
                      className="btn-secondary"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                      disabled={isRetraining}
                      onClick={() => handleRetrainModel(selectedTicker)}
                      title="Ricalcola la simulazione giorno per giorno e ri-calibra i pesi predittivi ricorsivamente"
                    >
                      <RefreshCw size={15} className={isRetraining ? 'animate-spin' : ''} />
                      {isRetraining ? 'Calibrazione in corso...' : 'Ricalibra Modello AI'}
                    </button>
                  </div>

                  <div className="ai-training-stats">
                    <div className="ai-stat-box">
                      <span className="ai-stat-label">Accuratezza Direzionale</span>
                      <span className="ai-stat-value highlight" style={{ color: '#10b981' }}>
                        {analysis.training_metrics.directional_accuracy_pct}%
                      </span>
                      <span className="ai-stat-sub">Verificato su candele reali</span>
                    </div>

                    <div className="ai-stat-box">
                      <span className="ai-stat-label">Errore Medio (MAPE)</span>
                      <span className="ai-stat-value" style={{ color: '#38bdf8' }}>
                        {analysis.training_metrics.mape_pct}%
                      </span>
                      <span className="ai-stat-sub">Scostamento medio da Close</span>
                    </div>

                    <div className="ai-stat-box">
                      <span className="ai-stat-label">Sessioni Giornaliere Testate</span>
                      <span className="ai-stat-value">
                        {analysis.training_metrics.trained_samples_days}
                      </span>
                      <span className="ai-stat-sub">~2 anni di borsa aperta</span>
                    </div>

                    <div className="ai-stat-box">
                      <span className="ai-stat-label">Epoche di Convergenza</span>
                      <span className="ai-stat-value">
                        {analysis.training_metrics.epochs_converged}
                      </span>
                      <span className="ai-stat-sub">Cicli ricorsivi completati</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Insights Grid */}
              <div className="insights-grid">
                <div className="insight-card">
                  <h3>Segnali Knowledge Engine ({selectedTicker})</h3>
                  <ul className="signal-list">
                    {analysis?.active_patterns && analysis.active_patterns.length > 0 ? (
                      analysis.active_patterns.map((p, i) => (
                        <li key={i}>
                          <span className={`signal-dot ${p.signal > 0 ? 'positive' : p.signal < 0 ? 'negative' : 'neutral'}`}></span>
                          <strong>{p.name}</strong>: Rilevato su scala {timeframe} ({p.signal > 0 ? 'Rialzista' : 'Ribassista'}).
                        </li>
                      ))
                    ) : (
                      <>
                        <li><span className="signal-dot positive"></span> <strong>Bullish Engulfing</strong> rilevato su supporto chiave.</li>
                        <li><span className="signal-dot positive"></span> <strong>Double Bottom</strong> in fase di breakout (confidenza 84%).</li>
                        <li><span className="signal-dot neutral"></span> <strong>RSI (14)</strong> a 54.2 — zona di espansione positiva.</li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="insight-card">
                  <h3>Azione Operativa Consigliata</h3>
                  <div className={`action-box ${analysis?.recommendation?.toLowerCase() || 'hold'}`}>
                    <h4>{analysis?.recommendation_label || translateRec(analysis?.recommendation)} {selectedTicker}</h4>
                    <p>{analysis?.reason || 'Fase di consolidamento. Attendere conferma al di sopra del livello di resistenza prima di incrementare la posizione.'}</p>
                    <div className="action-metrics">
                      <div className="action-metric-item">
                        Prezzo Obiettivo: <strong>{getCurrencySymbol(selectedTicker, analysis?.currency)}{analysis?.target_price ? analysis.target_price.toFixed(2) : '—'}</strong>
                      </div>
                      <div className="action-metric-item">
                        Stop Loss: <strong>{getCurrencySymbol(selectedTicker, analysis?.currency)}{analysis?.stop_loss ? analysis.stop_loss.toFixed(2) : '—'}</strong>
                      </div>
                      <div className="action-metric-item">
                        Rapporto R/R: <strong>{analysis?.risk_reward_ratio || '1:2.4'}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dashboard Section: Portafoglio Posizioni Attive */}
              <div className="insight-card" style={{ marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <PieChart size={20} color="#38bdf8" /> Portafoglio Posizioni Attive ({portfolio?.active_positions_count || 0})
                    </h3>
                    <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                      Riepilogo in tempo reale delle posizioni detenute con profitto/perdita e accesso rapido ai grafici.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-secondary" style={{ fontSize: '0.85rem' }} onClick={() => setActiveTab('portfolio')}>
                      Vedi Registro Completo →
                    </button>
                    <button className="btn-primary" style={{ fontSize: '0.85rem' }} onClick={openNewTransactionModal}>
                      <PlusCircle size={16} /> Nuova Transazione
                    </button>
                  </div>
                </div>

                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Ticker</th>
                        <th>Azienda</th>
                        <th>Quantità</th>
                        <th>Prezzo Medio</th>
                        <th>Prezzo Live</th>
                        <th>Controvalore</th>
                        <th>P&L / Rendimento</th>
                        <th>Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio?.positions && portfolio.positions.length > 0 ? (
                        portfolio.positions.map((pos) => (
                          <tr key={`dash-${pos.ticker}`}>
                            <td><strong>{pos.ticker}</strong></td>
                            <td>{pos.company_name}</td>
                            <td>{pos.quantity}</td>
                            <td>{getCurrencySymbol(pos.ticker)}{pos.avg_buy_price.toFixed(2)}</td>
                            <td>{getCurrencySymbol(pos.ticker)}{pos.current_price.toFixed(2)}</td>
                            <td>{getCurrencySymbol(pos.ticker)}{pos.total_value.toFixed(2)}</td>
                            <td style={{ color: pos.pnl >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                              {pos.pnl >= 0 ? '+' : ''}{getCurrencySymbol(pos.ticker)}{pos.pnl.toFixed(2)} ({pos.pnl_pct}%)
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button
                                  className="btn-secondary"
                                  style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}
                                  onClick={() => {
                                    setSelectedTicker(pos.ticker);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  title="Visualizza grafico e previsione di questo titolo"
                                >
                                  Mostra Grafico
                                </button>
                                <button
                                  className="btn-delete-action"
                                  title={`Elimina ${pos.ticker} dal portafoglio`}
                                  onClick={() => handleDeletePosition(pos.ticker)}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                              <span>Nessuna posizione attualmente aperta nel portafoglio.</span>
                              <button className="btn-primary" style={{ marginTop: '6px' }} onClick={openNewTransactionModal}>
                                <PlusCircle size={16} /> Aggiungi Prima Transazione
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Dashboard Section: Ultime Transazioni Recenti */}
              <div className="insight-card" style={{ marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
                  <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={20} color="#38bdf8" /> Ultime Transazioni Eseguite
                  </h3>
                  <button className="btn-secondary" style={{ fontSize: '0.85rem' }} onClick={() => setActiveTab('portfolio')}>
                    Tutte le Transazioni ({transactions.length}) →
                  </button>
                </div>

                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Tipo</th>
                        <th>Ticker</th>
                        <th>Quantità</th>
                        <th>Prezzo Eseguito</th>
                        <th>Totale</th>
                        <th>Commissioni</th>
                        <th>Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length > 0 ? (
                        transactions.slice(0, 5).map((tx) => (
                          <tr key={`dash-tx-${tx.id}`}>
                            <td>{tx.date ? new Date(tx.date).toLocaleDateString() : '-'}</td>
                            <td>
                              <span className={`type-badge ${tx.type.toLowerCase()}`}>
                                {tx.type}
                              </span>
                            </td>
                            <td><strong>{tx.ticker}</strong></td>
                            <td>{tx.quantity}</td>
                            <td>${tx.price.toFixed(2)}</td>
                            <td>${tx.total.toFixed(2)}</td>
                            <td>${tx.fees ? tx.fees.toFixed(2) : '0.00'}</td>
                            <td>{tx.notes || '-'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8' }}>
                            Nessuna transazione recente registrata.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: PORTFOLIO & TRANSACTIONS */}
          {activeTab === 'portfolio' && (
            <>
              <div className="page-header">
                <div>
                  <h1>Portafoglio & Transazioni</h1>
                  <p>Registro di tutte le azioni acquistate, quote, prezzi medi e cronologia esecuzioni.</p>
                </div>
                <button className="btn-primary" onClick={openNewTransactionModal}>
                  <PlusCircle size={18} /> Nuova Transazione
                </button>
              </div>

              {/* Active Holdings */}
              <div className="insight-card">
                <h3>Posizioni Aperte</h3>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Ticker</th>
                        <th>Azienda</th>
                        <th>Quantità</th>
                        <th>Prezzo Medio Acquisto</th>
                        <th>Prezzo Attuale</th>
                        <th>Valore Attuale</th>
                        <th>Profitto / Perdita</th>
                        <th>Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio?.positions && portfolio.positions.length > 0 ? (
                        portfolio.positions.map((pos) => (
                          <tr key={pos.ticker}>
                            <td><strong>{pos.ticker}</strong></td>
                            <td>{pos.company_name}</td>
                            <td>{pos.quantity}</td>
                            <td>{getCurrencySymbol(pos.ticker)}{pos.avg_buy_price.toFixed(2)}</td>
                            <td>{getCurrencySymbol(pos.ticker)}{pos.current_price.toFixed(2)}</td>
                            <td>{getCurrencySymbol(pos.ticker)}{pos.total_value.toFixed(2)}</td>
                            <td style={{ color: pos.pnl >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                              {pos.pnl >= 0 ? '+' : ''}{getCurrencySymbol(pos.ticker)}{pos.pnl.toFixed(2)} ({pos.pnl_pct}%)
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button
                                  className="btn-secondary"
                                  style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem' }}
                                  onClick={() => { setSelectedTicker(pos.ticker); setActiveTab('dashboard'); }}
                                >
                                  Analizza
                                </button>
                                <button
                                  className="btn-delete-action"
                                  title={`Elimina ${pos.ticker} dal portafoglio`}
                                  onClick={() => handleDeletePosition(pos.ticker)}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                            Nessuna posizione registrata. Premi su "Nuova Transazione" per aggiungere le tue prime azioni!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Transactions Ledger */}
              <div className="insight-card">
                <h3>Storico Transazioni Eseguite</h3>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Tipo</th>
                        <th>Ticker</th>
                        <th>Quantità</th>
                        <th>Prezzo Eseguito</th>
                        <th>Totale</th>
                        <th>Commissioni</th>
                        <th>Note</th>
                        <th>Elimina</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length > 0 ? (
                        transactions.map((tx) => (
                          <tr key={tx.id}>
                            <td>{tx.date ? new Date(tx.date).toLocaleDateString() : '-'}</td>
                            <td>
                              <span className={`type-badge ${tx.type.toLowerCase()}`}>
                                {tx.type}
                              </span>
                            </td>
                            <td><strong>{tx.ticker}</strong></td>
                            <td>{tx.quantity}</td>
                            <td>${tx.price.toFixed(2)}</td>
                            <td>${tx.total.toFixed(2)}</td>
                            <td>${tx.fees ? tx.fees.toFixed(2) : '0.00'}</td>
                            <td>{tx.notes || '-'}</td>
                            <td>
                              <button
                                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                onClick={() => handleDeleteTransaction(tx.id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                            Nessuna transazione salvata nel database.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* TAB 3: ANALYSIS & CHART SOURCES */}
          {activeTab === 'analysis' && (
            <>
              <div className="page-header">
                <div>
                  <h1>Analisi Avanzata & Fonti Grafici</h1>
                  <p>Collega link a grafici esterni (TradingView, Finviz) e genera analisi quantitative su misura.</p>
                </div>
              </div>

              {/* Add Chart Source Form */}
              <div className="insight-card">
                <h3>Inserisci Fonte Grafico Esterna</h3>
                <form onSubmit={handleCreateChartSource} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Ticker (es. NVDA)"
                    className="form-input"
                    style={{ width: '130px' }}
                    value={chartSourceTicker}
                    onChange={(e) => setChartSourceTicker(e.target.value)}
                    required
                  />
                  <input
                    type="url"
                    placeholder="URL del grafico (es. https://www.tradingview.com/chart/...)"
                    className="form-input"
                    style={{ flex: 1, minWidth: '300px' }}
                    value={chartSourceUrl}
                    onChange={(e) => setChartSourceUrl(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn-primary">
                    Salva Fonte Grafico
                  </button>
                </form>
              </div>

              {/* Saved Sources */}
              <div className="insight-card">
                <h3>Fonti Grafici Salvate</h3>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Ticker</th>
                        <th>URL Fonte</th>
                        <th>Piattaforma</th>
                        <th>Data Aggiunta</th>
                        <th>Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chartSources.length > 0 ? (
                        chartSources.map((cs) => (
                          <tr key={cs.id}>
                            <td><strong>{cs.ticker}</strong></td>
                            <td>
                              <a href={cs.url} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {cs.url.substring(0, 50)}... <ExternalLink size={14} />
                              </a>
                            </td>
                            <td>{cs.source_type}</td>
                            <td>{cs.created_at ? new Date(cs.created_at).toLocaleDateString() : '-'}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  className="btn-secondary"
                                  style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem' }}
                                  onClick={() => { setSelectedTicker(cs.ticker); setActiveTab('dashboard'); }}
                                >
                                  Lancia Analisi
                                </button>
                                <button
                                  style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                  onClick={() => handleDeleteChartSource(cs.id)}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                            Nessuna fonte esterna inserita. Aggiungi il primo link a TradingView sopra!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Scenarios Breakdown */}
              {analysis && (
                <div className="insight-card">
                  <h3>Scenari di Andamento Previsti ({selectedTicker})</h3>
                  <div className="stats-grid" style={{ marginTop: '1rem' }}>
                    <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
                      <h3>Scenario Rialzista (Bullish)</h3>
                      <div className="stat-value" style={{ color: '#10b981' }}>
                        ${analysis.scenarios.bullish.target.toFixed(2)}
                      </div>
                      <div className="stat-change positive">Probabilità: {analysis.scenarios.bullish.probability}</div>
                    </div>
                    <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                      <h3>Scenario Neutro / Consolidamento</h3>
                      <div className="stat-value" style={{ color: '#f59e0b' }}>
                        ${analysis.scenarios.neutral.target.toFixed(2)}
                      </div>
                      <div className="stat-change">Probabilità: {analysis.scenarios.neutral.probability}</div>
                    </div>
                    <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
                      <h3>Scenario Ribassista (Bearish)</h3>
                      <div className="stat-value" style={{ color: '#ef4444' }}>
                        ${analysis.scenarios.bearish.target.toFixed(2)}
                      </div>
                      <div className="stat-change negative">Probabilità: {analysis.scenarios.bearish.probability}</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 4: KNOWLEDGE ENGINE */}
          {activeTab === 'knowledge' && (
            <>
              <div className="page-header">
                <div>
                  <h1>Trading Knowledge Engine</h1>
                  <p>Archivio centralizzato di strategie quantitative, tecniche di analisi tecnica e pattern catalogati.</p>
                </div>
              </div>

              <div className="card-grid">
                {strategies.map((strat) => (
                  <div key={strat.id} className="feature-card">
                    <div className="feature-card-header">
                      <h3>{strat.name}</h3>
                      <span className="category-badge">{strat.category}</span>
                    </div>
                    <p>{strat.description}</p>
                    <div className="feature-conditions">
                      <div><strong style={{ color: '#10b981' }}>Attivazione Acquisto (Trigger Buy):</strong> {strat.buy_condition}</div>
                      <div><strong style={{ color: '#ef4444' }}>Attivazione Vendita (Trigger Sell):</strong> {strat.sell_condition}</div>
                      <div><strong>Rapporto Rischio/Rendimento:</strong> {strat.risk_reward_ratio} | Confidenza: {(strat.confidence * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* TAB 5: NEWS & SENTIMENT */}
          {activeTab === 'news' && (
            <>
              <div className="page-header">
                <div>
                  <h1>Notizie & Sentiment AI (FinBERT)</h1>
                  <p>Monitoraggio continuo online su novità tecnologiche, AI e catalizzatori di mercato per i tuoi titoli.</p>
                </div>
                <button className="btn-secondary" onClick={() => { fetchNews(); showToast('Feed notizie aggiornato!'); }}>
                  <RefreshCw size={16} /> Aggiorna Notizie Online
                </button>
              </div>

              <div className="card-grid">
                {news.map((item) => (
                  <div key={item.id} className="feature-card">
                    <div className="feature-card-header">
                      <span className="ticker-pill active">{item.ticker}</span>
                      <span className={`type-badge ${item.sentiment_label.toLowerCase()}`}>
                        {translateSentiment(item.sentiment_label)} ({(item.sentiment_score * 100).toFixed(0)}%)
                      </span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{item.title}</h3>
                    <p>{item.summary}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
                      <span>Fonte: {item.source}</span>
                      <a href={item.url} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        Leggi articolo <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* TAB 6: SETTINGS & STORAGE */}
          {activeTab === 'settings' && (
            <>
              <div className="page-header">
                <div>
                  <h1>Archiviazione & Dati Persistenti</h1>
                  <p>Controllo dello stato dei volumi Docker mappati su <code>/srv/docker_conf/trade</code> sull'host.</p>
                </div>
                <button className="btn-primary" onClick={handleSyncStorage}>
                  <RefreshCw size={16} /> Sincronizza / Inizializza Cartelle
                </button>
              </div>

              <div className="insight-card">
                <h3>Percorso Host Mappato</h3>
                <p style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: '1.1rem', margin: '0 0 1rem 0' }}>
                  /srv/docker_conf/trade
                </p>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  Tutti i dati persistenti (strategie JSON, pattern, output delle analisi, dati PostgreSQL e Redis) vengono salvati direttamente in questo percorso esterno sul tuo server Docker.
                </p>

                <h3 style={{ marginTop: '1.5rem' }}>Alberatura Directory Persistenti</h3>
                <div className="storage-tree">
                  <div className="tree-item folder">📁 /srv/docker_conf/trade/</div>
                  <div className="tree-item" style={{ paddingLeft: '1.5rem' }}>📁 strategies/ (strategie di trading JSON)</div>
                  <div className="tree-item" style={{ paddingLeft: '1.5rem' }}>📁 knowledge/ (enciclopedia pattern & candlestick)</div>
                  <div className="tree-item" style={{ paddingLeft: '1.5rem' }}>📁 outputs/ (risultati e grafici esportati in JSON)</div>
                  <div className="tree-item" style={{ paddingLeft: '1.5rem' }}>📁 results/ (storico simulazioni & scenari)</div>
                  <div className="tree-item" style={{ paddingLeft: '1.5rem' }}>📁 backtests/ (risultati test storici)</div>
                  <div className="tree-item" style={{ paddingLeft: '1.5rem' }}>📁 news_cache/ (cache articoli & sentiment)</div>
                  <div className="tree-item" style={{ paddingLeft: '1.5rem' }}>📁 postgres_data/ (database PostgreSQL persistente)</div>
                  <div className="tree-item" style={{ paddingLeft: '1.5rem' }}>📁 redis_data/ (cache e broker Celery)</div>
                  <div className="tree-item" style={{ paddingLeft: '1.5rem' }}>📄 system_info.json (metadati versione v0.7.0)</div>
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
                  <CheckCircle2 size={18} />
                  <span>Stato di archiviazione: Attivo e collegato ai volumi Docker del server. {storageStatus ? `(${storageStatus.storage?.total_files || 0} file catalogati)` : ''}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Modal: Nuova Transazione */}
      {isTxModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Registra Nuova Transazione</h2>
              <button className="btn-close" onClick={() => setIsTxModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction}>
              <div className="form-grid">
                {/* Autocomplete Real Stock Search */}
                <div className="form-group full-width autocomplete-container">
                  <label>Cerca e Seleziona Azione Reale *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Cerca per ticker o nome (es. NVDA, Apple, Eni, Tesla, Ferrari...)"
                      value={stockSearchQuery}
                      onChange={(e) => handleStockSearchInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (stockSuggestions.length > 0) {
                            handleSelectStock(stockSuggestions[0]);
                          } else if (stockSearchQuery.trim()) {
                            const customTicker = stockSearchQuery.trim().toUpperCase();
                            setTxFormData(prev => ({ ...prev, ticker: customTicker, company_name: `${customTicker} Corp` }));
                            setShowSuggestions(false);
                          }
                        }
                      }}
                      onFocus={() => {
                        if (stockSuggestions.length > 0 || stockSearchQuery.trim().length >= 1) setShowSuggestions(true);
                      }}
                    />
                    {isSearchingStocks && (
                      <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                        <RefreshCw size={16} className="animate-spin" style={{ color: '#94a3b8' }} />
                      </div>
                    )}
                  </div>

                  {showSuggestions && stockSuggestions.length > 0 && (
                    <div className="autocomplete-dropdown">
                      {stockSuggestions.map((s, idx) => (
                        <div
                          key={`${s.ticker}-${s.exchange || ''}-${idx}`}
                          className="autocomplete-item"
                          onClick={() => handleSelectStock(s)}
                        >
                          <span className="autocomplete-ticker">{s.ticker}</span>
                          <span className="autocomplete-name">{s.company_name}</span>
                          <span className="autocomplete-exchange">{s.exchange}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {showSuggestions && !isSearchingStocks && stockSuggestions.length === 0 && stockSearchQuery.trim().length >= 1 && (
                    <div className="autocomplete-dropdown">
                      <div
                        className="autocomplete-item"
                        onClick={() => {
                          const tk = stockSearchQuery.trim().toUpperCase();
                          setTxFormData(prev => ({ ...prev, ticker: tk, company_name: `${tk} Corp` }));
                          setShowSuggestions(false);
                        }}
                      >
                        <span className="autocomplete-ticker">{stockSearchQuery.trim().toUpperCase()}</span>
                        <span className="autocomplete-name">Usa come ticker personalizzato</span>
                        <span className="autocomplete-exchange">MANUALE</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Ticker Selezionato *</label>
                  <input
                    type="text"
                    required
                    placeholder="es. NVDA"
                    className="form-input"
                    value={txFormData.ticker}
                    onChange={(e) => setTxFormData({ ...txFormData, ticker: e.target.value.toUpperCase() })}
                  />
                </div>

                <div className="form-group">
                  <label>Nome Azienda</label>
                  <input
                    type="text"
                    placeholder="es. NVIDIA Corp"
                    className="form-input"
                    value={txFormData.company_name}
                    onChange={(e) => setTxFormData({ ...txFormData, company_name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Tipo Operazione *</label>
                  <select
                    className="form-select"
                    value={txFormData.type}
                    onChange={(e) => setTxFormData({ ...txFormData, type: e.target.value })}
                  >
                    <option value="BUY">ACQUISTO (BUY)</option>
                    <option value="SELL">VENDITA (SELL)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Quantità Azioni *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="0.0001"
                    className="form-input"
                    value={txFormData.quantity}
                    onChange={(e) => setTxFormData({ ...txFormData, quantity: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="form-group">
                  <label>Prezzo Unitario ($) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="0.01"
                    className="form-input"
                    value={txFormData.price}
                    onChange={(e) => setTxFormData({ ...txFormData, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="form-group">
                  <label>Commissioni ($)</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    className="form-input"
                    value={txFormData.fees}
                    onChange={(e) => setTxFormData({ ...txFormData, fees: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Note Operative</label>
                  <input
                    type="text"
                    placeholder="es. Acquisto su supporto breakout dopo earnings..."
                    className="form-input"
                    value={txFormData.notes}
                    onChange={(e) => setTxFormData({ ...txFormData, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsTxModalOpen(false)}>
                  Annulla
                </button>
                <button type="submit" className="btn-primary">
                  Salva Transazione
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen Chart Modal */}
      {isFullscreenChartOpen && (
        <div className="chart-fullscreen-overlay" onClick={() => setIsFullscreenChartOpen(false)}>
          <div className="chart-fullscreen-container" onClick={(e) => e.stopPropagation()}>
            <div className="fullscreen-topbar">
              <div className="fullscreen-title-area">
                <h2 className="fullscreen-ticker-title">{selectedTicker} — Grafico Storico & Previsione Sovrapposta</h2>
                <div className="fullscreen-price-badge">
                  {getCurrencySymbol(selectedTicker, analysis?.currency)}{analysis?.current_price ? analysis.current_price.toFixed(2) : '—'}
                </div>
                <span className={`type-badge ${analysis?.recommendation?.toLowerCase() || 'hold'}`}>
                  {analysis?.recommendation_label || translateRec(analysis?.recommendation)} ({analysis?.confidence || 86}% Confidenza)
                </span>
                <div className="ticker-pills">
                  {portfolio?.positions && portfolio.positions.length > 0 ? (
                    portfolio.positions.map((p) => (
                      <button
                        key={p.ticker}
                        className={`ticker-pill ${selectedTicker === p.ticker ? 'active' : ''}`}
                        onClick={() => setSelectedTicker(p.ticker)}
                      >
                        {p.ticker}
                      </button>
                    ))
                  ) : null}
                </div>
              </div>

              <button className="btn-close" onClick={() => setIsFullscreenChartOpen(false)} title="Chiudi (Esc)">
                <X size={22} />
              </button>
            </div>

            <div className="fullscreen-controls-bar">
              <div className="scale-selector-bar">
                {SCALE_OPTIONS.map((scale) => (
                  <button
                    key={scale}
                    className={`scale-btn ${timeframe === scale ? 'active' : ''}`}
                    onClick={() => setTimeframe(scale)}
                  >
                    {scale}
                  </button>
                ))}
              </div>

              <div className="chart-legend">
                <div className="legend-item">
                  <div className="legend-color" style={{ background: '#10b981' }}></div>
                  <span>Storico Reale</span>
                </div>
                <div
                  className="legend-item interactive"
                  onClick={() => setShowPredictions(!showPredictions)}
                  title="Clicca per mostrare/nascondere le candele di previsione"
                >
                  <div className="legend-color" style={{ background: showPredictions ? '#38bdf8' : '#64748b' }}></div>
                  <span style={{ textDecoration: showPredictions ? 'none' : 'line-through', color: showPredictions ? '#38bdf8' : '#64748b' }}>
                    Candele Previste (Previsione AI)
                  </span>
                </div>
              </div>

              <button
                className={`btn-toggle-pred ${showPredictions ? 'active' : ''}`}
                onClick={() => setShowPredictions(!showPredictions)}
                title={showPredictions ? "Disattiva candele di previsione" : "Attiva candele di previsione"}
              >
                {showPredictions ? <Eye size={15} /> : <EyeOff size={15} />}
                Previsioni AI: {showPredictions ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="fullscreen-chart-area">
              {loading ? (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                  <RefreshCw size={28} className="animate-spin" style={{ marginRight: '10px' }} /> Caricamento dati e calcolo previsione scala {timeframe}...
                </div>
              ) : (
                <CombinedChart
                  data={analysis?.historical_candles || []}
                  predictions={analysis?.prediction_candles || []}
                  showPredictions={showPredictions}
                  height={window.innerHeight - 260}
                />
              )}
            </div>

            <div className="fullscreen-footer">
              <div>
                <span>Prezzo Obiettivo: <strong style={{ color: '#10b981' }}>{getCurrencySymbol(selectedTicker, analysis?.currency)}{analysis?.target_price ? analysis.target_price.toFixed(2) : '—'}</strong></span>
                <span style={{ margin: '0 12px' }}>•</span>
                <span>Stop Loss: <strong style={{ color: '#ef4444' }}>{getCurrencySymbol(selectedTicker, analysis?.currency)}{analysis?.stop_loss ? analysis.stop_loss.toFixed(2) : '—'}</strong></span>
                <span style={{ margin: '0 12px' }}>•</span>
                <span>Rapporto R/R: <strong style={{ color: '#f8fafc' }}>{analysis?.risk_reward_ratio || '1:2.4'}</strong></span>
              </div>
              <div>
                <span>Pattern attivi nel grafico: <strong>{analysis?.active_patterns?.map(p => p.name).join(', ') || 'Nessuno rilevato'}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
