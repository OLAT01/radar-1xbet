"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Trophy, Crown, Zap, Lock, Clock, TrendingUp, ShieldCheck, Flame, Target, RefreshCw } from "lucide-react";

const GOLD_LEAGUES = [2, 3, 39, 40, 41, 42, 45, 48, 61, 62, 71, 78, 79, 81, 88, 94, 103, 113, 119, 135, 136, 140, 141, 143, 144, 179, 180, 188, 197, 203, 207, 218, 235, 253, 262, 268, 271, 281, 307, 345, 479, 529, 547, 554, 560, 667, 766, 848];

export default function ProBetRefreshSystem() {
  const [singleCoupon, setSingleCoupon] = useState<any[]>([]);
  const [leSauveur, setLeSauveur] = useState<any[]>([]);
  const [vipMatch, setVipMatch] = useState<any>(null);
  const [radarHistorique, setRadarHistorique] = useState<any[]>([]);
  const [radarDanger, setRadarDanger] = useState<any[]>([]);
  
  // Index pour le rafraîchissement
  const [offset, setOffset] = useState(0);

  const getSmartAnalysis = (m: any, index: number) => {
    const id = m.league?.id;
    if (index === 0) return { tip: "PLUS DE 1.5 BUTS - 90MIN", col: "#f87171" }; 
    if (index === 1 && [39, 140, 61].includes(id)) return { tip: "PLUS DE 3.5 CARTONS", col: "#f472b6" };
    if (index === 2) return { tip: "DOUBLE CHANCE 12", col: "#fbbf24" };
    return { tip: "PLUS DE 8.5 CORNERS", col: "#38bdf8" };
  };

  const fetchAllData = useCallback(async (currentOffset = 0) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const resp = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}&timezone=Africa/Bamako`, {
        method: "GET",
        headers: { "x-rapidapi-key": "7457ba7f869c23967e70d6f9edce7099", "x-rapidapi-host": "v3.football.api-sports.io" }
      });
      const data = await resp.json();
      const all = data.response || [];
      const nowTs = new Date().getTime();

      // RADARS (Toujours temps réel, pas affectés par l'offset)
      setRadarHistorique(all.filter((m: any) => {
        const diffMin = (new Date(m.fixture.date).getTime() - nowTs) / 60000;
        return GOLD_LEAGUES.includes(m.league?.id) && ((diffMin <= 15 && diffMin > 0) || (m.fixture.status.short === "1H" && m.fixture.status.elapsed <= 42));
      }));

      setRadarDanger(all.filter((m: any) => ["1H", "2H"].includes(m.fixture.status.short) && [39, 2, 78, 135].includes(m.league?.id)).slice(0, 3));

      // SYSTÈME DE RECHERCHE / RAFRAÎCHISSEMENT (Affecté par l'offset)
      const future = all.filter((m: any) => {
        const diffH = (new Date(m.fixture.date).getTime() - nowTs) / (1000 * 60 * 60);
        return m.fixture.status.short === "NS" && diffH > 0 && diffH < 24;
      }).sort((a: any, b: any) => (GOLD_LEAGUES.includes(a.league.id) ? -1 : 1));

      // On décale la sélection selon l'offset pour trouver d'autres matchs
      const startIdx = currentOffset % (future.length > 6 ? future.length - 6 : 1);
      
      setVipMatch(future[startIdx] || future[0]);
      setLeSauveur(future.slice(startIdx + 1, startIdx + 3));
      setSingleCoupon(future.slice(startIdx + 3, startIdx + 6));

    } catch (err) { console.error(err); }
  }, []);

  const handleRefresh = () => {
    const newOffset = offset + 3;
    setOffset(newOffset);
    fetchAllData(newOffset);
  };

  useEffect(() => {
    fetchAllData(0);
    const inv = setInterval(() => fetchAllData(offset), 60000);
    return () => clearInterval(inv);
  }, [fetchAllData, offset]);

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-200 pb-24 font-sans">
      <header className="bg-[#11192e] p-4 flex justify-between items-center border-b border-slate-800 sticky top-0 z-50 shadow-2xl">
        <div className="flex items-center gap-2"><Trophy className="text-yellow-500 w-6 h-6" /><span className="font-black text-xl italic uppercase tracking-tighter">Pro<span className="text-yellow-500">Bet</span></span></div>
        <button onClick={handleRefresh} className="flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-4 py-2 rounded-full border border-yellow-500/30 active:scale-90 transition-transform">
          <RefreshCw className="w-4 h-4" /> <span className="text-[10px] font-black uppercase">Rafraîchir</span>
        </button>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-8">
        
        {/* VIP & SAUVEUR */}
        <section className="rounded-2xl border-2 border-yellow-500 bg-gradient-to-b from-[#1e293b] to-[#0a0f1d] p-5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10 text-yellow-500"><Crown className="w-12 h-12" /></div>
          <h2 className="text-yellow-500 font-black text-[10px] uppercase text-center mb-4 tracking-widest italic underline">VIP Rollover Challenge</h2>
          <div className="text-center text-3xl font-black italic mb-6 tracking-tighter text-white">100€ → 1500€</div>
          <button className="w-full bg-yellow-500 text-black py-3 rounded-xl font-black text-xs shadow-lg active:scale-95 transition-transform uppercase tracking-widest">Voir le match VIP</button>
        </section>

        <section className="space-y-4">
          <h3 className="flex items-center gap-2 text-red-500 font-black text-xs uppercase tracking-tighter"><ShieldCheck className="w-5 h-5" /> Le Sauveur du Jour</h3>
          {leSauveur.map((m, i) => (
            <div key={i} className="bg-[#11192e] border border-slate-800 rounded-2xl p-4 shadow-lg border-l-4 border-l-red-500">
              <div className="flex justify-between text-[8px] text-slate-500 mb-2 font-black uppercase"><span>{m.league.name}</span><span>{new Date(m.fixture.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div>
              <div className="flex justify-between font-black text-sm mb-3 px-2 italic"><span>{m.teams.home.name}</span><span className="text-slate-700">vs</span><span>{m.teams.away.name}</span></div>
              <div className="text-[10px] text-red-500 font-black bg-red-500/5 py-2 text-center rounded-lg border border-red-500/20 uppercase tracking-widest">{getSmartAnalysis(m, i).tip}</div>
            </div>
          ))}
        </section>

        {/* COUPON DE 3 MATCHS */}
        <section className="bg-[#11192e] rounded-2xl p-5 shadow-2xl border border-slate-800">
          <div className="flex justify-between items-center mb-5 border-b border-slate-800 pb-3">
            <h3 className="text-xs font-black uppercase text-slate-400 italic">Unique Coupon (3 Matchs)</h3>
            <div className="flex gap-1">{[1,2,3].map(d => <div key={d} className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div>)}</div>
          </div>
          <div className="space-y-5">
            {singleCoupon.map((m, i) => (
              <div key={i} className="relative pl-4">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500/30 rounded-full"></div>
                <div className="flex justify-between text-[8px] text-slate-500 mb-1 font-bold uppercase tracking-widest"><span>{m.league.name}</span><span>{new Date(m.fixture.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div>
                <div className="flex justify-between font-black text-xs mb-2"><span>{m.teams.home.name}</span><span>{m.teams.away.name}</span></div>
                <div className="text-[10px] font-black uppercase tracking-tighter" style={{color: getSmartAnalysis(m, i).col}}>{getSmartAnalysis(m, i).tip}</div>
              </div>
            ))}
          </div>
        </section>

        {/* RADARS (HISTORIQUE & DANGER) */}
        <div className="grid grid-cols-1 gap-6">
          <section className="bg-sky-500/5 border border-sky-500/20 rounded-2xl overflow-hidden shadow-lg shadow-sky-500/5">
            <div className="bg-sky-500/10 p-3 border-b border-sky-500/20 text-sky-400 font-black text-[10px] uppercase flex items-center gap-2"><Clock className="w-4 h-4" /> Radar Historique (-15' à 42')</div>
            <div className="divide-y divide-slate-800">
              {radarHistorique.map((m, i) => (
                <div key={i} className="p-4 flex justify-between items-center bg-[#11192e]/40">
                  <div className="text-[11px] font-black truncate max-w-[150px]">{m.teams.home.name} - {m.teams.away.name}</div>
                  <div className="text-[10px] bg-sky-500/10 px-3 py-1 rounded-full text-sky-400 font-bold border border-sky-500/20 animate-pulse">{m.fixture.status.elapsed}'</div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-orange-500/5 border border-orange-500/20 rounded-2xl overflow-hidden shadow-lg shadow-orange-500/5">
            <div className="bg-orange-500/10 p-3 border-b border-orange-500/20 text-orange-400 font-black text-[10px] uppercase flex items-center gap-2"><Flame className="w-4 h-4 animate-bounce" /> Radar Danger (But Imminent)</div>
            <div className="divide-y divide-slate-800">
              {radarDanger.map((m, i) => (
                <div key={i} className="p-4 bg-orange-500/[0.03]">
                  <div className="flex justify-between items-center mb-1"><div className="text-[11px] font-black">{m.teams.home.name} - {m.teams.away.name}</div><div className="text-xs font-black text-orange-500">{m.goals.home} - {m.goals.away}</div></div>
                  <div className="flex items-center gap-2 text-[8px] text-orange-400 font-black uppercase tracking-widest"><Target className="w-3 h-3" /> Pression Offensive Intense</div>
                </div>
              ))}
            </div>
          </section>
        </div>

      </main>

      <nav className="fixed bottom-0 inset-x-0 bg-[#11192e] border-t border-slate-800 p-5 flex justify-around items-center z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <TrendingUp className="text-yellow-500 w-6 h-6" /> <Zap className="text-slate-600 w-6 h-6" /> <Crown className="text-slate-600 w-6 h-6" />
      </nav>
    </div>
  );
}