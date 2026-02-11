"use client";

import React, { useState, useEffect } from "react";
import { Trophy, ShieldCheck, Clock, Flame, RefreshCw, Target, Flag, CreditCard, BarChart2, Zap } from "lucide-react";

const ELITE_LEAGUES = [1, 2, 3, 39, 40, 41, 61, 62, 78, 79, 135, 136, 140, 141, 88, 94, 71, 253, 144, 203, 4, 9, 10, 13, 45, 137, 143];

export default function ProBetV15_5() {
  const [leSauveur, setLeSauveur] = useState<any[]>([]);
  const [singleCoupon, setSingleCoupon] = useState<any[]>([]);
  const [radarHistorique, setRadarHistorique] = useState<any[]>([]);
  const [radarDanger, setRadarDanger] = useState<any[]>([]);
  const [loadingType, setLoadingType] = useState<string | null>(null);

  const getSmartPrediction = (m: any) => {
    if (!m || !m.teams) return { dc: "1X", tip: "Analyse...", col: "#4ade80" };
    const home = m.teams.home.name.toLowerCase();
    const away = m.teams.away.name.toLowerCase();
    const giants = ["liverpool", "city", "real", "bayern", "inter", "psg", "arsenal", "barca", "milan", "napoli", "leverkusen", "chelsea", "united", "juventus"];
    
    let decision = "1X";
    let color = "#4ade80"; 

    if (giants.some(g => away.includes(g)) && !giants.some(g => home.includes(g))) {
        decision = "2X";
        color = "#60a5fa"; 
    } else if (!giants.some(g => away.includes(g)) && !giants.some(g => home.includes(g))) {
        decision = "12";
        color = "#fbbf24"; 
    }

    return {
      dc: decision,
      tip: `${decision} & +1.5 BUTS`,
      corners: [39, 140, 78].includes(m.league.id) ? "+8.5 CORNERS" : "+7.5 CORNERS",
      cards: [140, 135, 61].includes(m.league.id) ? "+3.5 CARTONS" : "+2.5 CARTONS",
      col: color
    };
  };

  const getAnalysisLink = (home: string, away: string, type: 'FOOTY' | 'PACK') => {
    const query = encodeURIComponent(`${home} vs ${away}`);
    return type === 'FOOTY' ? `https://footystats.org/fr/search?q=${query}` : `https://www.google.com/search?q=Packball+live+stats+${query}`;
  };

  const refreshAll = async () => {
    setLoadingType('GLOBAL');
    try {
      const today = new Date().toISOString().split('T')[0];
      const resp = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}&timezone=Africa/Bamako`, {
        method: "GET",
        headers: { "x-rapidapi-key": "7457ba7f869c23967e70d6f9edce7099", "x-rapidapi-host": "v3.football.api-sports.io" }
      });
      const data = await resp.json();
      const elite = (data.response || []).filter((m: any) => ELITE_LEAGUES.includes(m.league.id));

      setLeSauveur(elite.filter(m => m.fixture.status.short === "NS").slice(0, 2));
      setSingleCoupon(elite.filter(m => m.fixture.status.short === "NS").slice(2, 5));
      setRadarHistorique(elite.filter(m => ["1H", "2H"].includes(m.fixture.status.short)).slice(0, 6));
      setRadarDanger(elite.filter(m => ["1H", "2H"].includes(m.fixture.status.short)).slice(4, 8));
    } catch (err) { console.error("Erreur API"); }
    setLoadingType(null);
  };

  useEffect(() => { refreshAll(); }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-200 pb-24 font-sans uppercase">
      <header className="bg-[#11192e] p-4 border-b border-slate-800 sticky top-0 z-50 flex justify-between items-center shadow-xl">
        <div className="flex items-center"><Target className="text-red-500 w-5 h-5 mr-2" /><span className="font-black text-lg italic tracking-tighter">ProBet V15.5 ELITE</span></div>
        <button onClick={refreshAll} className="p-2 bg-slate-800 rounded-full"><RefreshCw className={loadingType ? "animate-spin" : ""} size={16} /></button>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-8">
        
        {/* 1. SECTION SAUVEUR */}
        <section className="space-y-4">
          <h3 className="text-red-500 font-black text-[9px] tracking-widest flex items-center gap-2 px-1"><ShieldCheck size={16} /> Le Sauveur (Analyse 1X2)</h3>
          {leSauveur.map((m, i) => {
            const pred = getSmartPrediction(m);
            return (
              <div key={i} className="bg-[#11192e] border border-slate-800 rounded-2xl p-4 shadow-xl border-t-2" style={{borderTopColor: pred.col}}>
                <div className="flex justify-between font-black text-[12px] mb-4"><span>{m.teams.home.name}</span><span className="text-slate-700">VS</span><span>{m.teams.away.name}</span></div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center font-black text-[11px] mb-3" style={{color: pred.col}}>{pred.tip}</div>
                <div className="grid grid-cols-2 gap-2 text-[9px] font-black italic text-center mb-4">
                    <div className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/20 text-blue-400">{pred.corners}</div>
                    <div className="bg-yellow-500/10 p-2 rounded-lg border border-yellow-500/20 text-yellow-500">{pred.cards}</div>
                </div>
                <a href={getAnalysisLink(m.teams.home.name, m.teams.away.name, 'FOOTY')} target="_blank" className="w-full bg-slate-800/60 p-2 rounded-lg flex items-center justify-center gap-2 text-[8px] font-bold border border-slate-700">VÉRIFIER FOOTYSTATS</a>
              </div>
            );
          })}
        </section>

        {/* 2. UNIQUE COUPON (3 MATCHS) */}
        <section className="bg-[#11192e] rounded-3xl p-5 border border-slate-800 shadow-2xl">
          <h3 className="text-[9px] font-black text-slate-400 mb-4 tracking-widest italic">Coupon de Sélection (3 Matchs)</h3>
          <div className="space-y-4">
            {singleCoupon.map((m, i) => {
              const pred = getSmartPrediction(m);
              return (
                <div key={i} className="border-l-2 pl-3" style={{borderLeftColor: pred.col}}>
                  <div className="flex justify-between text-[7px] text-slate-500 font-bold mb-1"><span>{m.league.name}</span><span>{new Date(m.fixture.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div>
                  <div className="flex justify-between font-black text-[11px] mb-1"><span>{m.teams.home.name}</span><span>{m.teams.away.name}</span></div>
                  <div className="text-[9px] font-black" style={{color: pred.col}}>{pred.tip}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. RADAR HISTORIQUE */}
        <section className="bg-sky-500/5 border border-sky-500/20 rounded-2xl overflow-hidden">
          <div className="bg-sky-500/10 p-3 flex justify-between items-center text-sky-400 font-black text-[9px]">
            <div className="flex items-center gap-2"><Clock size={14} /> Radar Historique</div>
          </div>
          <div className="divide-y divide-slate-800">
            {radarHistorique.map((m, i) => (
              <div key={i} className="p-4 flex justify-between items-center bg-[#11192e]/40">
                <div className="text-[10px] font-black truncate max-w-[140px]">{m.teams.home.name} - {m.teams.away.name}</div>
                <div className="flex gap-3 items-center">
                    <span className="text-[14px] font-black text-yellow-500">{m.goals.home} - {m.goals.away}</span>
                    <span className="text-[10px] text-sky-400 font-mono animate-pulse">{m.fixture.status.elapsed}'</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. RADAR DANGER */}
        <section className="bg-orange-500/5 border border-orange-500/20 rounded-2xl overflow-hidden">
          <div className="bg-orange-500/10 p-3 flex justify-between items-center text-orange-400 font-black text-[9px]">
            <div className="flex items-center gap-2"><Flame size={14} /> Signal Pression Packball</div>
          </div>
          {radarDanger.map((m, i) => (
            <div key={i} className="p-4 bg-orange-500/[0.03] flex flex-col gap-3 border-b border-slate-800">
                <div className="flex justify-between items-center font-black">
                    <span className="text-[10px] truncate max-w-[150px]">{m.teams.home.name} - {m.teams.away.name}</span>
                    <span className="text-orange-500">{m.goals.home} - {m.goals.away} ({m.fixture.status.elapsed}')</span>
                </div>
                <a href={getAnalysisLink(m.teams.home.name, m.teams.away.name, 'PACK')} target="_blank" className="w-full py-2 bg-orange-500/10 border border-orange-500/20 rounded flex items-center justify-center gap-2 text-[8px] font-black text-orange-400 uppercase tracking-tighter"><Zap size={12} /> Voir Attaques Dangereuses</a>
            </div>
          ))}
        </section>

      </main>
    </div>
  );
}