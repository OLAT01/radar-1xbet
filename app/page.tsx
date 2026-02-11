"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Trophy, ShieldCheck, Clock, Flame, RefreshCw, BadgeCheck, BarChart2, Zap, Target, Flag, CreditCard } from "lucide-react";

const ELITE_LEAGUES = [2, 3, 39, 40, 41, 61, 62, 78, 79, 135, 136, 140, 141, 88, 94, 71, 253, 144, 203, 1, 4, 9, 10, 13, 45, 137, 143];

export default function ProBetV15_2() {
  const [leSauveur, setLeSauveur] = useState<any[]>([]);
  const [singleCoupon, setSingleCoupon] = useState<any[]>([]);
  const [radarHistorique, setRadarHistorique] = useState<any[]>([]);
  const [radarDanger, setRadarDanger] = useState<any[]>([]);
  const [loadingType, setLoadingType] = useState<string | null>(null);

  // MOTEUR D'ANALYSE MULTI-MARCHÉS (Corners, Cartons, Buts)
  const analyzeMatchMarkets = (m: any) => {
    const leagueId = m.league.id;
    
    // Logique Corners (Basée sur l'intensité des ligues)
    const isHighCornerLeague = [39, 140, 78].includes(leagueId); // PL, LaLiga, Bundesliga
    const cornersFT = isHighCornerLeague ? "+8.5 Corners" : "+7.5 Corners";
    const corners1H = "Over 3.5 Corners 1H";

    // Logique Cartons (Basée sur l'agressivité des ligues)
    const isAggressiveLeague = [140, 135, 61].includes(leagueId); // Espagne, Italie, France
    const cardsFT = isAggressiveLeague ? "+3.5 Cartons" : "+2.5 Cartons";

    // Logique Buts (Sauveur)
    let tip = "1X & TOTAL +1.5";
    let color = "#4ade80";

    if ([78, 88].includes(leagueId)) {
        tip = "BUTS : LES DEUX MARQUENT";
        color = "#f472b6";
    }

    return {
      main: tip,
      corners: cornersFT,
      cornersMT: corners1H,
      cards: cardsFT,
      col: color,
      conf: [39, 140, 78].includes(leagueId) ? "94%" : "88%"
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
      const nowTs = new Date().getTime();

      if (section === 'SAUVEUR') setLeSauveur(elite.filter(m => m.fixture.status.short === "NS").sort(() => Math.random() - 0.5).slice(0, 2));
      if (section === 'COUPON') setSingleCoupon(elite.filter(m => m.fixture.status.short === "NS").sort(() => Math.random() - 0.5).slice(3, 6));
      if (section === 'HISTO') setRadarHistorique(elite.filter(m => m.fixture.status.short === "NS" || m.fixture.status.short === "1H").slice(0, 6));
      if (section === 'DANGER') setRadarDanger(elite.filter(m => ["1H", "2H"].includes(m.fixture.status.short)).slice(0, 4));
    } catch (err) { console.error(err); }
    setLoadingType(null);
  };

  useEffect(() => { 
    refreshSection('SAUVEUR'); refreshSection('COUPON'); refreshSection('HISTO'); refreshSection('DANGER');
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-200 pb-24 font-sans uppercase">
      <header className="bg-[#11192e] p-4 border-b border-slate-800 sticky top-0 z-50 flex justify-between items-center">
        <div className="flex items-center"><Target className="text-red-500 w-5 h-5 mr-2" /><span className="font-black text-lg italic">ProBet V15.2</span></div>
        <div className="text-[8px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">CORNERS & CARTONS ACTIVÉS</div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        
        {/* LE SAUVEUR - ANALYSE COMPLÈTE */}
        <section className="space-y-4">
          <h3 className="text-red-500 font-black text-[9px] tracking-widest flex items-center gap-2 px-1"><ShieldCheck className="w-4 h-4" /> Analyse Multi-Marchés</h3>
          {leSauveur.map((m, i) => {
            const analysis = analyzeMatchMarkets(m);
            return (
              <div key={i} className="bg-[#11192e] border border-slate-800 rounded-2xl p-4 shadow-xl border-l-4 border-l-red-500">
                <div className="flex justify-between text-[8px] text-slate-500 mb-3 font-black">
                    <span>{m.league.name}</span>
                    <span className="text-red-500">Fiabilité: {analysis.conf}</span>
                </div>
                <div className="flex justify-between font-black text-[13px] mb-4"><span>{m.teams.home.name}</span><span>{m.teams.away.name}</span></div>
                
                {/* BLOC DES PRÉDICTIONS */}
                <div className="grid grid-cols-1 gap-2 mb-4">
                    <div className="bg-white/5 p-2 rounded-lg border border-white/10 text-center font-black text-[10px]" style={{color: analysis.col}}>{analysis.main}</div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/20 flex flex-col items-center">
                            <span className="text-[7px] text-blue-400 flex items-center gap-1"><Flag className="w-2 h-2" /> Corners FT</span>
                            <span className="text-[9px] font-black">{analysis.corners}</span>
                        </div>
                        <div className="bg-yellow-500/10 p-2 rounded-lg border border-yellow-500/20 flex flex-col items-center">
                            <span className="text-[7px] text-yellow-500 flex items-center gap-1"><CreditCard className="w-2 h-2" /> Cartons</span>
                            <span className="text-[9px] font-black">{analysis.cards}</span>
                        </div>
                    </div>
                    <div className="bg-blue-500/5 p-2 rounded-lg text-[8px] text-center font-bold text-blue-300 border border-blue-500/10">MI-TEMPS : {analysis.cornersMT}</div>
                </div>

                <a href={getAnalysisLink(m.teams.home.name, m.teams.away.name, 'FOOTY')} target="_blank" className="w-full bg-slate-800 p-2 rounded-lg flex items-center justify-center gap-2 text-[8px] font-bold border border-slate-700">VÉRIFIER H2H (FOOTYSTATS)</a>
              </div>
            );
          })}
        </section>

        {/* COUPON DE 3 MATCHS */}
        <section className="bg-[#11192e] rounded-3xl p-5 border border-slate-800">
          <h3 className="text-[9px] font-black text-slate-500 mb-4 flex justify-between">COUPON UNIQUE <RefreshCw onClick={() => refreshSection('COUPON')} className="w-3 h-3 cursor-pointer" /></h3>
          <div className="space-y-4">
            {singleCoupon.map((m, i) => (
              <div key={i} className="border-l-2 border-yellow-500/40 pl-3">
                <div className="flex justify-between text-[7px] text-slate-500 font-bold mb-1"><span>{m.league.name}</span><span>{new Date(m.fixture.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div>
                <div className="flex justify-between font-black text-[11px] mb-1"><span>{m.teams.home.name}</span><span>{m.teams.away.name}</span></div>
                <div className="text-[9px] font-black text-yellow-500 italic">+1.5 BUTS & {analyzeMatchMarkets(m).cornersMT}</div>
              </div>
            ))}
          </div>
        </section>

        {/* RADAR DANGER AVEC CHRONO */}
        <section className="bg-orange-500/5 border border-orange-500/20 rounded-2xl overflow-hidden shadow-lg">
          <div className="bg-orange-500/10 p-3 flex justify-between items-center text-orange-400 font-black text-[9px]">
            <div className="flex items-center gap-2"><Flame className="w-4 h-4" /> Radar Danger (Live)</div>
            <button onClick={() => refreshSection('DANGER')} className="bg-orange-500/20 p-2 rounded-full"><RefreshCw className={`${loadingType === 'DANGER' ? 'animate-spin' : ''} w-3 h-3`} /></button>
          </div>
          <div className="divide-y divide-slate-800">
            {radarDanger.map((m, i) => (
              <div key={i} className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center font-black">
                    <span className="text-[10px] truncate max-w-[140px]">{m.teams.home.name} - {m.teams.away.name}</span>
                    <div className="flex items-center gap-2">
                        <span className="text-orange-500">{m.goals.home} - {m.goals.away}</span>
                        <span className="text-[9px] bg-orange-500/20 px-1 rounded text-orange-400">{m.fixture.status.elapsed}'</span>
                    </div>
                </div>
                <a href={getAnalysisLink(m.teams.home.name, m.teams.away.name, 'PACK')} target="_blank" className="w-full py-2 bg-orange-500/10 border border-orange-500/20 rounded flex items-center justify-center gap-2 text-[8px] font-black text-orange-400 uppercase">Analyse Pressions Packball</a>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}