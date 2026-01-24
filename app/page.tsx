"use client";

import React, { useState, useEffect, useCallback } from "react";
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

      // 1. RADAR HISTORIQUE (But précoce < 30min + SCORES VISIBLES)
      setRadarHistorique(all.filter((m: any) => {
        const diffMin = (new Date(m.fixture.date).getTime() - nowTs) / 60000;
        const isHighScoringLeague = [39, 78, 88, 2, 135].includes(m.league?.id);
        const isTimeWindow = (diffMin <= 15 && diffMin > 0) || (m.fixture.status.short === "1H" && m.fixture.status.elapsed <= 42);
        return isHighScoringLeague && isTimeWindow;
      }));

      // 2. RADAR DANGER (Tout moment + SCORES VISIBLES)
      setRadarDanger(all.filter((m: any) => 
        ["1H", "2H"].includes(m.fixture.status.short) && 
        GOLD_LEAGUES.includes(m.league?.id)
      ).slice(0, 4));

      // 3. SELECTION COUPON & SAUVEUR AVEC OFFSET
      const future = all.filter((m: any) => m.fixture.status.short === "NS" && GOLD_LEAGUES.includes(m.league?.id));
      const startIdx = currentOffset % (future.length > 5 ? future.length - 5 : 1);
      setVipMatch(future[startIdx] || null);
      setLeSauveur(future.slice(startIdx + 1, startIdx + 3));
      setSingleCoupon(future.slice(startIdx + 3, startIdx + 6));
    } catch (err) { console.error(err); }
  }, []);

  const handleRefresh = () => {
    const nextOffset = offset + 1;
    setOffset(nextOffset);
    fetchAllData(nextOffset);
  };

  useEffect(() => {
    fetchAllData(0);
    const interval = setInterval(() => fetchAllData(offset), 60000);
    return () => clearInterval(interval);
  }, [fetchAllData, offset]);

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-200 pb-24">
      <header className="bg-[#11192e] p-4 flex justify-between items-center border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center gap-2"><Trophy className="text-yellow-500 w-6 h-6" /><span className="font-black text-xl italic uppercase">ProBet</span></div>
        <button onClick={handleRefresh} className="bg-yellow-500 text-black px-4 py-1.5 rounded-full font-black text-[10px] uppercase flex items-center gap-2 active:scale-95">
          <RefreshCw className="w-3 h-3" /> Rafraîchir
        </button>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-8">
        {/* LE SAUVEUR */}
        <section className="space-y-4">
          <h3 className="flex items-center gap-2 text-red-500 font-black text-xs uppercase"><ShieldCheck className="w-4 h-4" /> Le Sauveur du Jour</h3>
          {leSauveur.map((m, i) => (
            <div key={i} className="bg-[#11192e] border border-slate-800 rounded-2xl p-4 shadow-xl border-l-4 border-l-red-500">
              <div className="flex justify-between text-[8px] text-slate-500 mb-2 font-black uppercase"><span>{m.league.name}</span><span>{new Date(m.fixture.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div>
              <div className="flex justify-between font-black text-sm mb-3"><span>{m.teams.home.name}</span><span className="text-slate-700 font-normal">vs</span><span>{m.teams.away.name}</span></div>
              <div className="text-[10px] text-red-500 font-black bg-red-500/5 py-2 text-center rounded-lg border border-red-500/20">{getSmartAnalysis(m, i).tip}</div>
            </div>
          ))}
        </section>

        {/* COUPON 3 MATCHS AVEC POINTS CLIGNOTANTS */}
        <section className="bg-[#11192e] rounded-2xl p-5 border border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black uppercase text-slate-400 italic">Unique Coupon (3 Matchs)</h3>
            <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-ping"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-bounce"></div>
            </div>
          </div>
          <div className="space-y-5">
            {singleCoupon.map((m, i) => (
              <div key={i} className="relative pl-4 border-l-2 border-yellow-500/20">
                <div className="flex justify-between text-[8px] text-slate-500 mb-1 font-bold uppercase"><span>{m.league.name}</span><span>{new Date(m.fixture.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div>
                <div className="flex justify-between font-black text-xs mb-2"><span>{m.teams.home.name}</span><span>{m.teams.away.name}</span></div>
                <div className="text-[10px] font-black uppercase" style={{color: getSmartAnalysis(m, i).col}}>{getSmartAnalysis(m, i).tip}</div>
              </div>
            ))}
          </div>
        </section>

        {/* RADARS AVEC SCORES RÉTABLIS */}
        <section className="bg-sky-500/5 border border-sky-500/20 rounded-2xl overflow-hidden shadow-lg">
          <div className="bg-sky-500/10 p-3 flex justify-between items-center text-sky-400 font-black text-[10px] uppercase"><Clock className="w-4 h-4" /> Radar Historique (Scores Live)</div>
          <div className="divide-y divide-slate-800">
            {radarHistorique.map((m, i) => (
              <div key={i} className="p-4 flex justify-between items-center">
                <div className="text-[11px] font-black uppercase">{m.teams.home.name} - {m.teams.away.name}</div>
                <div className="flex gap-4 items-center">
                    <span className="text-xs font-black text-white">{m.goals.home} - {m.goals.away}</span>
                    <span className="text-[10px] text-sky-400 font-mono font-bold">{m.fixture.status.elapsed}'</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-orange-500/5 border border-orange-500/20 rounded-2xl overflow-hidden shadow-lg">
          <div className="bg-orange-500/10 p-3 text-orange-400 font-black text-[10px] uppercase flex items-center gap-2"><Flame className="w-4 h-4 animate-bounce" /> Radar Danger (Score Imminent)</div>
          <div className="divide-y divide-slate-800">
            {radarDanger.map((m, i) => (
              <div key={i} className="p-4 bg-orange-500/[0.03]">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-[11px] font-black uppercase">{m.teams.home.name} - {m.teams.away.name}</div>
                  <div className="text-xs font-black text-orange-500">{m.goals.home} - {m.goals.away}</div>
                </div>
                <div className="text-[8px] text-orange-400 font-black uppercase tracking-widest bg-orange-500/10 px-2 py-1 rounded-full w-fit">Pression Active : {m.fixture.status.elapsed}'</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <nav className="fixed bottom-0 inset-x-0 bg-[#11192e] border-t border-slate-800 p-5 flex justify-around">
        <TrendingUp className="text-yellow-500" /> <Zap className="text-slate-600" /> <Crown className="text-slate-600" />
      </nav>
    </div>
  );
}