'use client';

import { useEffect, useState } from 'react';

interface TokenStats {
  requests: number;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
}

export default function TokenUsage() {
  const [stats, setStats] = useState<TokenStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        // Silent fail - stats are not critical
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  const remainingTokens = 250000 - stats.totalTokens;
  const remainingPercent = Math.max(0, (remainingTokens / 250000) * 100);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3">
      <div className="max-w-4xl mx-auto flex flex-wrap justify-between items-center text-xs text-gray-600 gap-2">
        <span>📊 Requests: {stats.requests}</span>
        <span>📝 Total Tokens: {stats.totalTokens.toLocaleString()}</span>
        <span>⬆️ Input: {stats.inputTokens.toLocaleString()}</span>
        <span>⬇️ Output: {stats.outputTokens.toLocaleString()}</span>
        <div className="flex items-center gap-2">
          <span className="text-green-600">
            ✅ Free Tier: {remainingTokens.toLocaleString()} tokens remaining
          </span>
          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${remainingPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}