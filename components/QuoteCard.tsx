import React, { useState, useEffect } from 'react';
import { fetchSpiritualQuote } from '../services/geminiService';
import { QuoteResponse } from '../types';

const QuoteCard: React.FC = () => {
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const getQuote = async () => {
    setLoading(true);
    const data = await fetchSpiritualQuote();
    setQuote(data);
    setLoading(false);
  };

  useEffect(() => {
    // Initial fetch on mount
    getQuote();
  }, []);

  return (
    <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-emerald-100 mt-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500 rounded-bl-full opacity-10"></div>
      
      <h3 className="text-emerald-800 font-bold mb-3 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
        </svg>
        نکته معنوی (هوش مصنوعی)
      </h3>

      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-2 bg-emerald-100 rounded w-3/4"></div>
          <div className="h-2 bg-emerald-100 rounded w-1/2"></div>
        </div>
      ) : (
        <div className="text-slate-700">
          <p className="text-lg leading-relaxed mb-2 font-medium">
            «{quote?.text}»
          </p>
          {quote?.source && (
            <p className="text-sm text-emerald-600 text-left pl-2">
              — {quote.source}
            </p>
          )}
        </div>
      )}

      <button 
        onClick={getQuote}
        disabled={loading}
        className="mt-4 text-xs text-emerald-500 hover:text-emerald-700 underline transition-colors"
      >
        دریافت نکته جدید
      </button>
    </div>
  );
};

export default QuoteCard;