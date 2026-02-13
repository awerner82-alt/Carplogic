import React, { useState } from 'react';
import { X, Save, User, Info } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  setUserName: (name: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, userName, setUserName }) => {
  const [tempName, setTempName] = useState(userName);

  if (!isOpen) return null;

  const handleSave = () => {
    setUserName(tempName);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-black uppercase tracking-tighter text-white">Einstellungen</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* User Profile */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-blue-400">
              <User size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Benutzerprofil</span>
            </div>
            <div className="bg-black p-4 rounded-2xl border border-slate-800">
              <label className="text-[9px] text-slate-500 font-bold uppercase block mb-2">Dein Name</label>
              <input 
                type="text" 
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Wie sollen wir dich nennen?"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-bold text-white focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* App Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-400">
              <Info size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Über CarpLogic AI</span>
            </div>
            <div className="bg-black p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-300">Version</span>
                <span className="text-xs font-mono text-slate-500">1.0.3 (Beta)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-300">Engine</span>
                <span className="text-xs font-mono text-blue-400">Gemini 3 Flash</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <button 
            onClick={handleSave}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all rounded-xl font-black uppercase tracking-widest text-xs text-white flex items-center justify-center gap-2 shadow-lg"
          >
            <Save size={16} />
            Speichern
          </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;