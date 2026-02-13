
import React, { useState } from 'react';
import { Key, ChevronRight, ShieldCheck, ExternalLink } from 'lucide-react';

interface ApiKeyModalProps {
  onSave: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave }) => {
  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (inputKey.length < 30) {
      setError('Der Key scheint ungültig zu sein.');
      return;
    }
    localStorage.setItem('gemini_api_key', inputKey);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black z-[200] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-md space-y-8">
        
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.5)] mb-6">
            <Key size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter">CarpLogic<span className="text-blue-500">AI</span></h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Initial System Setup</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-2xl space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] text-blue-400 font-black uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={12} /> Google Gemini API Key
            </label>
            <input 
              type="password" 
              value={inputKey}
              onChange={(e) => { setInputKey(e.target.value); setError(''); }}
              placeholder="AIzaSy..."
              className="w-full bg-black border border-slate-700 rounded-xl p-4 text-sm font-mono text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-700"
            />
            {error && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wide">{error}</p>}
          </div>

          <button 
            onClick={handleSave}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition-all rounded-xl font-black uppercase tracking-widest text-xs text-white flex items-center justify-center gap-2 shadow-lg"
          >
            System aktivieren
            <ChevronRight size={14} />
          </button>

          <div className="pt-4 border-t border-slate-800 text-center">
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[9px] text-slate-500 hover:text-white font-bold uppercase tracking-widest transition-colors"
            >
              Kein Key? Hier kostenlos erstellen <ExternalLink size={10} />
            </a>
            <p className="mt-2 text-[9px] text-slate-600 leading-relaxed">
              Der Key wird ausschließlich lokal in deinem Browser gespeichert und direkt an Google gesendet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
