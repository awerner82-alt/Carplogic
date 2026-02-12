
import React, { useState } from 'react';
import { CatchRecord } from '../types';
import { Camera, Plus, Calendar, Scale, MapPin, X } from 'lucide-react';

const CatchLog: React.FC = () => {
  const [catches, setCatches] = useState<CatchRecord[]>([
    {
      id: '1',
      date: '15. Nov 2023',
      weight: 18.5,
      species: 'Spiegelkarpfen',
      location: 'Waldsee - Spot 3',
      bait: 'Scopex Squid 20mm',
      image: 'https://images.unsplash.com/photo-1599304381380-4927ec044439?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: '2',
      date: '10. Nov 2023',
      weight: 14.2,
      species: 'Schuppenkarpfen',
      location: 'Fluss Main - KM 34',
      bait: 'Tiger Nuss',
      image: 'https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?auto=format&fit=crop&q=80&w=800'
    }
  ]);

  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tighter">Dein Journal</h2>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Alle Erfolge auf einen Blick</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="w-12 h-12 bg-blue-600 rounded-2xl text-white active:scale-90 transition-transform shadow-[0_4px_15px_rgba(37,99,235,0.4)] flex items-center justify-center"
        >
          <Plus size={28} />
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {catches.map(c => (
          <div key={c.id} className="bg-slate-900 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-500">
            {/* Bild oben (Volle Breite, 16:9) */}
            <div className="h-56 relative">
              <img src={c.image} alt={c.species} className="w-full h-full object-cover" />
              <div className="absolute top-4 right-4 bg-blue-600 px-3 py-1 rounded-full text-[10px] font-black shadow-xl">
                {c.weight} KG
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-900 to-transparent"></div>
              <div className="absolute bottom-4 left-6">
                 <h3 className="font-black text-xl text-white uppercase tracking-tighter">{c.species}</h3>
              </div>
            </div>

            <div className="p-6 pt-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Datum</div>
                   <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                    <Calendar size={12} className="text-blue-500" /> {c.date}
                  </div>
                </div>
                <div className="space-y-1">
                   <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Spot</div>
                   <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                    <MapPin size={12} className="text-red-500" /> {c.location}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-7 h-7 bg-slate-800 rounded-lg flex items-center justify-center">
                    <Camera size={14} className="text-blue-400" />
                   </div>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{c.bait}</span>
                </div>
                <button className="text-[10px] font-black text-blue-500 uppercase tracking-widest px-3 py-1 bg-blue-500/5 rounded-lg active:bg-blue-500/20">Details</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-end justify-center animate-in fade-in duration-300">
          <div className="bg-slate-900 w-full max-w-lg p-8 rounded-t-[3rem] border-t border-slate-800 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black uppercase tracking-tighter">Neuer Fang</h3>
              <button onClick={() => setShowAdd(false)} className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              <div className="h-44 bg-black rounded-[2rem] border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-600 active:bg-slate-800 transition-colors">
                <Camera size={40} className="mb-3" />
                <p className="text-[10px] font-black uppercase tracking-widest">Foto aufnehmen</p>
              </div>
              
              <div className="space-y-4">
                <input type="text" placeholder="FISCHART (Z.B. SPIEGELKARPFEN)" className="w-full bg-black border border-slate-800 rounded-2xl p-4 text-xs font-bold focus:border-blue-500 outline-none" />
                
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" placeholder="GEWICHT (KG)" className="w-full bg-black border border-slate-800 rounded-2xl p-4 text-xs font-bold focus:border-blue-500 outline-none" />
                  <input type="text" placeholder="DATUM" className="w-full bg-black border border-slate-800 rounded-2xl p-4 text-xs font-bold focus:border-blue-500 outline-none" />
                </div>
              </div>

              <button 
                onClick={() => setShowAdd(false)}
                className="w-full py-5 mt-4 bg-blue-600 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl active:scale-95 transition-all"
              >
                Fang speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatchLog;
