"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Trophy, Crown, Zap, ShieldCheck, Flame, Target, RefreshCw, Clock } from "lucide-react";

const GOLD_LEAGUES = [2, 3, 39, 40, 41, 42, 45, 48, 61, 62, 71, 78, 79, 81, 88, 94, 103, 113, 119, 135, 136, 140, 141, 143, 144, 179, 180, 188, 197, 203, 207, 218, 235, 253, 262, 268, 271, 281, 307, 345, 479, 529, 547, 554, 560, 667, 766, 848];

export default function ProBetV12() {
  const [singleCoupon, setSingleCoupon] = useState<any[]>([]);
  const [leSauveur, setLeSauveur] = useState<any[]>([]);
  const [radarHistorique, setRadarHistorique] = useState<any[]>([]);
  const [radarDanger, setRadarDanger] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadTime, setLoadTime] = useState<number>(0);

  // LOGIQUE D'ANALYSE COMPLÈTE (100% conforme à ta demande)
  const getSmartAnalysis = (m: any, index: number) => {
    const leagueId = m.league?.id;
    const homeTeam = m.teams.home.name;
    
    // On varie les prédictions selon l'index du match dans la liste
    switch(index % 6) {
      case 0: return { tip: "TOTAL : +1.5 BUTS", col: "#f87171" }; // 1. Total but
      case 1: return { tip: "CORNERS : +8.5", col: "#38bdf8" };    // 2. Total corner
      case 2: return { tip: "CARTONS : +3.5", col: "#f472b6" };    // 3. Total carton
      case 3: return { tip: "DOUBLE CHANCE : 12", col: "#fbbf24" }; // 4. Double chance 12
      case 4: 
        const goals = ["+0.5", "+1.5", "+2.5"][Math.floor(Math.random() * 3)];
        return { tip: `INDIVIDUEL ${homeTeam} : ${goals} BUTS`, col: "#4ade80" }; // 5. Total individuel but
      case 5:
        const corners = ["+4.5", "+5.5", "+6.5"][Math.floor(Math.random() * 3)];
        return { tip: `INDIVIDUEL ${homeTeam} : ${corners} CORNERS`, col: "#a78bfa" }; // 6. Total individuel corner
      default: return { tip: "PLUS DE 1.5 BUTS", col: "#f87171" };
    }
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
      const nowTs = new Date().getTime();
      setLoadTime(nowTs);

      // RADAR HISTORIQUE (Disparition 42')
      setRadarHistorique(all.filter((m: any) => {
        const diffMin = (new Date(m.fixture.date).getTime() - nowTs) / 60000;
        const isTimeWindow = (diffMin <= 15 && diffMin > 0) || (m.fixture.status.short === "1H" && m.fixture.status.elapsed <= 42);
        return [39, 78, 88, 2, 135].includes(m.league?.id) && isTimeWindow;
      }));

      // RADAR DANGER (Scores visibles)
      setRadarDanger(all.filter((m: any) => ["1H", "2H"].includes(m.fixture.status.short) && GOLD_LEAGUES.includes(m.league?.id)).slice(0, 5));

      // COUPONS (Mélange aléatoire pour le bouton jaune)
      const future = all.filter((m: any) => m.fixture.status.short === "NS" && GOLD_LEAGUES.includes(m.league?.id))
                       .sort(() => Math.random() - 0.5);

      setLeSauveur(future.slice(0, 2));
      setSingleCoupon(future.slice(2, 5));
      setIsLoaded(true);
    } catch (err) { console.error(err); }
  }, []);

  // Timer de 20 min pour le Radar Danger
  useEffect(() => {
    if (isLoaded) {
      const timer = setInterval(() => {
        if ((new Date().getTime() - loadTime) / 60000 >= 20) setRadarDanger([]);
      }, 30000);
      return () => clearInterval(timer);
    }
  }, [isLoaded, loadTime]);

  useEffect(() => { if (!isLoaded) fetchAllData(); }, [isLoaded, fetchAllData]);

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-200 pb-24 font-sans">
      <header className="bg-[#11192e] p-4 flex justify-between items-center border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center gap-2"><Trophy className="text-yellow-500 w-6 h-6" /><span className="font-black text-xl italic uppercase">ProBet</span></div>
        <button onClick={fetchAllData} className="bg-yellow-500 text-black px-5 py-2 rounded-full font-black text-[11px] uppercase flex items-center gap-2 active:scale-95 shadow-lg shadow-yellow-500/20">
          <RefreshCw className="w-4 h-4" /> CHANGER MATCHS
        </button>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-8">
        {/* LE SAUVEUR DU JOUR */}
        <section className="space-y-4">
          <h3 className="flex items-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-widest"><ShieldCheck className="w-4 h-4" /> Le Sauveur du Jour</h3>
          {leSauveur.map((m, i) => (
            <div key={i} className="bg-[#11192e] border border-slate-800 rounded-2xl p-4 border-l-4 border-l-red-500">
              <div className="flex justify-between text-[8px] text-slate-500 mb-2 font-black uppercase"><span>{m.league.name}</span><span>{new Date(m.fixture.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div>
              <div className="flex justify-between font-black text-sm mb-3"><span>{m.teams.home.name}</span><span className="text-slate-700">vs</span><span>{m.teams.away.name}</span></div>
              <div className="text-[10px] text-red-500 font-black bg-red-500/5 py-2 text-center rounded-lg border border-red-500/20 uppercase">{getSmartAnalysis(m, i).tip}</div>
            </div>
          ))}
        </section>

        {/* UNIQUE COUPON (3 MATCHS) */}
        <section className="bg-[#11192e] rounded-2xl p-5 border border-slate-800 shadow-2xl relative">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black uppercase text-slate-400 italic">Unique Coupon (3 Matchs)</h3>
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-ping"></div>
          </div>
          <div className="space-y-6">
            {singleCoupon.map((m, i) => (
              <div key={i} className="relative pl-4 border-l-2 border-yellow-500/40">
                <div className="flex justify-between text-[8px] text-slate-500 mb-1 font-bold uppercase"><span>{m.league.name}</span><span>{new Date(m.fixture.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div>
                <div className="flex justify-between font-black text-[13px] mb-2"><span>{m.teams.home.name}</span><span>{m.teams.away.name}</span></div>
                <div className="text-[10px] font-black uppercase tracking-widest" style={{color: getSmartAnalysis(m, i + 2).col}}>{getSmartAnalysis(m, i + 2).tip}</div>
              </div>
            ))}
          </div>
        </section>

        {/* RADAR HISTORIQUE (Scores visibles + Disparition 42') */}
        <section className="bg-sky-500/5 border border-sky-500/20 rounded-2xl overflow-hidden shadow-lg">
          <div className="bg-sky-500/10 p-3 flex justify-between items-center text-sky-400 font-black text-[10px] uppercase border-b border-sky-500/20"><Clock className="w-4 h-4" /> Radar Historique (Buts Précoces)</div>
          <div className="divide-y divide-slate-800">
            {radarHistorique.length > 0 ? radarHistorique.map((m, i) => (
              <div key={i} className="p-4 flex justify-between items-center bg-[#11192e]/40">
                <div className="text-[11px] font-black uppercase max-w-[140px] truncate">{m.teams.home.name} - {m.teams.away.name}</div>
                <div className="flex gap-4 items-center">
                    <span className="text-[14px] font-black text-yellow-500 bg-black/40 px-2 py-1 rounded border border-white/5">{m.goals.home} - {m.goals.away}</span>
                    <span className="text-[10px] text-sky-400 font-mono font-bold animate-pulse">{m.fixture.status.elapsed}'</span>
                </div>
              </div>
            )) : <div className="p-6 text-center text-[10px] text-slate-600 italic uppercase">Recherche de but imminent...</div>}
          </div>
        </section>

        {/* RADAR DANGER (Scores visibles + Disparition 20') */}
        <section className="bg-orange-500/5 border border-orange-500/20 rounded-2xl overflow-hidden shadow-lg">
          <div className="bg-orange-500/10 p-3 text-orange-400 font-black text-[10px] uppercase flex items-center gap-2 border-b border-orange-500/20"><Flame className="w-4 h-4 animate-bounce" /> Radar Danger (Max 20 min)</div>
          <div className="divide-y divide-slate-800">
            {radarDanger.length > 0 ? radarDanger.map((m, i) => (
              <div key={i} className="p-4 bg-orange-500/[0.03]">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-[11px] font-black uppercase truncate max-w-[150px]">{m.teams.home.name} - {m.teams.away.name}</div>
                  <div className="text-[14px] font-black text-orange-500 bg-black/40 px-2 py-1 rounded border border-orange-500/20">{m.goals.home} - {m.goals.away}</div>
                </div>
                <div className="text-[8px] text-orange-400 font-black uppercase tracking-[0.2em] bg-orange-500/10 px-2 py-1 rounded-full w-fit flex items-center gap-1 font-sans"><Target className="w-3 h-3" /> Pression : {m.fixture.status.elapsed}'</div>
              </div>
            )) : <div className="p-6 text-center text-[10px] text-slate-600 italic uppercase">Section vide. Rafraîchissez pour voir la pression actuelle.</div>}
          </div>
        </section>
      </main>
    </div>
  );
}