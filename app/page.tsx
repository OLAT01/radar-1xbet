"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Trophy, 
  Crown, 
  Zap, 
  Lock, 
  Clock, 
  TrendingUp, 
  ShieldCheck,
  ChevronRight
} from "lucide-react";

// Configuration des ligues d'élite
const GOLD_LEAGUES = [2, 3, 39, 40, 41, 42, 45, 48, 61, 62, 71, 78, 79, 81, 88, 94, 103, 113, 119, 135, 136, 140, 141, 143, 144, 179, 180, 188, 197, 203, 207, 218, 235, 253, 262, 268, 271, 281, 307, 345, 479, 529, 547, 554, 560, 667, 766, 848];

export default function PremiumBettingApp() {
  const [coupons, setCoupons] = useState<any[][]>([[], [], []]);
  const [leSauveur, setLeSauveur] = useState<any[]>([]);
  const [matchsLive, setMatchsLive] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // LOGIQUE DE DÉCISION AUTOMATIQUE (V7.4)
  const getAutoDecisionTip = (m: any) => {
    const id = m.league?.id;
    if (id === 2 || id === 39) return "FAVORI MARQUE (T1/T2 +0.5) - 90MIN";
    if ([140, 135, 61].includes(id)) return "DOUBLE CHANCE 12 - 90MIN";
    return "PLUS DE 7.5 CORNERS - 90MIN";
  };

  const fetchAllData = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const resp = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}&timezone=Africa/Bamako`, {
        method: "GET",
        headers: { "x-rapidapi-key": "7457ba7f869c23967e70d6f9edce7099", "x-rapidapi-host": "v3.football.api-sports.io" }
      });
      const data = await resp.json();
      const all = data.response || [];
      const now = new Date().getTime();

      // RADAR LIVE FILTRÉ
      setMatchsLive(all.filter((m: any) => {
        const diff = (new Date(m.fixture.date).getTime() - now) / 60000;
        return GOLD_LEAGUES.includes(m.league?.id) && diff >= -120 && ((diff <= 15 && diff > 0) || (m.fixture.status.short === "1H" && m.fixture.status.elapsed <= 42));
      }));

      // COUPONS & SAUVEUR (PROCHAINES 24H)
      const future = all.filter((m: any) => {
        const diffH = (new Date(m.fixture.date).getTime() - now) / (1000 * 60 * 60);
        return GOLD_LEAGUES.includes(m.league?.id) && m.fixture.status.short === "NS" && m.league.name !== "Friendlies" && diffH > 0 && diffH < 24;
      }).sort((a: any, b: any) => {
        const p = [2, 39, 140, 135, 78, 61];
        const aP = p.indexOf(a.league.id) !== -1 ? p.indexOf(a.league.id) : 99;
        const bP = p.indexOf(b.league.id) !== -1 ? p.indexOf(b.league.id) : 99;
        return aP - bP || new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime();
      });

      setLeSauveur(future.slice(0, 2));
      const pool = future.slice(2);
      setCoupons([pool.slice(0, 3), pool.slice(3, 6), pool.slice(6, 9)]);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-200 font-sans pb-20">
      
      {/* HEADER PREMIUM */}
      <header className="bg-[#11192e] border-b border-slate-800 p-4 sticky top-0 z-50 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-2">
          <div className="bg-yellow-500 p-1.5 rounded-lg shadow-[0_0_15px_rgba(234,179,8,0.4)]">
            <Trophy className="w-5 h-5 text-black" strokeWidth={3} />
          </div>
          <span className="font-black text-xl tracking-tighter text-white">PRO<span className="text-yellow-500">BET</span></span>
        </div>
        <button className="bg-yellow-500/10 text-yellow-500 px-4 py-1.5 rounded-full text-xs font-bold border border-yellow-500/30">
          94% WIN RATE
        </button>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-8 mt-2">

        {/* SECTION : VIP ROLLOVER (STRATÉGIE MONTANTE) */}
        <section className="relative overflow-hidden rounded-2xl border-2 border-yellow-500/50 bg-gradient-to-br from-[#1a1f35] to-[#0f1425] shadow-[0_0_30px_rgba(234,179,8,0.15)]">
          <div className="bg-yellow-500 p-2 flex items-center justify-center gap-2">
            <Crown className="w-4 h-4 text-black animate-bounce" />
            <h2 className="text-black font-black text-xs uppercase tracking-widest">VIP Rollover Strategy</h2>
          </div>
          
          <div className="p-5 space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Objectif</p>
                <p className="text-2xl font-black text-white italic">100€ → 1500€</p>
              </div>
              <div className="text-right">
                <p className="text-yellow-500 text-xs font-black uppercase">Jour 1/3</p>
                <div className="flex gap-1 mt-1">
                  <div className="w-8 h-1.5 bg-yellow-500 rounded-full"></div>
                  <div className="w-8 h-1.5 bg-slate-700 rounded-full"></div>
                  <div className="w-8 h-1.5 bg-slate-700 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Match avec flou (Blur) pour inciter à l'achat */}
            <div className="relative group cursor-pointer overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/50 p-4">
              <div className="filter blur-md select-none">
                <div className="flex justify-between text-[10px] mb-1"><span>Ligue des Champions</span><span>21:00</span></div>
                <div className="flex justify-between font-bold text-sm mb-2"><span>Real Madrid</span><span>VS</span><span>Manchester City</span></div>
                <div className="bg-yellow-500/20 text-yellow-500 text-center py-1 rounded text-[10px] font-bold">PRONOSTIC VIP ICI</div>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-[2px]">
                <Lock className="w-8 h-8 text-yellow-500 mb-2 drop-shadow-lg" />
                <button className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-2 rounded-xl font-black text-xs shadow-xl transition-transform active:scale-95">
                  DÉBLOQUER LE COUPON VIP
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION : LE SAUVEUR (FREE TIPS) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-red-500" />
            <h3 className="font-black text-sm uppercase tracking-tight">Le Sauveur du Jour</h3>
          </div>
          {leSauveur.map((m, i) => (
            <div key={i} className="bg-[#11192e] border border-slate-800 rounded-xl p-4 flex items-center justify-between group hover:border-red-500/50 transition-colors">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 text-[9px] text-slate-500 font-bold uppercase">
                  <span className="text-red-500">{m.league.name}</span>
                  <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {new Date(m.fixture.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <div className="text-sm font-bold text-white flex gap-2">
                  <span>{m.teams.home.name}</span>
                  <span className="text-slate-600">vs</span>
                  <span>{m.teams.away.name}</span>
                </div>
                <div className="inline-block bg-red-500/10 text-red-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter">
                  {getAutoDecisionTip(m)}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-red-500" />
            </div>
          ))}
        </section>

        {/* RADAR LIVE SECTION */}
        <section className="bg-[#0f1425] rounded-2xl border border-sky-500/30 overflow-hidden shadow-lg shadow-sky-500/5">
          <div className="bg-sky-500/10 p-3 border-b border-sky-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-sky-400 fill-sky-400 animate-pulse" />
              <h3 className="font-bold text-xs text-sky-400 uppercase tracking-widest">Radar Live Scalping</h3>
            </div>
            <span className="text-[10px] text-sky-500 font-bold bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">LIVE</span>
          </div>
          <div className="p-3 divide-y divide-slate-800">
            {matchsLive.length > 0 ? matchsLive.map((m, i) => (
              <div key={i} className="py-3 flex justify-between items-center">
                <div className="text-[11px] font-medium max-w-[150px] truncate">{m.teams.home.name} - {m.teams.away.name}</div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-yellow-500">{m.goals.home} - {m.goals.away}</span>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded font-mono text-sky-400">{m.fixture.status.elapsed}'</span>
                </div>
              </div>
            )) : (
              <p className="text-center py-6 text-xs text-slate-600 font-medium italic">En attente de matchs en phase critique...</p>
            )}
          </div>
        </section>

        {/* CALL TO ACTION : JOIN TELEGRAM */}
        <button className="w-full bg-[#229ED9] hover:bg-[#1e8ec3] text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl transition-transform active:scale-[0.98]">
           REJOINDRE LE CANAL VIP SUR TELEGRAM
        </button>

      </main>

      {/* NAVBAR MOBILE D'APP */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#11192e] border-t border-slate-800 p-3 flex justify-around items-center z-50">
        <div className="flex flex-col items-center gap-1 text-yellow-500">
          <TrendingUp className="w-5 h-5" />
          <span className="text-[9px] font-bold">Pronostics</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-slate-500">
          <Zap className="w-5 h-5" />
          <span className="text-[9px] font-bold">Live</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-slate-500">
          <Crown className="w-5 h-5" />
          <span className="text-[9px] font-bold">VIP</span>
        </div>
      </nav>
    </div>
  );
}