'use client';

import { useState } from 'react';
import LeadForm from '@/components/LeadForm';
import CalculatorForm from '@/components/CalculatorForm';

export default function PackIQPage() {
  const [leadId, setLeadId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden relative selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-none bg-brand-primary/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-none bg-brand-accent/20 blur-[150px]" />
      
      <main className="w-full max-w-7xl mx-auto flex flex-col items-center z-10">
        
        {/* Header */}
        <div className="text-center mb-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center px-3 py-1 rounded-none border border-brand-primary/20 bg-brand-primary/10 text-brand-primary text-xs font-semibold tracking-wide uppercase shadow-sm">
            Pro Tools
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-primary tracking-tight">
            Pack-IQ Pricing Engine
          </h1>
          <p className="text-lg text-gray-600">
            Calculate accurate dimensional weight and estimated material costs instantly with our intelligent packaging algorithm.
          </p>
        </div>

        {/* Content Container */}
        <div className="w-full flex justify-center transform transition-all duration-700 ease-in-out">
          {!leadId ? (
            <div className="w-full max-w-md animate-in slide-in-from-bottom-8 fade-in duration-500 flex justify-center">
              <LeadForm onSuccess={(id) => setLeadId(id)} />
            </div>
          ) : (
            <div className="w-full animate-in slide-in-from-bottom-12 fade-in duration-700 flex justify-center">
              <CalculatorForm leadId={leadId} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
