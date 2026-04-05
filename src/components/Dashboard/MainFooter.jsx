import React from 'react';
import { Shield, Globe, BookOpen, ExternalLink, MapPin, Mail, Phone } from 'lucide-react';

const MainFooter = () => {
  return (
    <footer className="mt-auto border-t-[3px] border-academic-blue bg-white pt-12 pb-6 px-4 lg:px-8 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        
        {/* Institutional Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/b/b3/Shivaji_University_logo.png" 
              alt="SUK Logo" 
              className="h-12 w-auto grayscale contrast-125"
            />
            <div className="border-l border-slate-200 pl-3">
              <h4 className="text-xs font-black text-academic-blue uppercase tracking-tighter leading-tight">
                Centre for Climate Change & <br /> Sustainability Studies
              </h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                Shivaji University, Kolhapur
              </p>
            </div>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
            A premier research centre dedicated to hydrological modelling, climate impact assessment, 
            and disaster resilience in the Panchganga River Basin.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-black text-academic-blue uppercase tracking-widest mb-5 flex items-center gap-2">
            <Globe className="w-3.5 h-3.5" /> Official Resources
          </h4>
          <ul className="space-y-3">
            {[
              { label: 'IMD Pune (AWS Local)', url: 'http://www.imdpune.gov.in/' },
              { label: 'CWC Flood Forecast',   url: 'https://ffs.india-water.gov.in/' },
              { label: 'WRD Maharashtra',      url: 'https://wrd.maharashtra.gov.in/' },
              { label: 'District Disaster Mgmt', url: 'https://kolhapur.gov.in/en/disaster-management/' },
            ].map((link) => (
              <li key={link.label}>
                <a 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between text-[11px] font-bold text-slate-500 hover:text-academic-blue transition-colors"
                >
                  {link.label}
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Technical Info */}
        <div>
          <h4 className="text-xs font-black text-academic-blue uppercase tracking-widest mb-5 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" /> Project Governance
          </h4>
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sponsored By</p>
              <p className="text-[11px] font-black text-slate-700">DST-SERB, Govt. of India</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Principal Investigator</p>
              <p className="text-[11px] font-black text-slate-700">Prof. (Dr.) S. S. Panhalkar</p>
            </div>
          </div>
        </div>

        {/* Contact & Visitor */}
        <div className="flex flex-col items-start lg:items-end">
          <h4 className="text-xs font-black text-academic-blue uppercase tracking-widest mb-5 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" /> Reach Us
          </h4>
          <div className="text-right space-y-2 mb-6">
            <p className="text-[11px] font-bold text-slate-700">CCCSS, Main Building,</p>
            <p className="text-[11px] font-bold text-slate-700">Shivaji University, Kolhapur 416004</p>
            <div className="flex items-center justify-end gap-2 text-academic-blue">
              <Mail className="w-3 h-3" />
              <a href="mailto:cccss.suk@gmail.com" className="text-[11px] font-bold hover:underline">cccss@unishivaji.ac.in</a>
            </div>
          </div>
          
          {/* Visitor Counter */}
          <div className="mt-auto border-t border-slate-100 pt-4 w-full flex justify-end">
            <div className="bg-slate-900 px-4 py-2 rounded-lg flex items-center gap-3 shadow-lg">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Total Visitors</span>
                <span className="text-[10px] font-bold text-white font-mono tracking-widest uppercase">Analytics Enabled</span>
              </div>
              <img 
                src="https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fsatwikcccss-crypto.github.io%2FPanchgangaRaingauge&count_bg=%231e3a8a&title_bg=%230f172a&icon=&icon_color=%23E7E7E7&title=hits&edge_flat=false" 
                alt="Visitor Counter"
                className="h-5"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-[1600px] mx-auto mt-12 pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest order-2 md:order-1">
          © {new Date().getFullYear()} CCCSS, Shivaji University, Kolhapur. All Rights Reserved.
        </p>
        <div className="flex items-center gap-6 order-1 md:order-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Secure</span>
          </div>
          <p className="text-[10px] font-black text-academic-blue uppercase tracking-widest">
            Developed by: Er. Satwik K. Udupi
          </p>
        </div>
      </div>
    </footer>
  );
};

export default MainFooter;
