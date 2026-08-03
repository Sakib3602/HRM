import React from 'react';
import { FiArrowRight, FiCheckCircle, FiShield, FiTrendingUp } from 'react-icons/fi';

const Hero: React.FC = () => {
  return (
    <section className="poppins-regular relative bg-[#16161e] text-white pt-12 pb-16 overflow-hidden font-sans">
      
      {/* Background Glow Effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-62.5 bg-purple-600/20 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-purple-400 font-medium text-sm mb-6 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-purple-500 animate-pulse"></span>
            GENESYS HRM v2.0 is Live
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-4">
            Empowering Workforce, <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 via-indigo-300 to-blue-400">
              Driving Business Success
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-gray-400 mb-8 leading-relaxed max-w-2xl mx-auto">
            Automate payroll, track attendance, and manage your entire employee lifecycle seamlessly in one intelligent platform designed for modern enterprises.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
            <button className="flex items-center justify-center gap-2 bg-[#7148fc] hover:bg-[#5e38d6] text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-purple-900/30">
              Start Free Trial <FiArrowRight className="w-5 h-5" />
            </button>
            <button className="flex items-center justify-center bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-3 rounded-xl font-semibold transition-all backdrop-blur-md">
              Schedule a Demo
            </button>
          </div>

          {/* Feature Highlights */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-400 font-medium pt-4 border-t border-white/10">
            <span className="flex items-center gap-1.5"><FiCheckCircle className="text-purple-400" /> 14-day free trial</span>
            <span className="flex items-center gap-1.5"><FiShield className="text-purple-400" /> Enterprise-grade security</span>
            <span className="flex items-center gap-1.5"><FiTrendingUp className="text-purple-400" /> 99.9% Uptime SLA</span>
          </div>

        </div>

        {/* Dashboard Mockup Preview Box */}
        <div className="mt-10 relative max-w-5xl mx-auto">
          {/* Bottom Fade Gradient for blending */}
          <div className="absolute inset-0 bg-linear-to-t from-[#16161e] via-transparent to-transparent z-10 pointer-events-none"></div>
          
          {/* Mockup Frame */}
          <div className="bg-[#1e1e26] border border-white/10 rounded-2xl shadow-2xl p-2 sm:p-4 relative">
            {/* Image Container with rounded corners */}
            <div className="rounded-xl overflow-hidden border border-white/5 bg-[#16161e]">
              <img 
                src="https://unbounce.com/photos/AgencyAnalytics-custom-dashboard.png" 
                alt="GENESYS HRM Dashboard" 
                className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;