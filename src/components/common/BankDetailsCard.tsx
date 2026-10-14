import React, { useState } from 'react';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { STORE_CONFIG } from '../../config/storeConfig';
import { Building2, Copy, Check, ShieldCheck, AlertCircle } from 'lucide-react';

interface BankDetailsCardProps {
  variant?: 'dark' | 'light';
  showInstructions?: boolean;
  className?: string;
}

export const BankDetailsCard: React.FC<BankDetailsCardProps> = ({
  variant = 'dark',
  showInstructions = true,
  className = ''
}) => {
  const { settings } = useStoreSettings();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const bankName = settings.bank_name || STORE_CONFIG.bankName;
  const accountHolder = settings.bank_account_name || STORE_CONFIG.bankAccountName;
  const accountNumber = settings.bank_account_number || STORE_CONFIG.bankAccountNumber;
  const ifscCode = settings.bank_ifsc || STORE_CONFIG.bankIfsc;
  const branch = settings.bank_branch || STORE_CONFIG.bankBranch;
  const instructions = settings.bank_payment_instructions || STORE_CONFIG.bankPaymentInstructions;

  const handleCopy = (text: string, fieldName: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2500);
    }
  };

  const isDark = variant === 'dark';

  return (
    <div
      className={`rounded-2xl p-5 border transition-all ${
        isDark
          ? 'bg-slate-900/90 border-amber-500/30 text-slate-200 shadow-xl'
          : 'bg-white border-amber-300/60 text-slate-800 shadow-md'
      } ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-500/20">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-amber-500 block">
              Official Business Account
            </span>
            <h4 className="font-extrabold text-sm sm:text-base tracking-wide flex items-center gap-1.5">
              <span>{bankName}</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </h4>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          Verified
        </span>
      </div>

      {/* Details Grid */}
      <div className="space-y-2.5 text-xs">
        {/* Account Holder */}
        <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
          isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
        }`}>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Account Holder Name
            </span>
            <span className="font-extrabold text-sm tracking-wide text-amber-400">
              {accountHolder}
            </span>
          </div>
        </div>

        {/* Account Number with Copy */}
        <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
          isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="min-w-0 pr-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Account Number
            </span>
            <span className="font-mono font-black text-sm sm:text-base tracking-widest select-all">
              {accountNumber}
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(accountNumber, 'account')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              copiedField === 'account'
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40'
            }`}
            title="Copy Account Number"
          >
            {copiedField === 'account' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* IFSC Code with Copy */}
        <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
          isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="min-w-0 pr-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              IFSC Code
            </span>
            <span className="font-mono font-black text-sm tracking-widest text-amber-400 select-all">
              {ifscCode}
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(ifscCode, 'ifsc')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              copiedField === 'ifsc'
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40'
            }`}
            title="Copy IFSC Code"
          >
            {copiedField === 'ifsc' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Branch */}
        <div className="flex items-center justify-between text-[11px] px-1 text-slate-400">
          <span>Branch:</span>
          <span className="font-semibold text-slate-300">{branch}</span>
        </div>
      </div>

      {/* Instructions Note */}
      {showInstructions && (
        <div className="mt-3.5 pt-3 border-t border-amber-500/20 text-[11px] leading-relaxed flex items-start gap-2 text-slate-400">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>{instructions}</span>
        </div>
      )}
    </div>
  );
};
