import { useState, useEffect, useCallback } from 'react';

export interface Strategy {
  strategy: string;
  payloadSize: string;
  imageQuality: string;
  features: string[];
  deferredFeatures: string[];
  confidence: number;
  networkClass: string;
  deviceClass: string;
  decisionMs: number;
  estimatedSpeedImprovement?: number;
  uncertaintyMode?: boolean;
}

export const useAWSaaS = () => {
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const profile = useCallback(async () => {
    try {
      setLoading(true);
      
      const nav = navigator as any;
      const conn = nav.connection || nav.mozConnection || nav.webkitConnection;

      const benchmarkCPU = () => {
        const start = performance.now();
        let x = 0;
        for (let i = 0; i < 2e7; i++) { x += i; }
        return Math.round(performance.now() - start);
      };

      const measureRTT = async () => {
        const start = performance.now();
        await fetch('/api/ping', { method: 'HEAD', cache: 'no-store' });
        return Math.round(performance.now() - start);
      };

      const [rttMs, cpuScore] = await Promise.all([measureRTT(), benchmarkCPU()]);

      const payload = {
        sessionId: crypto.randomUUID?.() || Math.random().toString(36).slice(2),
        network: { rttMs, bandwidthMbps: conn?.downlink || 10 },
        device: {
          memoryGb: nav.deviceMemory || 4,
          cores: nav.hardwareConcurrency || 4,
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
          dpr: window.devicePixelRatio || 1,
          saveData: conn?.saveData || false,
          connectionType: conn?.effectiveType || '4g',
          cpuScore
        },
        history: JSON.parse(localStorage.getItem('awsaas_history') || '{}')
      };

      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(res.statusText);
      
      const data: Strategy = await res.json();
      document.cookie = `awsaas_strategy=${data.strategy}; path=/; SameSite=Lax`;
      
      setStrategy(data);
      localStorage.setItem('awsaas_history', JSON.stringify({
        lastVisit: Date.now(),
        strategy: data.strategy
      }));
    } catch (err: any) {
      console.error("Profiling failed", err);
      setError(err.message);
      setStrategy({
        strategy: "LARGE",
        payloadSize: "LARGE",
        imageQuality: "HIGH",
        features: ["core", "analytics", "chat", "video", "animations"],
        deferredFeatures: [],
        confidence: 0,
        networkClass: "UNKNOWN",
        deviceClass: "UNKNOWN",
        decisionMs: 0
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    profile();
  }, [profile]);

  return { strategy, loading, error, refetch: profile };
};
