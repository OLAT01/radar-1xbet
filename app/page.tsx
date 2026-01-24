"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Trophy, Crown, Zap, ShieldCheck, Flame, Target, RefreshCw, Clock } from "lucide-react";

const GOLD_LEAGUES = [2, 3, 39, 40, 41, 42, 45, 48, 61, 62, 71, 78, 79, 81, 88, 94, 103, 113, 119, 135, 136, 140, 141, 143, 144, 179, 180, 188, 197, 203, 207, 218, 235, 253, 262, 268, 271, 281, 307, 345, 479, 529, 547, 554, 560, 667, 766, 848];

export default function ProBetPerfection() {
  const [singleCoupon, setSingleCoupon] = useState<any[]>([]);
  const [leSauveur, setLeSauveur] = useState<any[]>([]);
  const [vipMatch, setVipMatch] = useState<any>(null);
  const [radarHistorique, setRadarHistorique] = useState<any[]>([]);
  const [radarDanger, setRadarDanger] = useState<any[]>([]);
  const [offset, setOffset] = useState(0);

  const getSmartAnalysis = (m: any, index: number) => {
    const id = m.league?.id;
    if (index === 0) return { tip: "PLUS DE 1.5 BUTS - 90MIN", col: "#f87171" }; 
    if (index === 1 && [39, 140, 61].includes(id)) return { tip: "PLUS DE 3.5 CARTONS", col: "#f472b6" };
    return { tip: "PLUS DE 8.5 CORNERS", col: "#38bdf8" };
  };

  const fetchAllData = useCallback(async (currentOffset: number) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const resp = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}&timezone=Africa/Bamako`, {
        method: "GET",
        headers: { "x-rapidapi-key": "7457ba7f869c23967e70d6f9edce7099", "x-rapidapi-host": "v3.football.api-sports.io" }
      });
      const data = await resp.json();
      const all = data.response || [];
      const nowTs = new Date().getTime();

      // 1. RADAR HISTORIQUE (But précoce < 30min + Scores)
      setRadarHistorique(all.filter((m: any) => {
        const diffMin = (new Date(m.fixture.date).getTime() - nowTs) / 60000;
        // Filtre : Uniquement ligues très offensives (historique but précoce)
        const isHighScoringLeague = [39, 78, 88, 2].includes(m.league?.id);
        const isTimeWindow = (diffMin <= 15 && diffMin > 0) || (m.fixture.status.short === "1H" && m.fixture.status.elapsed <= 42);
        return isHighScoringLeague && isTimeWindow;
      }));

      // 2. RADAR DANGER (Tout moment + Scores + Pression)
      setRadarDanger(all.filter((m: any) => 
        ["1H", "2H"].includes(m.fixture.status.short) && 
        [39, 140, 61, 2].includes(m.league?.id)
      ).slice(0, 4));

      // 3. LOGIQUE DE RAFRAÎCHISSEMENT (VIP, SAUVEUR, COUPON)
      const future = all.filter((m: any) => 
        m.fixture.status.short === "NS" && 
        GOLD_LEAGUES.includes(m.league?.id)
      );

      const startIdx = currentOffset % (future.length > 10 ? future.length - 6 : 1);
      setVipMatch(future[startIdx] || null);
      setLeSauveur(future.slice(startIdx + 1, startIdx + 3));
      setSingleCoupon(future.slice(startIdx + 3, startIdx + 6));

    } catch (err) { console.error(err); }
  }, []);

  const handleRefresh = () => {
    const nextOffset = offset + 3;
    setOffset(nextOffset);
    fetchAllData(nextOffset);
  };

  useEffect(() => {
    fetchAllData(0);
    const interval = setInterval(() => fetchAllData(offset), 60000);
    return () => clearInterval(interval);
  }, [fetchAllData, offset]);

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-200 pb-24 font-sans">
      <header className="bg-[#11192e] p-4 flex justify-between items-center border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center gap-2">
            <Trophy className="text-yellow-500 w-6 h-6" />
            <span className="font-black text-xl italic uppercase">ProBet</span>
        </div>
        <button onClick={handleRefresh} className="flex items-center gap-2 bg-yellow-500 text-black px-4 py-1.5 rounded-full font-black text-[10px] uppercase shadow-lg shadow-yellow-500/20 active:scale-90 transition-all">
          <RefreshCw className="w-3 h-3" /> Rafraîchir
        </button>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-8">
        
        {/* VIP CHALLENGE */}
        {vipMatch && (
          <section className="rounded-2xl border-2 border-yellow-500 bg-[#1a1f35] p-5 shadow-2xl text-center">
            <div className="text-yellow-500 font-black text-[10px] uppercase mb-1 tracking-[0.3em]">VIP Rollover Strategy</div>
            <div className="text-2xl font-black italic mb-4 text-white uppercase">100€ → 1500€</div>
            <div className="bg-black/40 p-4 rounded-xl border border-white/5 mb-4">
                <div className="text-[10px] text-slate-500 mb-1">{vipMatch.league.name}</div>
                <div className="font-bold blur-sm select-none text-sm">{vipMatch.teams.home.name} vs {vipMatch.teams.away.name}</div>
            </div>
            <button className="w-full bg-yellow-500 text-black py-3 rounded-xl font-black text-xs uppercase shadow-xl">Débloquer le coupon VIP</button>
          </section>
        )}

        {/* LE SAUVEUR */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-red-500 font-black text-xs uppercase tracking-widest px-1">
            <ShieldCheck className="w-4 h-4" /> Le Sauveur du Jour
          </div>
          {leSauveur.map((m, i) => (
            <div key={i} className="bg-[#11192e] border border-slate-800 rounded-2xl p-4 shadow-xl border-l-4 border-l-red-500">
              <div className="flex justify-between text-[8px] text-slate-500 mb-2 font-black uppercase"><span>{m.league.name}</span><span>{new Date(m.fixture.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div>
              <div className="flex justify-between font-black text-sm mb-3"><span>{m.teams.home.name}</span><span className="text-slate-700 font-normal">vs</span><span>{m.teams.away.name}</span></div>
              <div className="text-[10px] text-red-500 font-black bg-red-500/5 py-2 text-center rounded-lg border border-red-500/20 uppercase tracking-widest">{getSmartAnalysis(m, i).tip}</div>
            </div>
          ))}
        </section>

        {/* UNIQUE COUPON AVEC POINTS CLIGNOTANTS */}
        <section className="bg-[#11192e] rounded-2xl p-5 shadow-2xl border border-slate-800 relative">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black uppercase text-slate-400 italic">Unique Coupon (3 Matchs)</h3>
            <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-ping"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-bounce delay-75"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse delay-150"></div>
            </div>
          </div>
          <div className="space-y-5">
            {singleCoupon.map((m, i) => (
              <div key={i} className="relative pl-4 border-l-2 border-yellow-500/20 pb-1">
                <div className="flex justify-between text-[8px] text-slate-500 mb-1 font-bold uppercase"><span>{m.league.name}</span><span>{new Date(m.fixture.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div>
                <div className="flex justify-between font-black text-xs mb-2"><span>{m.teams.home.name}</span><span>{m.teams.away.name}</span></div>
                <div className="text-[10px] font-black uppercase" style={{color: getSmartAnalysis(m, i).col}}>{getSmartAnalysis(m, i).tip}</div>
              </div>
            ))}
          </div>
        </section>

        {/* RADAR HISTORIQUE AVEC SCORES */}
        <section className="bg-sky-500/5 border border-sky-500/20 rounded-2xl overflow-hidden shadow-lg">
          <div className="bg-sky-500/10 p-3 flex justify-between items-center border-b border-sky-500/20">
            <div className="flex items-center gap-2 text-sky-400 font-black text-[10px] uppercase"><Clock className="w-4 h-4" /> Radar Historique (Buts 0'-30')</div>
          </div>
          <div className="divide-y divide-slate-800">
            {radarHistorique.length > 0 ? radarHistorique.map((m, i) => (
              <div key={i} className="p-4 flex justify-between items-center bg-[#11192e]/40">
                <div className="space-y-1">
                    <div className="text-[11px] font-black uppercase">{m.teams.home.name} - {m.teams.away.name}</div>
                    <div className="text-[9px] text-sky-400 font-bold bg-sky-500/10 w-fit px-2 py-0.5 rounded-full italic">Spécial 1ère Mi-temps</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <div className="text-xs font-black text-white">{m.goals.home} - {m.goals.away}</div>
                    <div className="text-[10px] text-sky-400 font-mono font-bold animate-pulse">{m.fixture.status.elapsed}'</div>
                </div>
              </div>
            )) : <p className="p-6 text-center text-[10px] text-slate-600 italic">Recherche de matchs à fort historique...</p>}
          </div>
        </section>

        {/* RADAR DANGER AVEC SCORES & PRESSION */}
        <section className="bg-orange-500/5 border border-orange-500/20 rounded-2xl overflow-hidden shadow-lg">
          <div className="bg-orange-500/10 p-3 flex justify-between items-center border-b border-orange-500/20 font-black text-[10px] uppercase text-orange-400">
            <div className="flex items-center gap-2"><Flame className="w-4 h-4 animate-bounce" /> Radar Danger (Score Imminent)</div>
          </div>
          <div className="divide-y divide-slate-800">
            {radarDanger.length > 0 ? radarDanger.map((m, i) => (
              <div key={i} className="p-4 bg-orange-500/[0.03]">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-[11px] font-black uppercase">{m.teams.home.name} - {m.teams.away.name}</div>
                  <div className="text-xs font-black text-orange-500">{m.goals.home} - {m.goals.away}</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-[8px] text-orange-400 font-black uppercase tracking-widest bg-orange-500/10 px-2 py-1 rounded-full border border-orange-500/20">
                    <Target className="w-3 h-3" /> Pression Offensive : {m.fixture.status.elapsed}'
                  </div>
                  <div className="text-[9px] text-slate-500 italic">Cible active</div>
                </div>
              </div>
            )) : <p className="p-6 text-center text-[10px] text-slate-600 italic">Analyse de la pression en cours...</p>}
          </div>
        </section>

      </main>

      <nav className="fixed bottom-0 inset-x-0 bg-[#11192e] border-t border-slate-800 p-5 flex justify-around items-center z-50">
        <TrendingUp className="text-yellow-500 w-6 h-6" /> <Zap className="text-slate-600 w-6 h-6" /> <Crown className="text-slate-600 w-6 h-6" />
      </nav>
    </div>
  );
}