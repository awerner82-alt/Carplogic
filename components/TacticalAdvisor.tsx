
import React, { useState, useRef } from 'react';
import { TacticalAdvice, WeatherData } from '../types';
import { getFishingAdvice } from '../services/geminiService';
import { Sparkles, Loader2, MapPin, Fish, Anchor, BrainCircuit, ChevronRight, Camera, Image as ImageIcon, X } from 'lucide-react';

interface TacticalAdvisorProps {
  weather: WeatherData;
}

const TacticalAdvisor: React.FC<TacticalAdvisorProps> = ({ weather }) => {
  const [advice, setAdvice] = useState<TacticalAdvice | null>(null);
  const [loading, setLoading] = useState(false);
  const [waterType, setWaterType] = useState('Baggersee');
  const [season, setSeason] = useState('Frühling');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const base64 = imagePreview?.split(',')[1];
      const data = await getFishingAdvice(weather, waterType, season, base64);
      setAdvice(data);
    } catch (err) {
      alert("Fehler bei der Analyse.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <BrainCircuit className="text-blue-500" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tighter">KI-Advisor</h2>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Analyse & Swim-Scan</p>
            </div>
          </div>
          
          <div className="space-y-4 mb-6">
            {/* Swim Scan Area */}
            <div 
              onClick={() => !imagePreview && fileInputRef.current?.click()}
              className={`relative h-48 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden ${imagePreview ? 'border-blue-500' : 'border-slate-800 bg-black/40 hover:bg-slate-800/40'}`}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} className="w-full h-full object-cover" alt="Swim" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); setImagePreview(null); }}
                    className="absolute top-3 right-3 w-8 h-8 bg-black/80 rounded-full flex items-center justify-center text-white"
                  >
                    <X size={16} />
                  </button>
                  <div className="absolute bottom-3 left-3 bg-blue-600 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-white shadow-lg">
                    Foto bereit zur Analyse
                  </div>
                </>
              ) : (
                <>
                  <Camera className="text-slate-600 mb-2" size={32} />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Swim-Scan: Foto hochladen</p>
                  <p className="text-[8px] text-slate-600 mt-1">KI analysiert Strukturen im Wasser</p>
                </>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>

            <div className="grid grid-cols-2 gap-3">
               <select 
                  value={waterType}
                  onChange={(e) => setWaterType(e.target.value)}
                  className="bg-black border border-slate-800 rounded-2xl p-4 text-[10px] font-black text-slate-200 uppercase tracking-widest"
                >
                  <option>Baggersee</option>
                  <option>Fluss</option>
                  <option>Kanal</option>
                  <option>Natursee</option>
                </select>
                <select 
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  className="bg-black border border-slate-800 rounded-2xl p-4 text-[10px] font-black text-slate-200 uppercase tracking-widest"
                >
                  <option>Frühling</option>
                  <option>Sommer</option>
                  <option>Herbst</option>
                  <option>Winter</option>
                </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 active:scale-95 disabled:opacity-50 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl transition-all shadow-[0_10px_30px_rgba(37,99,235,0.3)] flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
            {loading ? "KI analysiert..." : "Swim-Check starten"}
          </button>
        </div>
      </div>

      {advice && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-4">
          <div className="bg-slate-900 border border-indigo-500/20 p-6 rounded-[2.5rem] shadow-2xl">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-black text-blue-400 tracking-tighter uppercase">{advice.strategyName}</h3>
               <div className="bg-indigo-500/10 px-3 py-1 rounded-full text-[10px] font-black text-indigo-400">SCORE: {advice.activityScore}%</div>
            </div>
            
            <div className="bg-blue-500/5 border-l-2 border-blue-500 p-4 mb-6">
              <p className="text-slate-300 text-[11px] italic leading-relaxed">"{advice.reasoning}"</p>
            </div>
            
            <div className="grid gap-3">
              {[
                { label: 'Köder', icon: Fish, text: advice.baitAdvice, color: 'text-emerald-400' },
                { label: 'Montage', icon: Anchor, text: advice.rigAdvice, color: 'text-orange-400' },
                { label: 'Spots', icon: MapPin, text: advice.spotAdvice, color: 'text-cyan-400' }
              ].map((item, idx) => (
                <div key={idx} className="bg-black p-4 rounded-2xl border border-slate-800">
                  <div className={`flex items-center gap-2 mb-2 ${item.color}`}>
                    <item.icon size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TacticalAdvisor;
