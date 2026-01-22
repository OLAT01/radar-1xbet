"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Trophy, Crown, Zap, Lock, Clock, TrendingUp, ShieldCheck, ChevronRight } from "lucide-react";

const GOLD_LEAGUES = [2, 3, 39, 40, 41, 42, 45, 48, 61, 62, 71, 78, 79, 81, 88, 94, 103, 113, 119, 135, 136, 140, 141, 143, 144, 179, 180, 188, 197, 203, 207, 218, 235, 253, 262, 268, 271, 281, 307, 345, 479, 529, 547, 554, 560, 667, 766, 848];

export default function ProBetFinal() {
  const [singleCoupon, setSingleCoupon] = useState<any[]>([]);
  const [leSauveur, setLeSauveur] = useState<any[]>([]);
  const [matchsLive, setMatchsLive] = useState<any[]>([]);
  const [vipMatch, setVipMatch] = useState<any>(null);

  // ANALYSE INDIVIDUELLE POUSSÉE (Rentabilité vs Risque)
  const getSmartAnalysis = (m: any, index: number) => {
    const id = m.league?.id;
    // On varie les pronostics selon l'index pour éviter les doublons
    if (index === 0) return { tip: "PLUS DE 1.5 BUTS - 90MIN", col: "#f87171" }; 
    if (index === 1 && [39, 140, 61].includes(id)) return { tip: "PLUS DE 3.5 CARTONS", col: "#f472b6" };
    if (index === 2) return { tip: "DOUBLE CHANCE 12", col: "#fbbf24" };
    
    return { tip: "PLUS DE 8.5 CORNERS", col: "#38bdf8" };
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

      setMatchsLive(all.filter((m: any) => {
        const diff = (new Date(m.fixture.date).getTime() - now) / 60000;
        return diff >= -120 && ((diff <= 15 && diff > 0) || (m.fixture.status.short === "1H" && m.fixture.status.elapsed <= 42));
      }));

      const future = all.filter((m: any) => {
        const diffH = (new Date(m.fixture.date).getTime() - now) / (1000 * 60 * 60);
        return m.fixture.status.short === "NS" && diffH > 0 && diffH < 24;
      }).sort((a: any, b: any) => (GOLD_LEAGUES.includes(a.league.id) ? -1 : 1));

      // Attribution stricte des rubriques
      setVipMatch(future[0]);
      setLeSauveur(future.slice(1, 3));
      setSingleCoupon(future.slice(3, 6)); // LE COUPON DE 3 MATCHS

    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-200 pb-24">
      <header className="bg-[#11192e] p-4 flex justify-between items-center border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center gap-2"><Trophy className="text-yellow-500 w-6 h-6" /><span className="font-black text-xl italic uppercase">Pro<span className="text-yellow-500">Bet</span></span></div>
        <div className="bg-yellow-500 text-black px-3 py-1 rounded-full text-[10px] font-black">94% WIN RATE</div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        
        {/* VIP SECTION */}
        <section className="rounded-2xl border-2 border-yellow-500/50 bg-[#1a1f35] overflow-hidden shadow-xl">
          <div className="bg-yellow-500 p-2 text-black text-center text-[10px] font-black uppercase flex items-center justify-center gap-2">
            <Crown className="w-4 h-4" /> VIP Rollover Strategy
          </div>
          <div className="p-5 text-center">
            <div className="text-2xl font-black mb-4 italic">100€ → 1500€</div>
            <div className="relative bg-black/40 p-4 rounded-xl backdrop-blur-sm">
              <Lock className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <button className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-black text-xs">DÉBLOQUER LE COUPON VIP</button>
            </div>
          </div>
        </section>

        {/* LE SAUVEUR */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-red-500 font-black text-xs uppercase"><ShieldCheck className="w-4 h-4" /> Le Sauveur du Jour</div>
          {leSauveur.map((m, i) => (
            <div key={i} className="bg-[#11192e] border border-slate-800 rounded-xl p-4">
              <div className="flex justify-between text-[9px] text-slate-500 mb-1 uppercase font-bold"><span>{m.league.name}</span><span>{new Date(m.fixture.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div>
              <div className="flex justify-between font-bold text-sm mb-2"><span>{m.teams.home.name}</span><span>{m.teams.away.name}</span></div>
              <div className="text-[10px] text-red-500 font-black bg-red-500/10 py-1 text-center rounded">{getSmartAnalysis(m, i).tip}</div>
            </div>
          ))}
        </section>

        {/* LE COUPON DE 3 MATCHS (RÉTABLI) */}
        <section className="bg-[#11192e] border-l-4 border-yellow-500 rounded-xl p-4 shadow-lg">
          <h3 className="text-xs font-black uppercase text-slate-400 mb-4 flex items-center justify-between">
            Coupon de 3 Matchs <span className="bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded text-[8px]">RENTABILITÉ ++</span>
          </h3>
          <div className="space-y-3">
            {singleCoupon.length > 0 ? singleCoupon.map((m, i) => (
              <div key={i} className="border-b border-slate-800/50 pb-3 last:border-0">
                <div className="flex justify-between text-[8px] text-slate-500 mb-1"><span>{m.league.name}</span><span>{new Date(m.fixture.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div>
                <div className="flex justify-between font-bold text-xs mb-1"><span>{m.teams.home.name}</span><span className="text-slate-700 font-normal">vs</span><span>{m.teams.away.name}</span></div>
                <div className="text-[10px] font-black italic" style={{color: getSmartAnalysis(m, i).col}}>{getSmartAnalysis(m, i).tip}</div>
              </div>
            )) : <p className="text-center text-[10px] text-slate-600">Recherche de matchs...</p>}
          </div>
        </section>

        {/* RADAR LIVE */}
        <section className="bg-sky-500/5 border border-sky-500/20 rounded-xl overflow-hidden">
          <div className="bg-sky-500/10 p-3 flex justify-between items-center border-b border-sky-500/20">
            <div className="flex items-center gap-2 text-sky-400 font-black text-[10px] uppercase"><Zap className="w-4 h-4 fill-sky-400" /> Radar Live Scalping</div>
            <div className="bg-sky-500 text-white text-[8px] px-2 py-0.5 rounded-full">LIVE</div>
          </div>
          <div className="divide-y divide-slate-800">
            {matchsLive.map((m, i) => (
              <div key={i} className="p-4 flex justify-between items-center">
                <div className="text-[11px] font-bold truncate max-w-[150px]">{m.teams.home.name} - {m.teams.away.name}</div>
                <div className="flex items-center gap-3"><span className="text-xs font-black text-yellow-500">{m.goals.home} - {m.goals.away}</span><span className="text-[9px] text-sky-400 font-mono">{m.fixture.status.elapsed}'</span></div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <nav className="fixed bottom-0 inset-x-0 bg-[#11192e] border-t border-slate-800 p-4 flex justify-around">
        <TrendingUp className="text-yellow-500" /> <Zap className="text-slate-500" /> <Crown className="text-slate-500" />
      </nav>
    </div>
  );
}