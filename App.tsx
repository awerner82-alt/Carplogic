
import React, { useState, useEffect } from 'react';
import { NavigationTab, WeatherData } from './types';
import Dashboard from './components/Dashboard';
import TacticalAdvisor from './components/TacticalAdvisor';
import CatchLog from './components/CatchLog';
import SettingsModal from './components/SettingsModal';
import { LayoutDashboard, Brain, BookOpen, Settings, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>(NavigationTab.DASHBOARD);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>('Standort...');
  const [citySearch, setCitySearch] = useState<string>('');
  
  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [userName, setUserName] = useState<string>('Angler');

  const [weather, setWeather] = useState<WeatherData>({
    temp: 0,
    apparentTemp: 0,
    pressure: 0,
    windSpeed: 0,
    windGusts: 0,
    windDirection: 0,
    windDirectionStr: 'N/A',
    condition: 'Lädt...',
    humidity: 0,
    precipProb: 0,
    cloudCover: 0,
    moonPhase: 'Berechne...',
    moonIllumination: 0,
    sunrise: '--:--',
    sunset: '--:--',
    next2hRain: 0,
    next2hRainAmount: 0,
    next2hWind: 0
  });

  const [pressureTrend, setPressureTrend] = useState<{ time: string; value: number; isFuture: boolean; isNow: boolean }[]>([]);
  const [tempTrend, setTempTrend] = useState<{ time: string; value: number; isFuture: boolean; isNow: boolean }[]>([]);

  const calculateMoonPhase = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    let jd = 0;
    if (month < 3) {
      const y = year - 1;
      const m = month + 12;
      jd = Math.floor(365.25 * y) + Math.floor(30.6001 * (m + 1)) + day + 1720995;
    } else {
      jd = Math.floor(365.25 * year) + Math.floor(30.6001 * (month + 1)) + day + 1720995;
    }
    const cycle = 29.53058867;
    const daysSinceNew = (jd - 2451550.1) % cycle;
    const phaseIndex = daysSinceNew / cycle;
    let phaseName = "";
    if (phaseIndex < 0.03 || phaseIndex > 0.97) phaseName = "Neumond";
    else if (phaseIndex < 0.22) phaseName = "Zun. Sichel";
    else if (phaseIndex < 0.28) phaseName = "1. Viertel";
    else if (phaseIndex < 0.47) phaseName = "Zun. Mond";
    else if (phaseIndex < 0.53) phaseName = "Vollmond";
    else if (phaseIndex < 0.72) phaseName = "Abn. Mond";
    else if (phaseIndex < 0.78) phaseName = "Letztes Viertel";
    else phaseName = "Abn. Sichel";
    const illumination = Math.round((1 - Math.cos(2 * Math.PI * phaseIndex)) / 2 * 100);
    return { phaseName, illumination };
  };

  const getWeatherCodeDescription = (code: number): string => {
    const codes: Record<number, string> = {
      0: 'Klar', 1: 'Überw. klar', 2: 'Wolkig', 3: 'Bedeckt',
      45: 'Nebel', 48: 'Raureif', 51: 'Sprühregen', 61: 'Leichtr. Regen',
      63: 'Regen', 65: 'Starker Regen', 71: 'Schnee', 80: 'Schauer', 95: 'Gewitter',
    };
    return codes[code] || 'Unbekannt';
  };

  const getWindDirectionStr = (degree: number): string => {
    const directions = ['N', 'NO', 'O', 'SO', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(degree / 45) % 8];
  };

  const fetchWeatherData = async (lat: number, lon: number, name?: string) => {
    try {
      setLoading(true);
      setError(null);
      // Added 'precipitation' to hourly to calculate amount in mm
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,precipitation_probability,cloud_cover&hourly=temperature_2m,pressure_msl,precipitation_probability,precipitation,wind_speed_10m&daily=sunrise,sunset&past_days=1&forecast_days=2&timezone=auto`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.current) {
        const { phaseName, illumination } = calculateMoonPhase(new Date());
        
        // Find current hour index reliably
        const nowMs = new Date().getTime();
        const hourlyTimes = data.hourly.time;
        let minDiff = Infinity;
        let nowIdx = -1;
        
        // Iterate to find the closest time slot to now
        hourlyTimes.forEach((t: string, i: number) => {
            const timeMs = new Date(t).getTime();
            const diff = Math.abs(nowMs - timeMs);
            if (diff < minDiff) {
                minDiff = diff;
                nowIdx = i;
            }
        });

        // Fallback for next 2h calc if nowIdx is found, else assume start of array if data is fresh
        const effectiveNowIdx = nowIdx !== -1 ? nowIdx : 0;
        
        let next2hRainProb = data.current.precipitation_probability;
        let next2hRainAmount = 0;
        let next2hWind = data.current.wind_speed_10m;

        if (effectiveNowIdx + 2 < hourlyTimes.length) {
            // Get slices for current hour + next 2 hours
            const nextRainProb = data.hourly.precipitation_probability.slice(effectiveNowIdx, effectiveNowIdx + 3);
            const nextRainAmt = data.hourly.precipitation.slice(effectiveNowIdx, effectiveNowIdx + 3);
            const nextWind = data.hourly.wind_speed_10m.slice(effectiveNowIdx, effectiveNowIdx + 3);
            
            next2hRainProb = Math.max(...nextRainProb); // Max probability
            // Sum of precipitation amount (mm)
            next2hRainAmount = nextRainAmt.reduce((acc: number, curr: number) => acc + curr, 0); 
            next2hWind = Math.max(...nextWind); // Max wind
        }

        const formatTime = (isoString: string) => {
            return new Date(isoString).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
        };

        setWeather({
          temp: Math.round(data.current.temperature_2m),
          apparentTemp: Math.round(data.current.apparent_temperature),
          pressure: Math.round(data.current.pressure_msl),
          windSpeed: Math.round(data.current.wind_speed_10m),
          windGusts: Math.round(data.current.wind_gusts_10m),
          windDirection: data.current.wind_direction_10m,
          windDirectionStr: getWindDirectionStr(data.current.wind_direction_10m),
          condition: getWeatherCodeDescription(data.current.weather_code),
          humidity: data.current.relative_humidity_2m,
          precipProb: data.current.precipitation_probability,
          cloudCover: data.current.cloud_cover,
          moonPhase: phaseName,
          moonIllumination: illumination,
          sunrise: formatTime(data.daily.sunrise[0]),
          sunset: formatTime(data.daily.sunset[0]),
          next2hRain: next2hRainProb,
          next2hRainAmount: parseFloat(next2hRainAmount.toFixed(1)), // Keep 1 decimal
          next2hWind: Math.round(next2hWind)
        });

        // Graph Data Processing
        const hourlyPressures = data.hourly.pressure_msl;
        const hourlyTemps = data.hourly.temperature_2m;
        
        if (nowIdx !== -1) {
          const startIdx = Math.max(0, nowIdx - 12);
          const endIdx = Math.min(hourlyTimes.length, nowIdx + 24);
          const pTrend = [];
          const tTrend = [];
          for (let i = startIdx; i < endIdx; i++) {
            const date = new Date(hourlyTimes[i]);
            const timeStr = date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
            pTrend.push({ time: timeStr, value: Math.round(hourlyPressures[i]), isFuture: i > nowIdx, isNow: i === nowIdx });
            tTrend.push({ time: timeStr, value: Math.round(hourlyTemps[i]), isFuture: i > nowIdx, isNow: i === nowIdx });
          }
          setPressureTrend(pTrend);
          setTempTrend(tTrend);
        }
      }
      if (name) setLocationName(name); else setLocationName(`${lat.toFixed(1)}, ${lon.toFixed(1)}`);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Wetterdaten nicht verfügbar");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeatherData(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeatherData(48.1, 11.6, "München")
      );
    } else {
      fetchWeatherData(48.1, 11.6, "München");
    }
  }, []);

  const renderContent = () => {
    if (loading && activeTab === NavigationTab.DASHBOARD && !weather.pressure) {
      return (
        <div className="flex flex-col items-center justify-center py-40 text-blue-500">
          <Loader2 className="animate-spin mb-4" size={48} />
          <p className="text-xs font-bold tracking-widest uppercase">Lade High-Res Wettermodell...</p>
        </div>
      );
    }
    switch (activeTab) {
      case NavigationTab.DASHBOARD: return <Dashboard weather={weather} pressureTrend={pressureTrend} tempTrend={tempTrend} locationName={locationName} onSearch={(e) => { e.preventDefault(); fetchWeatherData(48.1, 11.6, citySearch); }} citySearch={citySearch} setCitySearch={setCitySearch} userName={userName} />;
      case NavigationTab.ADVISOR: return <TacticalAdvisor weather={weather} />;
      case NavigationTab.LOGBOOK: return <CatchLog />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Dynamic App Bar */}
      <header className="px-6 pt-12 pb-4 flex justify-between items-end sticky top-0 bg-black/80 backdrop-blur-2xl z-40 border-b border-white/5">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-white">CarpLogic<span className="text-blue-500">AI</span></h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">High-Res Carp Intelligence</p>
        </div>
        <button 
          onClick={() => setShowSettings(true)}
          className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800 active:scale-95 transition-transform hover:bg-slate-800"
        >
          <Settings size={20} className="text-slate-400" />
        </button>
      </header>

      <main className="flex-1 px-5 overflow-y-auto scrollbar-hide">
        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-bold text-center uppercase tracking-widest">{error}</div>}
        {renderContent()}
      </main>

      {/* Modern Tab Bar - Floating Style */}
      <nav className="fixed bottom-6 left-6 right-6 h-18 bg-slate-900/90 backdrop-blur-2xl rounded-[2rem] border border-white/5 flex items-center justify-around px-4 shadow-2xl z-50">
        {[
          { tab: NavigationTab.DASHBOARD, icon: LayoutDashboard, label: 'Status' },
          { tab: NavigationTab.ADVISOR, icon: Brain, label: 'Advisor' },
          { tab: NavigationTab.LOGBOOK, icon: BookOpen, label: 'Journal' }
        ].map((item) => (
          <button 
            key={item.tab}
            onClick={() => setActiveTab(item.tab)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === item.tab ? 'text-blue-500 scale-110' : 'text-slate-500 hover:text-slate-400'}`}
          >
            <item.icon size={activeTab === item.tab ? 24 : 22} strokeWidth={activeTab === item.tab ? 2.5 : 2} />
            <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
      </nav>
      {/* Bottom Padding for Floating Nav */}
      <div className="h-28"></div>
      
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        userName={userName}
        setUserName={setUserName}
      />
    </div>
  );
};

export default App;
