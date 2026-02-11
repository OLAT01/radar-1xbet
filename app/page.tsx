"use client";

import React, { useState, useEffect } from "react";
import { Trophy, ShieldCheck, Clock, Flame, RefreshCw, Target, Flag, CreditCard } from "lucide-react";

const ELITE_LEAGUES = [1, 2, 3, 39, 40, 41, 61, 62, 78, 79, 135, 136, 140, 141, 88, 94, 71, 253, 144, 203, 4, 9, 10, 13, 45, 137, 143];

export default function ProBetV15_Final() {
  const [leSauveur, setLeSauveur] = useState<any[]>([]);
  const [singleCoupon, setSingleCoupon] = useState<any[]>([]);
  const [loadingType, setLoadingType] = useState<string | null>(null);

  const getSmartPrediction = (m: any) => {
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

  const refreshSection = async () => {
    setLoadingType('REFRESH');
    try {
      const today = new Date().toISOString().split('T')[0];
      const resp = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}&timezone=Africa/Bamako`, {
        method: "GET",
        headers: { "x-rapidapi-key": "7457ba7f869c23967e70d6f9edce7099", "x-rapidapi-host": "v3.football.api-sports.io" }
      });
      const data = await resp.json();
      const elite = (data.response || []).filter((m: any) => ELITE_LEAGUES.includes(m.league.id));
      setLeSauveur(elite.slice(0, 2));
      setSingleCoupon(elite.slice(2, 5));
    } catch (err) { console.error("Erreur"); }
    setLoadingType(null);
  };

  useEffect(() => { refreshSection(); }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-200 pb-24 font-sans uppercase">
      <header className="bg-[#11192e] p-4 border-b border-slate-800 sticky top-0 z-50 flex justify-between items-center shadow-xl">
        <div className="flex items-center"><Target className="text-red-500 w-5 h-5 mr-2" /><span className="font-black text-lg italic tracking-tighter">ProBet V15.4 STABLE</span></div>
        <button onClick={refreshSection} className="p-2 bg-slate-800 rounded-full"><RefreshCw className={loadingType ? "animate-spin" : ""} size={16} /></button>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        <h3 className="text-red-500 font-black text-[9px] tracking-widest flex items-center gap-2 px-1"><ShieldCheck size={16} /> Analyse de Direction</h3>
        {leSauveur.map((m, i) => {
          const pred = getSmartPrediction(m);
          return (
            <div key={i} className="bg-[#11192e] border border-slate-800 rounded-2xl p-4 shadow-xl border-t-2" style={{borderTopColor: pred.col}}>
              <div className="flex justify-between font-black text-[12px] mb-4"><span>{m.teams.home.name}</span><span className="text-slate-700">VS</span><span>{m.teams.away.name}</span></div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center font-black text-[11px] mb-3" style={{color: pred.col}}>{pred.tip}</div>
              <div className="grid grid-cols-2 gap-2 text-[9px] font-black italic text-center">
                <div className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/20 text-blue-400">{pred.corners}</div>
                <div className="bg-yellow-500/10 p-2 rounded-lg border border-yellow-500/20 text-yellow-500">{pred.cards}</div>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}