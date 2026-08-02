import React from 'react';
import { FiCheckCircle, FiClock, FiUsers } from 'react-icons/fi';

const Hero: React.FC = () => {
  return (
    <section className="relative bg-[#101826] pt-20 pb-24 lg:pt-28 lg:pb-36 overflow-hidden font-sans">
      {/* Google Fonts — add to index.html <head>:
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500..700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      */}

      {/* Organic accent shape — not a blurred circle */}
      <div
        className="absolute -top-24 -right-24 w-[420px] h-[420px] bg-[#7FA88F] opacity-[0.15]"
        style={{ clipPath: 'polygon(30% 0%, 100% 15%, 85% 90%, 10% 100%, 0% 40%)' }}
      />
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'radial-gradient(circle, #F3EFE6 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-16 lg:gap-8 items-center">

          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2.5 mb-7">
              <span className="w-8 h-px bg-[#E7A33E]" />
              <span className="text-[#E7A33E] font-semibold text-xs tracking-[0.2em] uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                Genesys HRM
              </span>
            </div>

            <h1
              className="text-[#F3EFE6] font-medium leading-[1.05] mb-7"
              style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(2.75rem, 5.5vw, 4.5rem)' }}
            >
              Every clock-in,
              <br />
              <span className="italic text-[#E7A33E]">every payslip,</span>
              <br />
              on record.
            </h1>

            <p className="text-[#B8C0CC] text-lg mb-10 max-w-md leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              Payroll runs itself. Attendance logs itself. Onboarding stops living in spreadsheets. One ledger, your whole team.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 max-w-md mb-8">
              <input
                type="email"
                placeholder="you@company.com"
                className="flex-1 px-5 py-3.5 bg-[#182437] border border-[#2A3850] rounded text-[#F3EFE6] placeholder-[#6B7688] focus:outline-none focus:border-[#E7A33E] transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
              <button
                className="bg-[#E7A33E] hover:bg-[#F3EFE6] text-[#101826] px-7 py-3.5 rounded font-semibold transition-colors whitespace-nowrap"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Start free trial
              </button>
            </div>

            <p className="text-sm text-[#6B7688] flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              <FiCheckCircle className="text-[#7FA88F] shrink-0" /> 14 days, no card. Cancel any time.
            </p>
          </div>

          {/* Right — Attendance card stack (signature element) */}
          <div className="relative mt-4 lg:mt-0 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm h-[420px]">

              {/* Back card */}
              <div className="absolute top-6 left-6 w-full h-64 bg-[#182437] border border-[#2A3850] rounded-lg rotate-[-6deg]" />

              {/* Middle card */}
              <div className="absolute top-14 left-2 w-full h-64 bg-[#1E2C42] border border-[#2A3850] rounded-lg rotate-[3deg] p-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-[#7FA88F]/20 flex items-center justify-center text-[#7FA88F]">
                    <FiUsers size={16} />
                  </div>
                  <div>
                    <p className="text-[#F3EFE6] text-sm font-semibold">Design Team</p>
                    <p className="text-[#6B7688] text-xs">12 clocked in</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-2 bg-[#2A3850] rounded-full" style={{ width: `${100 - i * 15}%` }} />
                  ))}
                </div>
              </div>

              {/* Front card — the "stamped" timesheet */}
              <div className="absolute top-24 left-8 w-full max-w-[280px] h-56 bg-[#F3EFE6] rounded-lg shadow-2xl p-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                <p className="text-[#6B7688] text-xs tracking-widest uppercase mb-1">Timesheet · Aug 02</p>
                <p className="text-[#101826] text-2xl font-bold mb-4" style={{ fontFamily: 'Fraunces, serif' }}>8h 42m</p>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {['#E7A33E', '#7FA88F', '#101826'].map((c, i) => (
                      <div key={i} className="w-7 h-7 rounded-full border-2 border-[#F3EFE6]" style={{ background: c }} />
                    ))}
                  </div>
                  {/* Punch stamp */}
                  <div className="w-14 h-14 rounded-full border-2 border-[#E7A33E] flex items-center justify-center rotate-[-12deg]">
                    <FiClock className="text-[#E7A33E]" size={20} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust strip — no logos, real HR framing */}
        <div className="mt-20 pt-8 border-t border-[#2A3850] flex flex-wrap items-center gap-x-10 gap-y-3" style={{ fontFamily: 'Inter, sans-serif' }}>
          <p className="text-[#6B7688] text-sm">Trusted for payroll across</p>
          {['500+ teams', '18 countries', '40,000 payslips/mo'].map((t) => (
            <span key={t} className="text-[#B8C0CC] text-sm font-medium">{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;