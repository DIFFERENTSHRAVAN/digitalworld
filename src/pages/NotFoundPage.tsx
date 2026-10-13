import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, ArrowLeft, Search } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-20 max-w-md text-center space-y-6">
      <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto text-primary">
        <Cpu className="w-10 h-10 text-secondary" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-extrabold uppercase tracking-wider text-rose-600">
          Error 404 - Page Not Found
        </span>
        <h1 className="text-3xl font-extrabold text-primary">
          Looking for a specific product?
        </h1>
        <p className="text-xs text-charcoal-muted leading-relaxed">
          The page or product link you followed may have moved or is no longer listed in our inventory.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link
          to="/"
          className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primary-light text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <Link
          to="/products"
          className="w-full sm:w-auto px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-charcoal font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <Search className="w-4 h-4 text-secondary" />
          <span>Explore Catalog</span>
        </Link>
      </div>
    </div>
  );
};
