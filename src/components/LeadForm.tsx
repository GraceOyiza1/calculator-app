'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  company: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function LeadForm({ onSuccess }: { onSuccess: (leadId: string) => void }) {
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error('Failed to submit form');
      }

      const resData = await res.json();
      onSuccess(resData.leadId);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white/70 backdrop-blur-xl rounded-none shadow-2xl border border-white/20">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-brand-primary">Pack-IQ Calculator</h2>
        <p className="text-gray-500">Enter your details to access the pricing calculator</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            {...register('name')}
            className="w-full px-4 py-3 rounded-none border border-gray-200 bg-white/50 focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all outline-none"
            placeholder="Jane Doe"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Work Email</label>
          <input
            {...register('email')}
            type="email"
            className="w-full px-4 py-3 rounded-none border border-gray-200 bg-white/50 focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all outline-none"
            placeholder="jane@company.com"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Company (Optional)</label>
          <input
            {...register('company')}
            className="w-full px-4 py-3 rounded-none border border-gray-200 bg-white/50 focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all outline-none"
            placeholder="Acme Corp"
          />
        </div>

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-none border border-red-100">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-none shadow-sm text-sm font-semibold text-white bg-brand-accent hover:bg-brand-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
          Access Calculator
        </button>
      </form>
    </div>
  );
}
