'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Package, Ruler, DollarSign, Scale } from 'lucide-react';

const schema = z.object({
  length: z.number().positive('Must be positive'),
  width: z.number().positive('Must be positive'),
  height: z.number().positive('Must be positive'),
  materialType: z.string().min(1, 'Material is required'),
});

type FormData = z.infer<typeof schema>;

interface CalculatorResults {
  dimWeightLbs: string;
  estimatedMaterialCost: string;
  blankAreaSqFt: string;
}

export default function CalculatorForm({ leadId }: { leadId: string }) {
  const [results, setResults] = useState<CalculatorResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      materialType: 'Cardboard'
    }
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    setResults(null);
    try {
      const res = await fetch('/api/calculators/pack-iq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, leadId }),
      });

      if (!res.ok) {
        throw new Error('Failed to calculate pricing');
      }

      const resData = await res.json();
      setResults(resData);
    } catch (err: any) {
      setError(err.message || 'An error occurred during calculation');
    }
  };

  return (
    <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6 items-start">
      {/* Input Form */}
      <div className="p-8 bg-white/70 backdrop-blur-xl rounded-none shadow-2xl border border-white/20">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-brand-primary flex items-center">
            <Package className="mr-2 h-6 w-6 text-brand-accent" /> Package Dimensions
          </h2>
          <p className="text-gray-500 text-sm mt-1">Enter dimensions in inches to calculate packaging specs.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Length (in)</label>
              <input
                type="number"
                step="0.01"
                {...register('length', { valueAsNumber: true })}
                className="w-full px-4 py-3 rounded-none border border-gray-200 bg-white/50 focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all outline-none"
                placeholder="0.00"
              />
              {errors.length && <p className="text-red-500 text-xs">{errors.length.message}</p>}
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Width (in)</label>
              <input
                type="number"
                step="0.01"
                {...register('width', { valueAsNumber: true })}
                className="w-full px-4 py-3 rounded-none border border-gray-200 bg-white/50 focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all outline-none"
                placeholder="0.00"
              />
              {errors.width && <p className="text-red-500 text-xs">{errors.width.message}</p>}
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Height (in)</label>
              <input
                type="number"
                step="0.01"
                {...register('height', { valueAsNumber: true })}
                className="w-full px-4 py-3 rounded-none border border-gray-200 bg-white/50 focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all outline-none"
                placeholder="0.00"
              />
              {errors.height && <p className="text-red-500 text-xs">{errors.height.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Material</label>
              <select
                {...register('materialType')}
                className="w-full px-4 py-3 rounded-none border border-gray-200 bg-white/50 focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all outline-none"
              >
                <option value="Cardboard">Cardboard</option>
                <option value="Rigid Plastic">Rigid Plastic</option>
              </select>
              {errors.materialType && <p className="text-red-500 text-xs">{errors.materialType.message}</p>}
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-none border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-none shadow-sm text-sm font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
            Calculate Specs
          </button>
        </form>
      </div>

      {/* Results Display */}
      <div className="h-full">
        {results ? (
          <div className="h-full p-8 bg-brand-primary rounded-none shadow-2xl text-white transform transition-all duration-500 ease-out flex flex-col justify-center space-y-8 animate-in slide-in-from-right-8 fade-in">
            <h3 className="text-2xl font-bold border-b border-white/20 pb-4">Estimated Results</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-white/80">
                  <Scale className="h-5 w-5 mr-3 opacity-70" />
                  <span>Dimensional Weight</span>
                </div>
                <div className="text-2xl font-bold">{results.dimWeightLbs} <span className="text-sm font-normal opacity-70">lbs</span></div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-white/80">
                  <Ruler className="h-5 w-5 mr-3 opacity-70" />
                  <span>Blank Area</span>
                </div>
                <div className="text-2xl font-bold">{results.blankAreaSqFt} <span className="text-sm font-normal opacity-70">sq ft</span></div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/20">
                <div className="flex items-center text-white/80">
                  <DollarSign className="h-6 w-6 mr-3 text-brand-accent" />
                  <span className="font-medium text-lg text-white">Material Cost</span>
                </div>
                <div className="text-4xl font-bold text-brand-accent">${results.estimatedMaterialCost}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[400px] p-8 border-2 border-dashed border-gray-300/50 rounded-none flex flex-col items-center justify-center text-gray-400 bg-white/20 backdrop-blur-sm">
            <Package className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-center font-medium">Submit dimensions to view<br/>your calculated estimates</p>
          </div>
        )}
      </div>
    </div>
  );
}
