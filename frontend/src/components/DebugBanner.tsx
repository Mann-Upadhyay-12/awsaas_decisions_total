import { useAWSaaSContext } from '../context/AWSaaSContext';

export const DebugBanner = () => {
  const { strategy } = useAWSaaSContext();
  const isDebug = new URLSearchParams(window.location.search).get('debug') === '1';

  if (!isDebug || !strategy) return null;

  return (
    <div style={{
      background: '#0D1B2A',
      color: '#14B8D4',
      fontSize: '12px',
      fontFamily: 'monospace',
      padding: '8px 2rem',
      display: 'flex',
      gap: '2rem',
      alignItems: 'center',
      borderBottom: '1px solid #1B3A5C'
    }}>
      <span style={{ fontWeight: 'bold' }}>🚀 AWSaaS ML Decision</span>
      <span>Strategy: <strong style={{ color: '#fff' }}>{strategy.strategy}</strong></span>
      <span>Confidence: <strong style={{ color: '#fff' }}>{(strategy.confidence * 100).toFixed(0)}%</strong></span>
      <span>Network: <strong style={{ color: '#fff' }}>{strategy.networkClass}</strong></span>
      <span>Device: <strong style={{ color: '#fff' }}>{strategy.deviceClass}</strong></span>
      <span style={{ color: '#4ECDC4', fontWeight: 'bold' }}>Est. Improv: +{strategy.estimatedSpeedImprovement}%</span>
      {strategy.uncertaintyMode && <span style={{ color: '#FF6B35' }}>⚠️ Uncertainty Mode</span>}
    </div>
  );
};
