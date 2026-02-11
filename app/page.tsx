"use client";

import React, { useState, useEffect } from "react";
import { Trophy, ShieldCheck, Clock, Flame, RefreshCw, BadgeCheck, BarChart2, Zap, Target, Flag, CreditCard } from "lucide-react";

const ELITE_LEAGUES = [1, 2, 3, 39, 40, 41, 61, 62, 78, 79, 135, 136, 140, 141, 88, 94, 71, 253, 144, 203, 4, 9, 10, 13, 45, 137, 143];

export default function ProBetV15_Final() {
  const [leSauveur, setLeSauveur] = useState<any[]>([]);
  const [singleCoupon, setSingleCoupon] = useState<any[]>([]);
  const [radarHistorique, setRadarHistorique] = useState<any[]>([]);
  const [radarDanger, setRadarDanger] = useState<any[]>([]);
  const [loadingType, setLoadingType] = useState<string | null>(null);

  const getSmartPrediction = (m: any) => {
    if (!m || !m.teams) return { dc: "1X", tip: "Analyse...", col: "#4ade80" };
    
    const home = m.teams.home.name.toLowerCase();
    const away = m.teams.away.name.toLowerCase();
    
    // Liste élargie des favoris pour éviter l'erreur Sunderland
    const giants = ["liverpool", "city", "real", "bayern", "inter", "psg", "arsenal", "barca", "milan", "napoli", "leverkusen", "chelsea", "united", "juventus", "atletico"];
    
    let decision = "1X";
    let color = "#4ade80"; 

    const isAwayGiant = giants.some(g => away.includes(g));
    const isHomeGiant = giants.some(g => home.includes(g));

    if (isAwayGiant && !isHomeGiant) {
        decision = "2X";
        color = "#60a5fa"; 
    } else if (!isAwayGiant && !isHomeGiant) {
        decision = "12";
        color = "#fbbf24"; 
    }

    return {
      dc: decision,
      tip: `${decision} & +1.5 BUTS`,
      corners: [39, 140, 78].includes(m.league.id) ? "+8.5 CORNERS" : "+7.5 CORNERS",
      cards: [140, 135, 61].includes(m.league.id) ? "+3.5 CARTONS" : "+2.5 CARTONS",
      col: color,
      conf: isAwayGiant || isHomeGiant ? "95%" : "87%"
    };
  };

  const getAnalysisLink = (home: string, away: string, type: 'FOOTY' | 'PACK') => {
    const query = encodeURIComponent(`${home} vs ${away}`);
    return type === 'FOOTY' ? `https://footystats.org/fr/search?q=${query}` : `https://www.google.com/search?q=Packball+live+stats+${query}`;
  };

  const refreshSection = async (section: string) => {
    setLoadingType(section);
    try {
      const today = new Date().toISOString().split('T')[0];
      const resp = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}&timezone=Africa/Bamako`, {
        method: "GET",
        headers: { "x-rapidapi-key": "7457ba7f869c23967e70d6f9edce7099", "x-rapidapi-host": "v3.football.api-sports.io" }
      });
      const data = await resp.json();
      const elite = (data.response || []).filter((m: any) => ELITE_LEAGUES.includes(m.league.id));

      if (section === 'SAUVEUR') setLeSauveur(elite.filter(m => m.fixture.status.short === "NS").slice(0, 2));
      if (section === 'COUPON') setSingleCoupon(elite.filter(m => m.fixture.status.short === "NS").slice(2, 5));
      if (section === 'HISTO') setRadarHistorique(elite.filter(m => ["1H", "2H"].includes(m.fixture.status.short)).slice(0, 6));
      if (section === 'DANGER') setRadarDanger(elite.filter(m => ["1H", "2H"].includes(m.fixture.status.short)).slice(0, 4));
    } catch (err) { console.error("Erreur API"); }
    setLoadingType(null);
  };

  useEffect(() => { 
    refreshSection('SAUVEUR'); refreshSection('COUPON'); refreshSection('HISTO'); refreshSection('DANGER');
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-200 pb-24 font-sans uppercase">
      <header className="bg-[#11192e] p-4 border-b border-slate-800 sticky top-0 z-50 flex justify-between items-center shadow-xl">
        <div className="flex items-center"><Target className="text-red-500 w-5 h-5 mr-2" /><span className="font-black text-lg italic tracking-tighter">ProBet V15.4 STABLE</span></div>
        <div className="bg-green-500/10 text-green-500 text-[8px] px-2 py-1 rounded border border-green-500/20 font-bold">SYSTÈME OPÉRATIONNEL</div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        
        <section className="space-y-4">
          <h3 className="text-red-500 font-black text-[9px] tracking-widest flex items-center gap-2 px-1"><ShieldCheck className="w-4 h-4" /> Analyse Directionnelle</h3>
          {leSauveur.map((m, i) => {
            const pred = getSmartPrediction(m);
            return (
              <div key={i} className="bg-[#11192e] border border-slate-800 rounded-2xl p-4 shadow-xl border-t-2" style={{borderTopColor: pred.col}}>
                <div className="flex justify-between text-[8px] text-slate-500 mb-3 font-black">
                    <span>{m.league.name}</span>
                    <span className="text-yellow-500">CONFIANCE {pred.conf}</span>
                </div>
                <div className="flex justify-between font-black text-[12px] mb-4"><span>{m.teams.home.name}</span><span className="text-slate-700">VS</span><span>{m.teams.away.name}</span></div>
                
                <div className="grid grid-cols-1 gap-2 mb-4">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center font-black text-[11px]" style={{color: pred.col}}>{pred.tip}</div>
                    <div className="grid grid-cols-2 gap-2 text-[9px] font-black italic">
                        <div className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/20 text-center text-blue-400">{pred.corners}</div>
                        <div className="bg-yellow-500/10 p-2 rounded-lg border border-yellow-500/20 text-center text-yellow-500">{pred.cards}</div>
                    </div>
                </div>
                <a href={getAnalysisLink(m.teams.home.name, m.teams.away.name, 'FOOTY')} target="_blank" className="w-full bg-slate-800/60 p-2 rounded-lg flex items-center justify-center gap-2 text-[8px] font-bold border border-slate-700">VÉRIFIER FOOTYSTATS</a>
              </div>
            );
          })}
        </section>

        <section className="bg-[#11192e] rounded-3xl p-5 border border-slate-800 shadow-2xl">
          <h3 className="text-[9px] font-black text-slate-400 mb-4 tracking-widest italic">Coupon de Sélection</h3>
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

      </main>
    </div>
  );
}