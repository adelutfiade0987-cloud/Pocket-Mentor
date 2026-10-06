import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Wallet,
  ShieldAlert,
  PiggyBank,
  Coffee,
  Home,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { FinanceData } from '../types';

interface FinanceViewProps {
  finance: FinanceData;
  onUpdateFinance: (data: FinanceData) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({ finance, onUpdateFinance }) => {
  const [income, setIncome] = useState<number>(finance.monthlyIncome);
  const [needsPct, setNeedsPct] = useState<number>(finance.needsPercent);
  const [wantsPct, setWantsPct] = useState<number>(finance.wantsPercent);
  const [savingsPct, setSavingsPct] = useState<number>(finance.savingsPercent);
  const [emergencyMonths, setEmergencyMonths] = useState<number>(finance.emergencyFundTargetMonths);
  const [emergencyCurrent, setEmergencyCurrent] = useState<number>(finance.emergencyFundCurrent);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const needsAmount = (income * needsPct) / 100;
  const wantsAmount = (income * wantsPct) / 100;
  const savingsAmount = (income * savingsPct) / 100;

  // Monthly needs estimate for emergency fund
  const monthlyEssentialCost = needsAmount || (income * 0.5);
  const emergencyTargetTotal = monthlyEssentialCost * emergencyMonths;
  const emergencyPct = emergencyTargetTotal > 0 ? Math.min(100, Math.round((emergencyCurrent / emergencyTargetTotal) * 100)) : 0;

  const handleApplyChanges = () => {
    onUpdateFinance({
      ...finance,
      monthlyIncome: income,
      needsPercent: needsPct,
      wantsPercent: wantsPct,
      savingsPercent: savingsPct,
      emergencyFundTargetMonths: emergencyMonths,
      emergencyFundCurrent: emergencyCurrent,
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F9] pb-28 pt-4 px-4 max-w-md mx-auto">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-[#1A1A2E]">Finansial Mandiri</h1>
        <p className="text-xs text-[#6B7280]">
          Pengelolaan uang fleksibel 50/30/20 untuk mahasiswa & awal karier.
        </p>
      </div>

      {/* Income Input Card */}
      <div className="bg-white p-5 rounded-3xl border border-black/[0.05] shadow-xs mb-4">
        <label className="block text-xs font-bold text-[#1A1A2E] mb-1.5">
          Estimasi Pemasukan / Uang Saku Bulanan
        </label>
        <div className="relative mb-3">
          <input
            type="number"
            step="100000"
            value={income}
            onChange={(e) => {
              const val = Math.max(0, parseInt(e.target.value, 10) || 0);
              setIncome(val);
            }}
            className="w-full pl-4 pr-16 py-3 bg-[#F5F5F9] rounded-2xl text-base font-bold text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#6B7280]">
            IDR
          </span>
        </div>

        {/* Quick Amount presets */}
        <div className="flex flex-wrap gap-1.5">
          {[2000000, 3500000, 5000000, 8000000].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setIncome(preset)}
              className={`text-[11px] px-2.5 py-1 rounded-xl transition-all ${
                income === preset
                  ? 'bg-[#6C5CE7] text-white font-semibold'
                  : 'bg-[#F5F5F9] text-[#6B7280] hover:text-[#1A1A2E]'
              }`}
            >
              {formatIDR(preset).replace(',00', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Irregular Income Notice for Students / Freelancers */}
      <div className="bg-[#FFB020]/15 border border-[#FFB020]/30 p-3.5 rounded-2xl mb-4 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#FFB020] shrink-0 mt-0.5" />
        <div className="text-[11px] text-[#1A1A2E] leading-relaxed">
          <span className="font-bold">Tips untuk penghasilan tidak tentu: </span>
          Jangan memaksakan persentase kaku saat pemasukan naik-turun. Prioritaskan kebutuhan pokok (Needs) terlebih dahulu sebelum mengalokasikan Wants.
        </div>
      </div>

      {/* Segmented Color Bar Visualizer */}
      <div className="bg-white p-5 rounded-3xl border border-black/[0.05] shadow-xs mb-4">
        <div className="flex items-center justify-between text-xs font-bold mb-2">
          <span>Alokasi Anggaran</span>
          <span className="tabular-nums text-[#6B7280]">
            {needsPct}% / {wantsPct}% / {savingsPct}%
          </span>
        </div>

        {/* Flat Colored Segmented Bar */}
        <div className="w-full h-3 rounded-full overflow-hidden flex mb-4 bg-gray-100">
          <div
            style={{ width: `${needsPct}%` }}
            className="bg-[#3FB876] transition-all duration-300"
            title="Needs"
          />
          <div
            style={{ width: `${wantsPct}%` }}
            className="bg-[#FFB020] transition-all duration-300"
            title="Wants"
          />
          <div
            style={{ width: `${savingsPct}%` }}
            className="bg-[#6C5CE7] transition-all duration-300"
            title="Savings"
          />
        </div>

        {/* 3 Colored Breakdown Cards (Green, Amber, Purple) */}
        <div className="space-y-2.5">
          {/* Needs (Green #3FB876) */}
          <div className="p-3.5 rounded-2xl bg-[#3FB876]/10 border border-[#3FB876]/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#3FB876] text-white flex items-center justify-center">
                <Home className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1A1A2E]">Needs · Pokok ({needsPct}%)</h4>
                <p className="text-[10px] text-[#6B7280]">Kost, makan harian, transportasi, paket data</p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#3FB876] tabular-nums">
              {formatIDR(needsAmount)}
            </span>
          </div>

          {/* Wants (Amber #FFB020) */}
          <div className="p-3.5 rounded-2xl bg-[#FFB020]/10 border border-[#FFB020]/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FFB020] text-[#1A1A2E] flex items-center justify-center">
                <Coffee className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1A1A2E]">Wants · Keinginan ({wantsPct}%)</h4>
                <p className="text-[10px] text-[#6B7280]">Nongkrong kafe, hobi, langganan hiburan</p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#FFB020] tabular-nums">
              {formatIDR(wantsAmount)}
            </span>
          </div>

          {/* Savings (Purple #6C5CE7) */}
          <div className="p-3.5 rounded-2xl bg-[#6C5CE7]/10 border border-[#6C5CE7]/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#6C5CE7] text-white flex items-center justify-center">
                <PiggyBank className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1A1A2E]">Savings · Tabungan ({savingsPct}%)</h4>
                <p className="text-[10px] text-[#6B7280]">Dana darurat, investasi, kursus berbayar</p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#6C5CE7] tabular-nums">
              {formatIDR(savingsAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Emergency Fund Guidance & Tracker (3-6 Months) */}
      <div className="bg-white p-5 rounded-3xl border border-black/[0.05] shadow-xs mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#6C5CE7]" />
            <h3 className="text-xs font-bold text-[#1A1A2E]">Target Dana Darurat (3–6 Bulan)</h3>
          </div>
          <span className="text-xs font-bold text-[#6C5CE7] tabular-nums">{emergencyPct}%</span>
        </div>

        <p className="text-[11px] text-[#6B7280] mb-3 leading-relaxed">
          Fondasi ketenangan pikiran agar kamu tidak terburu-buru menerima pekerjaan yang tidak cocok hanya karena tekanan finansial mendadak.
        </p>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-[#F5F5F9] rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-[#6C5CE7] rounded-full transition-all duration-300"
            style={{ width: `${emergencyPct}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs mb-4">
          <span className="text-[#6B7280]">Terkumpul: <b className="text-[#1A1A2E]">{formatIDR(emergencyCurrent)}</b></span>
          <span className="text-[#6B7280]">Target: <b className="text-[#6C5CE7]">{formatIDR(emergencyTargetTotal)}</b></span>
        </div>

        {/* Interactive Update inputs */}
        <div className="pt-2 border-t border-black/[0.05] flex items-center gap-2">
          <input
            type="number"
            step="100000"
            value={emergencyCurrent}
            onChange={(e) => setEmergencyCurrent(Math.max(0, parseInt(e.target.value, 10) || 0))}
            className="flex-1 px-3 py-2 bg-[#F5F5F9] rounded-xl text-xs font-bold text-[#1A1A2E] focus:outline-none"
            placeholder="Perbarui saldo darurat..."
          />
          <button
            type="button"
            onClick={handleApplyChanges}
            className="px-4 py-2 bg-[#6C5CE7] text-white rounded-xl text-xs font-bold hover:bg-[#5b4bc7]"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};
