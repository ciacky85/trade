import { useState } from 'react'
import './App.css'

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>TradeAnalyzer Pro</h1>
        <div className="version-badge">v0.1.0</div>
      </header>
      
      <main className="app-main">
        <section className="dashboard-content">
          <h2>Dashboard</h2>
          <p>Portfolio data and Knowledge Engine insights will appear here.</p>
        </section>
      </main>

      <footer className="app-footer">
        <p>TradeAnalyzer Pro - Advanced Strategy Engine</p>
      </footer>
    </div>
  )
}

export default App
