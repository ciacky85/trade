import { Activity, LayoutDashboard, Settings, TrendingUp, BookOpen, Clock, PlusCircle } from 'lucide-react';
import { CombinedChart } from '../charts/CombinedChart';

export const DashboardLayout = () => {
  return (
    <div className="dashboard-grid">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
            <TrendingUp size={32} color="#38bdf8" />
            <h2>TradeAnalyzer</h2>
        </div>
        <nav className="sidebar-nav">
          <a href="#" className="nav-item active"><LayoutDashboard size={20} /> Dashboard</a>
          <a href="#" className="nav-item"><Activity size={20} /> Analysis</a>
          <a href="#" className="nav-item"><BookOpen size={20} /> Knowledge Engine</a>
          <a href="#" className="nav-item"><Clock size={20} /> History</a>
          <a href="#" className="nav-item"><Settings size={20} /> Settings</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
            <div className="header-search">
                <input type="text" placeholder="Search ticker..." className="search-input" />
            </div>
            <div className="header-actions">
                <button className="btn-primary"><PlusCircle size={18} /> New Transaction</button>
                <div className="version-badge">v0.1.0</div>
            </div>
        </header>
        
        <div className="content-scroll">
            <div className="page-header">
                <h1>Portfolio Overview</h1>
                <p>Advanced strategy analysis and market predictions.</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Value</h3>
                    <div className="stat-value">$124,500.00</div>
                    <div className="stat-change positive">+2.4% today</div>
                </div>
                <div className="stat-card">
                    <h3>Active Positions</h3>
                    <div className="stat-value">8</div>
                </div>
                <div className="stat-card">
                    <h3>AI Consensus</h3>
                    <div className="stat-value" style={{ color: '#10b981' }}>BULLISH</div>
                    <div className="stat-change">Confidence: 87%</div>
                </div>
            </div>

            <div className="chart-section">
                <div className="chart-header">
                    <h2>NVDA - Prediction Analysis</h2>
                    <div className="chart-tabs">
                        <button className="tab active">1D</button>
                        <button className="tab">1W</button>
                        <button className="tab">1M</button>
                    </div>
                </div>
                <div className="chart-container-inner">
                    <CombinedChart data={[]} predictions={[]} />
                </div>
            </div>
            
            <div className="insights-grid">
                 <div className="insight-card">
                    <h3>Knowledge Engine Signals</h3>
                    <ul className="signal-list">
                        <li><span className="signal-dot positive"></span> <strong>Bullish Engulfing</strong> detected on 1D timeframe.</li>
                        <li><span className="signal-dot positive"></span> <strong>Double Bottom</strong> forming (confidence 82%).</li>
                        <li><span className="signal-dot negative"></span> <strong>FinBERT Sentiment</strong> slightly negative on recent AI regulations.</li>
                    </ul>
                </div>
                
                 <div className="insight-card">
                    <h3>Recommended Actions</h3>
                    <div className="action-box">
                        <h4>HOLD NVDA</h4>
                        <p>Wait for confirmation of the double bottom breakout before adding to the position. Stop loss recommended at $148.50.</p>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};
