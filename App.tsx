
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Map as MapIcon, 
  Navigation, 
  Star, 
  User, 
  Search, 
  RefreshCw,
  TrendingUp,
  ChevronDown,
  X,
  Check
} from 'lucide-react';
import { ATM, ATMStatus, ViewMode, CIDADES_BENGUELA } from './types';
import { mockAtms } from './data/mockAtms';
import ATMCard from './components/ATMCard';

const BANCOS_POPULARES = ["BAI", "BFA", "BIC", "SOL", "ATLANTICO", "BPC", "KEVE", "ECONOMICO", "BNI"];

const createIcon = (status: ATMStatus, lastUpdated: number) => {
  const timeDiff = Date.now() - lastUpdated;
  const isOld = timeDiff > 4 * 3600000; // Mais de 4h
  
  let color = '#EAB308'; // Amarelo
  if (status === ATMStatus.CASH) color = '#22C55E';
  if (status === ATMStatus.NO_CASH) color = '#EF4444';
  if (status === ATMStatus.OUT_OF_SERVICE) color = '#71717A';
  
  // Opacidade reduzida se a informação for muito antiga
  const opacity = isOld ? '0.5' : '1';

  return new L.DivIcon({
    html: `<div style="background-color: ${color}; opacity: ${opacity}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 15px ${color}80;"></div>`,
    className: 'custom-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 14, { duration: 1.5 });
  }, [center, map]);
  return null;
};

const App: React.FC = () => {
  const [atms, setAtms] = useState<ATM[]>(() => {
    const saved = localStorage.getItem('angoatm_benguela_data');
    if (saved) return JSON.parse(saved);
    return mockAtms;
  });
  
  const [viewMode, setViewMode] = useState<ViewMode>('MAP');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('Todas');
  const [selectedAtm, setSelectedAtm] = useState<ATM | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-12.5783, 13.4055]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCitySelect, setShowCitySelect] = useState(false);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);

  // Monitorar posição do usuário em tempo real
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserCoords([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => console.warn("Erro ao obter GPS:", err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Persistência
  useEffect(() => {
    localStorage.setItem('angoatm_benguela_data', JSON.stringify(atms));
  }, [atms]);

  // Simulação de atualizações "Live"
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.9) {
        setAtms(prev => {
          const randomIndex = Math.floor(Math.random() * prev.length);
          const newAtms = [...prev];
          const atm = newAtms[randomIndex];
          
          if (atm.status !== ATMStatus.OUT_OF_SERVICE) {
            const statuses = [ATMStatus.CASH, ATMStatus.NO_CASH, ATMStatus.UNKNOWN];
            const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
            
            newAtms[randomIndex] = {
              ...atm,
              status: newStatus,
              lastUpdated: 'agora mesmo',
              lastUpdatedTimestamp: Date.now()
            };
          }
          return newAtms;
        });
      }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const filteredAtms = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return atms.filter(atm => {
      const matchesSearch = atm.bankName.toLowerCase().includes(query) ||
                          atm.neighborhood.toLowerCase().includes(query) ||
                          atm.city.toLowerCase().includes(query) ||
                          atm.address.toLowerCase().includes(query);
      const matchesCity = selectedCity === 'Todas' || atm.city === selectedCity;
      return matchesSearch && matchesCity;
    });
  }, [atms, searchQuery, selectedCity]);

  const handleVote = useCallback((id: string, type: 'hasCash' | 'noCash') => {
    setAtms(prev => prev.map(atm => {
      if (atm.id === id) {
        const newVotes = { ...atm.votes, [type]: atm.votes[type] + 1 };
        let newStatus = atm.status;
        
        if (newVotes.noCash > newVotes.hasCash + 2) newStatus = ATMStatus.NO_CASH;
        if (newVotes.hasCash > newVotes.noCash + 2) newStatus = ATMStatus.CASH;
        
        return {
          ...atm,
          votes: newVotes,
          status: newStatus,
          lastUpdated: 'agora mesmo',
          lastUpdatedTimestamp: Date.now()
        };
      }
      return atm;
    }));
  }, []);

  const cityCoordinates: Record<string, [number, number]> = {
    "Benguela": [-12.5783, 13.4055],
    "Lobito": [-12.35, 13.5333],
    "Baía Farta": [-12.6108, 13.1908],
    "Catumbela": [-12.4306, 13.5472],
    "Ganda": [-13.0333, 14.6333],
    "Cubal": [-13.0333, 14.3167],
    "Bocoio": [-12.4667, 14.1333],
    "Balombo": [-12.35, 14.7667],
    "Chongorói": [-13.6167, 13.8833],
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setShowCitySelect(false);
    if (cityCoordinates[city]) {
      setMapCenter(cityCoordinates[city]);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setAtms(prev => prev.map(atm => ({
        ...atm,
        lastUpdatedTimestamp: atm.lastUpdatedTimestamp + 1000
      })));
    }, 1200);
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white relative font-sans overflow-hidden">
      
      {/* Dynamic Header */}
      <div className="absolute top-0 left-0 right-0 z-[1000] p-4 flex flex-col gap-3 pointer-events-none">
        <div className="flex flex-col gap-2 pointer-events-auto">
          <div className="flex items-center justify-between mb-1 px-1">
             <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black tracking-tighter text-green-500 italic">AngoATM</h1>
                  <div className="px-2 py-0.5 bg-green-500/20 rounded-md border border-green-500/30">
                    <span className="text-[8px] text-green-500 font-black uppercase">Live</span>
                  </div>
                </div>
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em]">Benguela Digital</span>
             </div>
             <button 
              onClick={handleRefresh} 
              className={`p-3 rounded-2xl border border-zinc-800 shadow-2xl transition-all active:scale-90 ${isLoading ? 'bg-green-500 text-black' : 'bg-zinc-900/80 backdrop-blur text-green-500'}`}
             >
               <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
             </button>
          </div>
          
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="text" 
                placeholder="Ex: BAI Lobito, BFA Praia Morena..."
                className="w-full bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-2xl py-3.5 pl-11 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 shadow-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-800 rounded-full text-zinc-500"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button 
              onClick={() => setShowCitySelect(!showCitySelect)}
              className="bg-zinc-900/90 backdrop-blur-md px-4 py-3.5 rounded-2xl border border-zinc-800 shadow-xl flex items-center gap-2 text-sm font-black whitespace-nowrap"
            >
              {selectedCity === 'Todas' ? 'Municípios' : selectedCity}
              <ChevronDown size={16} className={`transition-transform duration-300 ${showCitySelect ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showCitySelect && (
            <div className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-[2rem] mt-1 max-h-[50vh] overflow-y-auto shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="p-3 grid grid-cols-1 gap-1">
                <button 
                  onClick={() => handleCityChange('Todas')}
                  className="w-full text-left px-5 py-4 hover:bg-white/5 rounded-2xl transition-all text-sm font-black border-b border-zinc-800/50"
                >
                  Toda a Província de Benguela
                </button>
                {CIDADES_BENGUELA.sort().map(city => (
                  <button 
                    key={city}
                    onClick={() => handleCityChange(city)}
                    className={`w-full text-left px-5 py-4 hover:bg-white/5 rounded-2xl transition-all text-sm flex items-center justify-between font-bold ${selectedCity === city ? 'text-green-500 bg-green-500/5' : ''}`}
                  >
                    {city}
                    {selectedCity === city && <Check size={16} />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <main className="flex-1 relative">
        {viewMode === 'MAP' && (
          <>
            <MapContainer 
              center={mapCenter} 
              zoom={13} 
              className="w-full h-full"
              zoomControl={false}
              maxBounds={[[-14.1, 12.5], [-11.8, 15.2]]}
              minZoom={8}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
              />
              <MapUpdater center={mapCenter} />
              {filteredAtms.map(atm => (
                <Marker 
                  key={atm.id} 
                  position={atm.coordinates}
                  icon={createIcon(atm.status, atm.lastUpdatedTimestamp)}
                  eventHandlers={{
                    click: () => setSelectedAtm(atm),
                  }}
                >
                  <Popup className="dark-popup">
                    <div className="p-1">
                      <div className="text-black font-black text-sm">{atm.bankName}</div>
                      <div className="text-zinc-600 text-[10px] font-bold uppercase">{atm.neighborhood}</div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Legend Overlay */}
            <div className="absolute left-4 top-48 z-[500] pointer-events-none">
                <div className="bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex flex-col gap-2">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-zinc-300">Em Tempo Real</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-zinc-500 opacity-50" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Info Antiga (+4h)</span>
                   </div>
                </div>
            </div>

            <div className="absolute right-4 bottom-28 z-[500]">
              <button 
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((pos) => {
                      setMapCenter([pos.coords.latitude, pos.coords.longitude]);
                    });
                  }
                }}
                className="bg-green-500 p-4 rounded-full shadow-[0_0_30px_rgba(34,197,94,0.5)] text-black active:scale-90 transition-transform"
              >
                <Navigation size={24} fill="currentColor" />
              </button>
            </div>

            {selectedAtm && (
              <div className="absolute bottom-24 left-0 right-0 p-4 z-[600]">
                <ATMCard 
                  atm={selectedAtm} 
                  onVote={handleVote} 
                  onClose={() => setSelectedAtm(null)} 
                  userCoords={userCoords}
                />
              </div>
            )}
          </>
        )}

        {viewMode === 'NEARBY' && (
          <div className="h-full overflow-y-auto p-4 pt-48 pb-24 space-y-4">
            <h2 className="text-3xl font-black px-1 tracking-tighter">Relatórios Recentes</h2>
            <div className="grid grid-cols-1 gap-4">
              {filteredAtms.sort((a,b) => b.lastUpdatedTimestamp - a.lastUpdatedTimestamp).map(atm => (
                <ATMCard key={atm.id} atm={atm} onVote={handleVote} userCoords={userCoords} />
              ))}
            </div>
          </div>
        )}

        {viewMode === 'FAVORITES' && (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center gap-6">
            <div className="w-32 h-32 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-800 shadow-inner">
              <Star size={64} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tighter">Meus Multicaixas</h2>
              <p className="text-zinc-500 text-sm max-w-[250px] font-medium leading-relaxed">
                Adicione os ATMs da sua rota diária em Benguela para ver o status instantaneamente.
              </p>
            </div>
          </div>
        )}

        {viewMode === 'PROFILE' && (
          <div className="h-full overflow-y-auto p-4 pt-48 pb-24 space-y-8">
            <div className="flex items-center gap-6 p-8 bg-zinc-900 rounded-[3rem] border border-zinc-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <User size={120} />
              </div>
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-green-400 to-green-700 flex items-center justify-center text-black font-black text-4xl shadow-2xl relative z-10">
                BG
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-black tracking-tighter">Monitor Benguela</h3>
                <p className="text-green-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Nível: Guardião Urbano</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800 flex flex-col items-center shadow-lg">
                <span className="text-4xl font-black text-white">42</span>
                <span className="text-[10px] text-zinc-500 font-black uppercase mt-2 tracking-widest">Relatos</span>
              </div>
              <div className="bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800 flex flex-col items-center shadow-lg">
                <span className="text-4xl font-black text-white">100%</span>
                <span className="text-[10px] text-zinc-500 font-black uppercase mt-2 tracking-widest">Precisão</span>
              </div>
            </div>

            <div className="p-8 bg-zinc-900 rounded-[2.5rem] border border-zinc-800 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">O Nosso Compromisso</h4>
              <p className="text-zinc-400 text-sm leading-relaxed font-bold">
                O AngoATM Benguela vive da verdade. Cada voto seu ajuda um vizinho a não perder tempo em filas no Lobito ou na Baía. Use com responsabilidade.
              </p>
            </div>
            
            <p className="text-center text-[10px] text-zinc-800 uppercase tracking-[0.4em] font-black pt-4">
              Benguela • v1.0.4-Live
            </p>
          </div>
        )}
      </main>

      <nav className="bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-900 px-8 py-6 flex justify-between items-center z-[1000] pb-12 shadow-[0_-20px_40px_rgba(0,0,0,0.8)]">
        <button 
          onClick={() => setViewMode('MAP')}
          className={`flex flex-col items-center gap-2 transition-all duration-300 ${viewMode === 'MAP' ? 'text-green-500 scale-110' : 'text-zinc-600'}`}
        >
          <MapIcon size={26} strokeWidth={viewMode === 'MAP' ? 3 : 2} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Explorar</span>
        </button>
        <button 
          onClick={() => setViewMode('NEARBY')}
          className={`flex flex-col items-center gap-2 transition-all duration-300 ${viewMode === 'NEARBY' ? 'text-green-500 scale-110' : 'text-zinc-600'}`}
        >
          <TrendingUp size={26} strokeWidth={viewMode === 'NEARBY' ? 3 : 2} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Relatos</span>
        </button>
        <button 
          onClick={() => setViewMode('FAVORITES')}
          className={`flex flex-col items-center gap-2 transition-all duration-300 ${viewMode === 'FAVORITES' ? 'text-green-500 scale-110' : 'text-zinc-600'}`}
        >
          <Star size={26} strokeWidth={viewMode === 'FAVORITES' ? 3 : 2} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Salvos</span>
        </button>
        <button 
          onClick={() => setViewMode('PROFILE')}
          className={`flex flex-col items-center gap-2 transition-all duration-300 ${viewMode === 'PROFILE' ? 'text-green-500 scale-110' : 'text-zinc-600'}`}
        >
          <User size={26} strokeWidth={viewMode === 'PROFILE' ? 3 : 2} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Perfil</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
