import { useEffect, useState } from 'react';
import { AWSaaSProvider, useAWSaaSContext } from './context/AWSaaSContext';
import { ProductGrid } from './components/ProductGrid';
import { DeferredFeature } from './components/DeferredFeature';
import './App.css';

const StatCard = ({ label, value, sub }: { label: string, value: string | number, sub?: string }) => (
  <div className="card">
    <div className="label">{label}</div>
    <div className="value">{value}</div>
    {sub && <div className="sub">{sub}</div>}
  </div>
);

const Dashboard = () => {
  const { strategy, isEnabled, setIsEnabled, loading } = useAWSaaSContext();
  const [metrics, setMetrics] = useState({ tti: 0, payload: 0 });

  useEffect(() => {
    if (loading) return;
    
    if (!isEnabled) {
      setMetrics({ tti: 4.2, payload: 12.4 });
    } else {
      const base = strategy?.strategy === 'SMALL' ? 0.8 : (strategy?.strategy === 'MEDIUM' ? 1.2 : 1.8);
      setMetrics({ 
        tti: base + Math.random() * 0.2,
        payload: strategy?.strategy === 'SMALL' ? 1.2 : (strategy?.strategy === 'MEDIUM' ? 4.6 : 12.4)
      });
    }
  }, [isEnabled, strategy, loading]);

  if (loading) return <div className="loading">Initializing AWSaaS...</div>;

  return (
    <div className="layout">
      <header className="header">
        <div className="brand">
          <div className="logo">A</div>
          <h1>AWSaaS</h1>
        </div>
        <div className="controls">
          <div className={`status-pill ${isEnabled ? 'on' : 'off'}`}>
            {isEnabled ? 'Live Optimization' : 'Static Mode'}
          </div>
          <button className="toggle" onClick={() => setIsEnabled(!isEnabled)}>
            {isEnabled ? 'Disable' : 'Enable'} AWSaaS
          </button>
        </div>
      </header>

      <main className="content">
        <div className="grid-stats">
          <StatCard 
            label="Avg. Response Time" 
            value={`${metrics.tti.toFixed(2)}s`} 
            sub={isEnabled ? 'Optimized' : 'High Latency'} 
          />
          <StatCard 
            label="Asset Payload" 
            value={`${metrics.payload}MB`} 
            sub={`${strategy?.strategy || 'Large'} Quality`} 
          />
          <StatCard 
            label="Network Class" 
            value={strategy?.networkClass || 'N/A'} 
            sub={`${(strategy?.confidence || 0 * 100).toFixed(0)}% Confidence`} 
          />
          <StatCard 
            label="Decision Latency" 
            value={`${strategy?.decisionMs || 0}ms`} 
            sub="Real-time" 
          />
        </div>

        <section className="products">
          <div className="section-header">
            <h2>Marketplace</h2>
            <DeferredFeature feature="chat">
              <button className="chat-btn">Support Chat</button>
            </DeferredFeature>
          </div>
          <ProductGrid />
        </section>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AWSaaSProvider>
      <Dashboard />
    </AWSaaSProvider>
  );
}
