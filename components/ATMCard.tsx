
import React from 'react';
import { ATM, ATMStatus } from '../types';
import { MapPin, Clock, ShieldCheck, ShieldAlert, CheckCircle2, XCircle, Info, Timer, Compass } from 'lucide-react';

interface ATMCardProps {
  atm: ATM;
  onVote: (id: string, vote: 'hasCash' | 'noCash') => void;
  onClose?: () => void;
  userCoords?: [number, number] | null;
}

const ATMCard: React.FC<ATMCardProps> = ({ atm, onVote, onClose, userCoords }) => {
  const getStatusColor = (status: ATMStatus) => {
    switch (status) {
      case ATMStatus.CASH: return 'text-green-400 bg-green-400/10 border-green-400/20';
      case ATMStatus.NO_CASH: return 'text-red-400 bg-red-400/10 border-red-400/20';
      case ATMStatus.OUT_OF_SERVICE: return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
      default: return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    }
  };

  const getStatusLabel = (status: ATMStatus) => {
    switch (status) {
      case ATMStatus.CASH: return 'Com Dinheiro';
      case ATMStatus.NO_CASH: return 'Sem Dinheiro';
      case ATMStatus.OUT_OF_SERVICE: return 'Fora de Serviço';
      default: return 'Aguardando Relato';
    }
  };

  // Cálculo da distância
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): string => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    
    if (d < 1) return `${Math.round(d * 1000)}m`;
    return `${d.toFixed(1)}km`;
  };

  const distanceText = userCoords 
    ? calculateDistance(userCoords[0], userCoords[1], atm.coordinates[0], atm.coordinates[1])
    : null;

  // Lógica de tempo real para confiabilidade
  const timeDiff = Date.now() - atm.lastUpdatedTimestamp;
  const isVeryRecent = timeDiff < 30 * 60000; // 30 min
  const isRecent = timeDiff < 2 * 3600000; // 2 horas
  
  const getReliability = () => {
    if (atm.status === ATMStatus.OUT_OF_SERVICE) return { label: 'Inativo', color: 'text-zinc-600' };
    if (isVeryRecent) return { label: 'Confiabilidade Alta', color: 'text-green-500' };
    if (isRecent) return { label: 'Confiabilidade Média', color: 'text-yellow-500' };
    return { label: 'Pode estar desatualizado', color: 'text-red-500' };
  };

  const reliability = getReliability();

  return (
    <div className="bg-zinc-900/95 backdrop-blur-xl rounded-[2rem] p-6 shadow-2xl border border-zinc-800 flex flex-col gap-4 animate-in slide-in-from-bottom-5 duration-500">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-black text-white tracking-tighter">{atm.bankName}</h3>
            {isVeryRecent && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
              <MapPin size={12} className="text-green-500" /> {atm.neighborhood}
            </p>
            {distanceText && (
              <div className="flex items-center gap-1 bg-zinc-800/50 px-2 py-0.5 rounded-full border border-zinc-700/50">
                <Compass size={10} className="text-zinc-400" />
                <span className="text-[10px] font-black text-zinc-300 uppercase tracking-tighter">{distanceText}</span>
              </div>
            )}
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase border ${getStatusColor(atm.status)}`}>
          {getStatusLabel(atm.status)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Localização</p>
            <p className="text-xs text-zinc-300 leading-tight flex items-start gap-2">
              <Info size={14} className="mt-0.5 shrink-0" /> {atm.address}
            </p>
        </div>
        <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Horário</p>
            <p className="text-xs text-zinc-300 leading-tight flex items-center gap-2">
              <Clock size={14} /> {atm.hours}
            </p>
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <div className={`text-[10px] font-black uppercase flex items-center gap-1.5 ${reliability.color}`}>
          <Timer size={14} /> {reliability.label}
        </div>
        <div className="text-[10px] text-zinc-500 font-bold uppercase">
          Visto {atm.lastUpdated}
        </div>
      </div>

      <div className="flex gap-3 mt-1">
        <button 
          onClick={() => onVote(atm.id, 'hasCash')}
          className="flex-1 group relative overflow-hidden bg-green-500/10 hover:bg-green-500/20 p-4 rounded-2xl transition-all border border-green-500/20 active:scale-95"
        >
          <div className="flex flex-col items-center gap-1 relative z-10">
            <CheckCircle2 size={24} className="text-green-500" />
            <span className="text-[10px] font-black uppercase text-green-500">Tem Cash</span>
            <span className="text-[9px] text-green-500/60 font-bold">{atm.votes.hasCash} votos</span>
          </div>
        </button>
        
        <button 
          onClick={() => onVote(atm.id, 'noCash')}
          className="flex-1 group relative overflow-hidden bg-red-500/10 hover:bg-red-500/20 p-4 rounded-2xl transition-all border border-red-500/20 active:scale-95"
        >
          <div className="flex flex-col items-center gap-1 relative z-10">
            <XCircle size={24} className="text-red-500" />
            <span className="text-[10px] font-black uppercase text-red-500">Sem Cash</span>
            <span className="text-[9px] text-red-500/60 font-bold">{atm.votes.noCash} votos</span>
          </div>
        </button>
      </div>

      {onClose && (
        <button 
          onClick={onClose} 
          className="text-zinc-600 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] mt-1 transition-colors"
        >
          Fechar Detalhes
        </button>
      )}
    </div>
  );
};

export default ATMCard;
