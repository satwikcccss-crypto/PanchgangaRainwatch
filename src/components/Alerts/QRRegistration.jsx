import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Bell, Phone } from 'lucide-react';
import { ALERT_FORM_URL, EMERGENCY_CONTACTS } from '../../config/imdThresholds';

const QRRegistration = () => (
  <div className="academic-panel p-4 mt-2">
    <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-3">
      <Bell className="w-4 h-4 text-academic-blue" />
      <h4 className="text-xs font-bold font-serif text-academic-blue uppercase tracking-widest">
        Rainfall Alerts Registration
      </h4>
    </div>

    <div className="flex gap-3 items-start mb-4">
      <div className="bg-white p-1 border border-slate-200 rounded-lg shadow-sm flex-shrink-0">
        <QRCodeSVG value={ALERT_FORM_URL} size={64} level="H" fgColor="#1e3a8a" />
      </div>
      <div>
        <p className="text-[10px] text-slate-600 leading-relaxed">
          Scan to register for <strong>IMD-classified rainfall alerts</strong> via SMS/WhatsApp for
          Panchganga Basin stations.
        </p>
        <a
          href={ALERT_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1.5 inline-block text-[9px] font-bold text-academic-blue underline uppercase tracking-widest"
        >
          Register Online →
        </a>
      </div>
    </div>

    {/* Emergency contacts */}
    <div>
      <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
        <Phone className="w-3 h-3" /> Emergency Hotlines
      </h5>
      <div className="space-y-1.5">
        {EMERGENCY_CONTACTS.map((c, i, arr) => (
          <div
            key={c.name}
            className={`flex justify-between items-center py-1.5 text-[10px] font-bold text-slate-700 ${
              i < arr.length - 1 ? 'border-b border-slate-100' : ''
            }`}
          >
            <span className="text-slate-600">{c.name}</span>
            <a
              href={`tel:${c.phone}`}
              className="text-academic-blue hover:underline font-mono"
            >
              {c.phone}
            </a>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default QRRegistration;
