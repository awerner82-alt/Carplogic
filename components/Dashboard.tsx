
import React, { useState, useMemo } from 'react';
import { WeatherData } from '../types';
import { Thermometer, Gauge, MapPin, Search, Zap, ArrowUpRight, ArrowDownRight, Minus, Wind, CloudRain, Cloud, Sunrise, Sunset, Navigation, AlertCircle } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area } from 'recharts';

interface DashboardProps {
  weather: WeatherData;
  pressureTrend: { time: string; value: number; isFuture: boolean; isNow: boolean }[];
  tempTrend: { time: string; value: number; isFuture: boolean; isNow: boolean }[];
  locationName: string;
  citySearch: string;
  setCitySearch: (val: string) => void;
  onSearch: (e: React.FormEvent) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  weather, 
  pressureTrend, 
  tempTrend, 
  locationName, 
  citySearch, 
  setCitySearch, 
  onSearch 
}) => {
  const [graphMode, setGraphMode] = useState<'pressure' | 'temp'>('pressure');
  
  const nowPoint = pressureTrend.find(p => p.isNow)?.time;

  // Simple heuristic for initial activity score
  const calculateInitialScore = () => {
    let score = 50;
    if (weather.pressure > 1010 && weather.pressure < 1020) score += 20;
    if (weather.windSpeed > 10) score += 10;
    if (weather.moonPhase.includes("Voll") || weather.moonPhase.includes("Neu")) score += 15;
    if (weather.cloudCover > 50) score += 5; // Carp like overcast
    return Math.min(score, 95);
  };

  const activityScore = calculateInitialScore();

  // Berechne Statistiken für den aktiven Graphen
  const activeData = graphMode === 'pressure' ? pressureTrend : tempTrend;
  const stats = useMemo(() => {
    if (activeData.length === 0) return { min: 0, max: 0, trend: 'stable' };
    const values = activeData.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // Trend berechnen (Vergleich: Jetzt vs. vor 3 Stunden)
    const nowIdx = activeData.findIndex(d => d.isNow);
    const pastIdx = Math.max(0, nowIdx - 3);
    const current = activeData[nowIdx]?.value || 0;
    const past = activeData[pastIdx]?.value || 0;
    
    let trend: 'rising' | 'falling' | 'stable' = 'stable';
    if (current > past + (graphMode === 'pressure' ? 1 : 0.5)) trend = 'rising';
    else if (current < past - (graphMode === 'pressure' ? 1 : 0.5)) trend = 'falling';

    return { min, max, trend };
  }, [activeData, graphMode]);

  return (
    <div className="flex flex-col gap-4 pb-12">
      {/* Search Bar */}
      <div className="bg-slate-900/40 backdrop-blur-md p-3 rounded-2xl border border-slate-800 shadow-lg">
        <form onSubmit={onSearch} className="relative">
          <input 
            type="text" 
            placeholder="Gewässer suchen..." 
            value={citySearch}
            onChange={(e) => setCitySearch(e.target.value)}
            className="w-full bg-black/60 border border-slate-700/50 rounded-xl py-2.5 pl-10 pr-4 text-slate-100 placeholder:text-slate-500 focus:outline-none text-sm"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
             <MapPin size={10} className="text-blue-500" /> {locationName.split(',')[0]}
          </div>
        </form>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Activity Score Gauge */}
        <div className="col-span-2 bg-gradient-to-br from-indigo-950/40 to-black p-5 rounded-[2.5rem] border border-indigo-500/30 shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center relative z-10">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 mb-1">
                <Zap size={16} fill="currentColor" />
                <span className="text-[10px] font-black uppercase tracking-widest">Activity Score</span>
              </div>
              <div className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-400">
                {activityScore}%
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
               <div className="bg-indigo-500/10 px-4 py-2 rounded-2xl border border-indigo-500/20">
                  <div className="text-[9px] text-indigo-400 font-black uppercase text-right">Mond</div>
                  <div className="text-sm font-black text-white text-right">{weather.moonPhase}</div>
               </div>
            </div>
          </div>
          <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
             <div className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]" style={{ width: `${activityScore}%` }}></div>
          </div>
        </div>

        {/* --- NEW: Atmospherics Row --- */}
        
        {/* Wind Widget */}
        <div className="bg-slate-900/60 p-4 rounded-3xl border border-slate-800 flex flex-col justify-between relative overflow-hidden h-36">
           <div className="flex justify-between items-start z-10">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Wind size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">Wind</span>
              </div>
              <div className="text-[9px] font-bold text-slate-500">{weather.windDirectionStr}</div>
           </div>
           
           <div className="z-10 flex flex-col">
              <span className="text-3xl font-black tracking-tighter text-white">{weather.windSpeed}<span className="text-sm font-normal text-slate-500 ml-1">km/h</span></span>
              <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Böen: {weather.windGusts}</span>
           </div>

           {/* Compass Visual */}
           <div className="absolute right-[-10px] bottom-[-10px] w-20 h-20 rounded-full border-2 border-slate-800/50 flex items-center justify-center opacity-50">
              <Navigation 
                size={32} 
                className="text-blue-500 transition-transform duration-1000" 
                style={{ transform: `rotate(${weather.windDirection}deg)` }} 
                fill="currentColor"
              />
           </div>
        </div>

        {/* Sky Widget */}
        <div className="bg-slate-900/60 p-4 rounded-3xl border border-slate-800 flex flex-col justify-between h-36">
           <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              {weather.precipProb > 30 ? <CloudRain size={14} /> : <Cloud size={14} />}
              <span className="text-[9px] font-black uppercase tracking-widest">Himmel</span>
           </div>

           <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                 <div className="text-[9px] font-bold text-slate-500 uppercase">Regen</div>
                 <div className="text-sm font-black text-blue-400">{weather.precipProb}%</div>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                 <div className="text-[9px] font-bold text-slate-500 uppercase">Wolken</div>
                 <div className="text-sm font-black text-slate-300">{weather.cloudCover}%</div>
              </div>
               <div className="flex justify-between items-center">
                 <div className="text-[9px] font-bold text-slate-500 uppercase flex gap-1"><Sunrise size={10} /> / <Sunset size={10} /></div>
                 <div className="text-[9px] font-black text-slate-300">{weather.sunrise} • {weather.sunset}</div>
              </div>
           </div>
        </div>

        {/* Next 2 Hours Tactical Widget */}
        <div className="col-span-2 bg-gradient-to-r from-slate-900 to-slate-900/50 p-4 rounded-[2rem] border border-blue-900/30 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
               <AlertCircle size={20} />
             </div>
             <div>
               <div className="text-[9px] font-black uppercase tracking-widest text-blue-400">Next 2 Hours</div>
               <div className="text-xs font-bold text-slate-300">
                 {weather.next2hRain}% ({weather.next2hRainAmount} mm) • Wind max {weather.next2hWind} km/h
               </div>
             </div>
           </div>
           <div className="text-right">
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Lokal-Modell</div>
              <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Aktiv</div>
           </div>
        </div>

        {/* Real-time stats (Compact) */}
        <div className="bg-slate-900/60 p-4 rounded-3xl border border-slate-800 flex flex-col justify-between h-24">
          <div className="flex items-center gap-2 text-blue-400">
            <Thermometer size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">Temp</span>
          </div>
          <div>
            <div className="text-xl font-black tracking-tighter">{weather.temp}°</div>
            <div className="text-[9px] text-slate-500 font-bold uppercase">Gefühlt: {weather.apparentTemp}°</div>
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-3xl border border-slate-800 flex flex-col justify-between h-24">
          <div className="flex items-center gap-2 text-indigo-400">
            <Gauge size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">Druck (MSL)</span>
          </div>
          <div>
            <div className="text-xl font-black tracking-tighter">{weather.pressure}</div>
            <div className="text-[9px] text-indigo-400 font-bold uppercase">hPa • {stats.trend === 'stable' ? 'Stabil' : stats.trend}</div>
          </div>
        </div>
      </div>

      {/* PRO Trend Graph */}
      <div className="bg-black border border-slate-800 p-5 rounded-[2.5rem] shadow-2xl mt-2 relative overflow-hidden">
        {/* Toggle Header */}
        <div className="flex justify-between items-center mb-6 relative z-10">
          <div className="flex bg-slate-900/80 rounded-xl p-1 border border-slate-800">
            <button 
              onClick={() => setGraphMode('pressure')}
              className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${graphMode === 'pressure' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Barometer
            </button>
            <button 
              onClick={() => setGraphMode('temp')}
              className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${graphMode === 'temp' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Temp
            </button>
          </div>
          
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
            stats.trend === 'rising' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
            stats.trend === 'falling' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
            'bg-slate-800 border-slate-700 text-slate-400'
          }`}>
            {stats.trend === 'rising' && <><ArrowUpRight size={10} /> Steigend</>}
            {stats.trend === 'falling' && <><ArrowDownRight size={10} /> Fallend</>}
            {stats.trend === 'stable' && <><Minus size={10} /> Stabil</>}
          </div>
        </div>
        
        {/* Chart Area */}
        <div className="h-44 w-full -ml-4 relative z-10">
          <ResponsiveContainer width="110%" height="100%">
            <AreaChart data={activeData}>
              <defs>
                <linearGradient id="colorPressure" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                {/* Temp Gradients: Red (Warm) to Blue (Cold) */}
                <linearGradient id="fillTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.5}/> {/* Red-500 */}
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1}/> {/* Blue-500 */}
                </linearGradient>
                <linearGradient id="strokeTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.3} />
              <XAxis 
                dataKey="time" 
                stroke="#475569" 
                fontSize={8} 
                tickLine={false} 
                axisLine={false} 
                interval={5} 
              />
              <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px', color: '#fff' }}
                itemStyle={{ color: graphMode === 'pressure' ? '#818cf8' : '#ef4444' }}
                formatter={(value) => [value, graphMode === 'pressure' ? 'hPa' : '°C']}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={graphMode === 'pressure' ? '#6366f1' : 'url(#strokeTemp)'} 
                fill={graphMode === 'pressure' ? 'url(#colorPressure)' : 'url(#fillTemp)'} 
                strokeWidth={3}
                animationDuration={1500}
              />
              {nowPoint && (
                 <ReferenceLine 
                   x={nowPoint} 
                   stroke="#ffffff" 
                   strokeOpacity={0.8}
                   strokeWidth={2} 
                   strokeDasharray="4 4"
                   label={{ 
                     position: 'insideTop', 
                     value: 'JETZT', 
                     fill: '#ffffff', 
                     fontSize: 9, 
                     fontWeight: 'bold',
                     dy: -5,
                     dx: 15
                   }} 
                 />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Footer Stats */}
        <div className="flex justify-between items-center mt-2 px-1 relative z-10 border-t border-slate-800/50 pt-3">
           <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Min (36h)</span>
              <span className="text-sm font-black text-white">{stats.min} <span className="text-[9px] text-slate-500 font-normal">{graphMode === 'pressure' ? 'hPa' : '°C'}</span></span>
           </div>
           
           {/* Timeline Legend */}
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
                 <span className="text-[8px] text-slate-500 font-bold uppercase">Historie</span>
              </div>
              <div className="flex items-center gap-1.5">
                 <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${graphMode === 'pressure' ? 'bg-indigo-500' : 'bg-red-500'}`}></div>
                 <span className={`text-[8px] font-bold uppercase ${graphMode === 'pressure' ? 'text-indigo-400' : 'text-red-400'}`}>Prognose</span>
              </div>
           </div>

           <div className="flex flex-col text-right">
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Max (36h)</span>
              <span className="text-sm font-black text-white">{stats.max} <span className="text-[9px] text-slate-500 font-normal">{graphMode === 'pressure' ? 'hPa' : '°C'}</span></span>
           </div>
        </div>

        {/* Ambient Background Glow */}
        <div className={`absolute top-0 right-0 w-64 h-64 blur-[80px] rounded-full opacity-10 pointer-events-none transition-colors duration-1000 ${graphMode === 'pressure' ? 'bg-indigo-600' : 'bg-red-600'}`} style={{ transform: 'translate(30%, -30%)' }}></div>
      </div>
    </div>
  );
};

export default Dashboard;
