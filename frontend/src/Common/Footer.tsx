import React from 'react';
import { FiGithub, FiTwitter, FiLinkedin, FiMail } from 'react-icons/fi';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="poppins-regular bg-[#F3EFE6] pt-16 pb-8 border-t border-[#DCD5C4]" >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-12">

          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-[#101826] rounded flex items-center justify-center text-[#E7A33E] font-bold text-lg" style={{ fontFamily: 'Fraunces, serif' }}>
                G
              </div>
              <span className="text-lg font-semibold text-[#101826] tracking-tight" >
                Genesys <span className="text-[#E7A33E] italic">HRM</span>
              </span>
            </div>
            <p className="text-[#5C5548] text-sm leading-relaxed max-w-sm mb-6">
              One ledger for payroll, attendance, and onboarding — built for teams that outgrew spreadsheets.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-[#8A8272] hover:text-[#E7A33E] transition-colors"><FiTwitter className="w-5 h-5" /></a>
              <a href="#" className="text-[#8A8272] hover:text-[#E7A33E] transition-colors"><FiLinkedin className="w-5 h-5" /></a>
              <a href="#" className="text-[#8A8272] hover:text-[#E7A33E] transition-colors"><FiGithub className="w-5 h-5" /></a>
              <a href="#" className="text-[#8A8272] hover:text-[#E7A33E] transition-colors"><FiMail className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h3 className="text-[#101826] font-semibold mb-4 uppercase text-xs tracking-widest">Product</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-[#5C5548] hover:text-[#E7A33E] text-sm transition-colors">Features</a></li>
              <li><a href="#" className="text-[#5C5548] hover:text-[#E7A33E] text-sm transition-colors">Integrations</a></li>
              <li><a href="#" className="text-[#5C5548] hover:text-[#E7A33E] text-sm transition-colors">Pricing</a></li>
              <li><a href="#" className="text-[#5C5548] hover:text-[#E7A33E] text-sm transition-colors">Changelog</a></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h3 className="text-[#101826] font-semibold mb-4 uppercase text-xs tracking-widest">Company</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-[#5C5548] hover:text-[#E7A33E] text-sm transition-colors">About us</a></li>
              <li><a href="#" className="text-[#5C5548] hover:text-[#E7A33E] text-sm transition-colors">Careers</a></li>
              <li><a href="#" className="text-[#5C5548] hover:text-[#E7A33E] text-sm transition-colors">Blog</a></li>
              <li><a href="#" className="text-[#5C5548] hover:text-[#E7A33E] text-sm transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Links Column 3 */}
          <div>
            <h3 className="text-[#101826] font-semibold mb-4 uppercase text-xs tracking-widest">Legal</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-[#5C5548] hover:text-[#E7A33E] text-sm transition-colors">Privacy policy</a></li>
              <li><a href="#" className="text-[#5C5548] hover:text-[#E7A33E] text-sm transition-colors">Terms of service</a></li>
              <li><a href="#" className="text-[#5C5548] hover:text-[#E7A33E] text-sm transition-colors">Cookie policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#DCD5C4] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#8A8272] text-sm">
            &copy; {currentYear} Genesys HRM. All rights reserved. Powered by <a href="https://www.genesysltd.com" className="text-[#7FA88F] hover:text-[#E7A33E] transition-colors font-medium">Genesys</a>.
          </p>
          <div className="flex items-center gap-2 text-sm text-[#8A8272]">
            <span>Built for teams who show up <span className="text-[#7FA88F] font-medium">on time</span>.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;