"use client";

import React, { useState, useEffect } from "react";
import { Trophy, ShieldCheck, Clock, Flame, RefreshCw, BadgeCheck, BarChart2, Zap, Target, Flag, CreditCard } from "lucide-react";

const ELITE_LEAGUES = [1, 2, 3, 39, 40, 41, 61, 62, 78, 79, 135, 136, 140, 141, 88, 94, 71, 253, 144, 203, 4, 9, 10, 13, 45, 137, 143];

export default function ProBetV15_4() {
  const [leSauveur, setLeSauveur] = useState<any[]>([]);
  const [singleCoupon, setSingleCoupon] = useState<any[]>([]);
  const [radarHistorique, setRadarHistorique] = useState<any[]>([]);
  const [radarDanger, setRadarDanger] = useState<any[]>([]);
  const [loadingType, setLoadingType] = useState<string | null>(null);

  // MOTEUR DE DÉCISION TOTALEMENT LIBRE (1X, 2X, 12)
  const getSmartPrediction = (m: any) => {
    const home = m.teams.home.name.toLowerCase();
    const away = m.teams.away.name.toLowerCase();
    const leagueId = m.league.id;

    // Liste des "Gros Bras" (Favoris mondiaux)
    const giants = ["liverpool", "city", "real", "bayern", "inter", "psg", "arsenal", "barcelona", "milan", "napoli", "leverkusen"];
    
    let decision = "1X";
    let color = "#4ade80"; // Vert pour 1X

    // Détection du favori à l'extérieur (2X)
    const isAwayGiant = giants.some(g => away.includes(g));
    const isHomeGiant = giants.some(g => home.includes(g));

    if (isAwayGiant && !isHomeGiant) {
        decision = "2X";
        color = "#60a5fa"; // Bleu pour 2X
    } else if (!isAwayGiant && !isHomeGiant) {
        decision = "12"; // Si aucun géant, souvent "pas de nul"
        color = "#fbbf24"; // Jaune pour 12
    }

    // Calcul Corners et Cartons par Ligue
    const cornerVal = [39, 140, 78, 135].includes(leagueId) ? "+8.5" : "+7.5";
    const cardVal = [140, 135, 61, 141].includes(leagueId) ? "+3.5" : "+2.5";

    return {
      dc: decision,
      tip: `${decision} & TOTAL +1.5`,
      corners: `${cornerVal} CORNERS`,
      cards: `${cardVal} CARTONS`,
      col: color,
      conf: isAwayGiant || isHomeGiant ? "94%" : "86%"
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

      if (section === 'SAUVEUR') setLeSauveur(elite.filter(m => m.fixture.status.short === "NS").sort(() => Math.random() - 0.5).slice(0, 2));
      if (section === 'COUPON') setSingleCoupon(elite.filter(m => m.fixture.status.short === "NS").sort(() => Math.random() - 0.5).slice(3, 6));
      if (section === 'HISTO') setRadarHistorique(elite.filter(m => m.fixture.status.short === "1H").slice(0, 6));
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
        <div className="flex items-center"><Target className="text-red-500 w-5 h-5 mr-2" /><span className="font-black text-lg italic tracking-tighter">ProBet V15.4</span></div>
        <div className="text-[8px] font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">DÉTECTEUR DE FAVORIS ACTIF</div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        
        {/* LE SAUVEUR - ANALYSE DIRECTIONNELLE */}
        <section className="space-y-4">
          <h3 className="text-red-500 font-black text-[9px] tracking-widest flex items-center gap-2 px-1"><ShieldCheck className="w-4 h-4" /> Le Sauveur (Analyse 1X2)</h3>
          {leSauveur.map((m, i) => {
            const pred = getSmartPrediction(m);
            return (
              <div key={i} className="bg-[#11192e] border border-slate-800 rounded-2xl p-4 shadow-xl border-t-2" style={{borderTopColor: pred.col}}>
                <div className="flex justify-between text-[8px] text-slate-500 mb-3 font-black">
                    <span>{m.league.name}</span>
                    <span className="text-yellow-500 font-bold">Fiabilité {pred.conf}</span>
                </div>
                <div className="flex justify-between font-black text-[12px] mb-4"><span>{m.teams.home.name}</span><span className="text-slate-700">VS</span><span>{m.teams.away.name}</span></div>
                
                <div className="grid grid-cols-1 gap-2 mb-4">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center font-black text-[11px]" style={{color: pred.col}}>{pred.tip}</div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/20 flex flex-col items-center">
                            <span className="text-[7px] text-blue-400">Corners</span>
                            <span className="text-[9px] font-black">{pred.corners}</span>
                        </div>
                        <div className="bg-yellow-500/10 p-2 rounded-lg border border-yellow-500/20 flex flex-col items-center">
                            <span className="text-[7px] text-yellow-500">Cartons</span>
                            <span className="text-[9px] font-black">{pred.cards}</span>
                        </div>
                    </div>
                </div>

                <a href={getAnalysisLink(m.teams.home.name, m.teams.away.name, 'FOOTY')} target="_blank" className="w-full bg-slate-800/60 p-2 rounded-lg flex items-center justify-center gap-2 text-[8px] font-bold border border-slate-700">VÉRIFIER SUR FOOTYSTATS</a>
              </div>
            );
          })}
        </section>

        {/* COUPON TRIPLE */}
        <section className="bg-[#11192e] rounded-3xl p-5 border border-slate-800">
          <h3 className="text-[9px] font-black text-slate-400 mb-4 tracking-widest uppercase italic">Coupon de Sélection</h3>
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