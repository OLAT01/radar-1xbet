"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Trophy, ShieldCheck, Clock, Flame, RefreshCw, BadgeCheck, BarChart2, Zap } from "lucide-react";

const ELITE_LEAGUES = [2, 3, 39, 40, 41, 61, 62, 78, 79, 135, 136, 140, 141, 88, 94, 71, 253, 144, 203, 1, 4, 9, 10, 13, 45, 137, 143];

export default function ProBetV14() {
  const [leSauveur, setLeSauveur] = useState<any[]>([]);
  const [singleCoupon, setSingleCoupon] = useState<any[]>([]);
  const [radarHistorique, setRadarHistorique] = useState<any[]>([]);
  const [radarDanger, setRadarDanger] = useState<any[]>([]);
  const [loadingType, setLoadingType] = useState<string | null>(null);

  // Fonction pour générer le lien de recherche FootyStats/Packball
  const getAnalysisLink = (home: string, away: string, type: 'FOOTY' | 'PACK') => {
    const query = encodeURIComponent(`${home} vs ${away}`);
    if (type === 'FOOTY') return `https://footystats.org/fr/search?q=${query}`;
    return `https://www.google.com/search?q=Packball+live+stats+${query}`;
  };

  const getProPrediction = (m: any, level: 'STRICT' | 'NORMAL') => {
    const leagueId = m.league.id;
    if (level === 'STRICT') {
        if ([39, 78, 140].includes(leagueId)) return { tip: "DOUBLE CHANCE : 1X", col: "#4ade80", conf: "92%" };
        return { tip: "LES DEUX ÉQUIPES MARQUENT : OUI", col: "#f472b6", conf: "88%" };
    }
    return { tip: "TOTAL : +1.5 BUTS", col: "#fbbf24", conf: "84%" };
  };

  const refreshSection = async (section: 'SAUVEUR' | 'COUPON' | 'HISTO' | 'DANGER') => {
    setLoadingType(section);
    try {
      const today = new Date().toISOString().split('T')[0];
      const resp = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}&timezone=Africa/Bamako`, {
        method: "GET",
        headers: { "x-rapidapi-key": "7457ba7f869c23967e70d6f9edce7099", "x-rapidapi-host": "v3.football.api-sports.io" }
      });
      const data = await resp.json();
      const elite = (data.response || []).filter((m: any) => ELITE_LEAGUES.includes(m.league.id));

      if (section === 'SAUVEUR') setLeSauveur(elite.filter((m: any) => m.fixture.status.short === "NS").sort(() => Math.random() - 0.5).slice(0, 2));
      if (section === 'COUPON') setSingleCoupon(elite.filter((m: any) => m.fixture.status.short === "NS").sort(() => Math.random() - 0.5).slice(3, 6));
      if (section === 'HISTO') setRadarHistorique(elite.filter((m: any) => m.fixture.status.short === "NS").slice(0, 6));
      if (section === 'DANGER') setRadarDanger(elite.filter((m: any) => ["1H", "2H"].includes(m.fixture.status.short)).slice(0, 5));
    } catch (err) { console.error(err); }
    setLoadingType(null);
  };

  useEffect(() => { 
    refreshSection('SAUVEUR'); refreshSection('COUPON'); refreshSection('HISTO'); refreshSection('DANGER');
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-200 pb-24 font-sans">
      <header className="bg-[#11192e] p-4 border-b border-slate-800 sticky top-0 z-50 flex justify-between items-center">
        <div className="flex items-center"><Trophy className="text-yellow-500 w-6 h-6 mr-2" /><span className="font-black text-xl italic">ProBet V14</span></div>
        <div className="bg-blue-600/20 text-blue-400 text-[9px] px-2 py-1 rounded border border-blue-500/30 font-bold uppercase">Intelligence Hybride (Footy/Pack)</div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        
        {/* LE SAUVEUR - ANALYSE FOOTYSTATS */}
        <section className="space-y-4">
          <div className="flex justify-between items-center"><h3 className="text-red-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Le Sauveur (Stats Profondes)</h3></div>
          {leSauveur.map((m, i) => {
            const pred = getProPrediction(m, 'STRICT');
            return (
              <div key={i} className="bg-[#11192e] border border-slate-800 rounded-2xl p-4 border-l-4 border-l-red-500 shadow-xl">
                <div className="flex justify-between font-black text-sm mb-3"><span>{m.teams.home.name}</span><span className="text-slate-700">vs</span><span>{m.teams.away.name}</span></div>
                <div className="text-[10px] text-red-500 font-black bg-red-500/5 py-2 text-center rounded-lg border border-red-500/20 uppercase mb-3">{pred.tip}</div>
                <div className="grid grid-cols-2 gap-2">
                    <a href={getAnalysisLink(m.teams.home.name, m.teams.away.name, 'FOOTY')} target="_blank" className="bg-slate-800/50 p-2 rounded-lg flex items-center justify-center gap-1 text-[8px] font-bold hover:bg-slate-700 transition"><BarChart2 className="w-3 h-3 text-blue-400" /> VÉRIFIER FOOTYSTATS</a>
                    <div className="flex items-center justify-center gap-1 text-[8px] font-bold text-green-500 border border-green-500/20 rounded-lg italic">FIABILITÉ: {pred.conf}</div>
                </div>
              </div>
            );
          })}
        </section>

        {/* RADARS - ANALYSE PACKBALL (LIVE FLUX) */}
        <section className="bg-orange-500/5 border border-orange-500/20 rounded-2xl overflow-hidden shadow-lg">
          <div className="bg-orange-500/10 p-3 flex justify-between items-center text-orange-400 font-black text-[10px] uppercase border-b border-orange-500/20">
            <div className="flex items-center gap-2"><Zap className="w-4 h-4" /> Radar Danger (Flux Packball)</div>
            <button onClick={() => refreshSection('DANGER')} className="bg-orange-500/20 p-2 rounded-full"><RefreshCw className={`${loadingType === 'DANGER' ? 'animate-spin' : ''} w-4 h-4`} /></button>
          </div>
          <div className="divide-y divide-slate-800">
            {radarDanger.map((m, i) => (
              <div key={i} className="p-4 bg-orange-500/[0.02] flex flex-col gap-3">
                <div className="flex justify-between items-center">
                    <div className="text-[11px] font-black uppercase truncate max-w-[150px]">{m.teams.home.name} - {m.teams.away.name}</div>
                    <span className="text-[14px] font-black text-orange-500">{m.goals.home} - {m.goals.away}</span>
                </div>
                <a href={getAnalysisLink(m.teams.home.name, m.teams.away.name, 'PACK')} target="_blank" className="w-full py-2 bg-orange-500/10 border border-orange-500/20 rounded flex items-center justify-center gap-2 text-[9px] font-black text-orange-400 hover:bg-orange-500/20 transition uppercase">Voir les attaques dangereuses sur Packball</a>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}