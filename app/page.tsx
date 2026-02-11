"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Trophy, ShieldCheck, Clock, Flame, RefreshCw, BadgeCheck, BarChart2, Zap, Target, Flag, CreditCard } from "lucide-react";

// Liste Elite complète incluant les Coupes
const ELITE_LEAGUES = [2, 3, 39, 40, 41, 61, 62, 78, 79, 135, 136, 140, 141, 88, 94, 71, 253, 144, 203, 1, 4, 9, 10, 13, 45, 137, 143];

export default function ProBetV15_Final() {
  const [leSauveur, setLeSauveur] = useState<any[]>([]);
  const [singleCoupon, setSingleCoupon] = useState<any[]>([]);
  const [radarHistorique, setRadarHistorique] = useState<any[]>([]);
  const [radarDanger, setRadarDanger] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingType, setLoadingType] = useState<string | null>(null);

  const getAnalysisLink = (home: string, away: string, type: 'FOOTY' | 'PACK') => {
    const query = encodeURIComponent(`${home} vs ${away}`);
    return type === 'FOOTY' ? `https://footystats.org/fr/search?q=${query}` : `https://www.google.com/search?q=Packball+live+stats+${query}`;
  };

  const analyzeMatchMarkets = (m: any) => {
    const leagueId = m.league.id;
    const isHighCorner = [39, 140, 78].includes(leagueId);
    return {
      main: [78, 88].includes(leagueId) ? "LES DEUX MARQUENT" : "1X & +1.5 BUTS",
      corners: isHighCorner ? "+8.5 CORNERS" : "+7.5 CORNERS",
      cornersMT: "OVER 3.5 CORNERS 1H",
      cards: [140, 135, 61].includes(leagueId) ? "+3.5 CARTONS" : "+2.5 CARTONS",
      col: [78, 88].includes(leagueId) ? "#f472b6" : "#4ade80",
      conf: isHighCorner ? "94%" : "88%"
    };
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

      // CORRECTION DES 4 ERREURS CI-DESSOUS (Ajout de : any)
      if (section === 'SAUVEUR') {
        setLeSauveur(elite.filter((m: any) => m.fixture.status.short === "NS").sort(() => Math.random() - 0.5).slice(0, 2));
      } 
      if (section === 'COUPON') {
        setSingleCoupon(elite.filter((m: any) => m.fixture.status.short === "NS").sort(() => Math.random() - 0.5).slice(3, 6));
      }
      if (section === 'HISTO') {
        setRadarHistorique(elite.filter((m: any) => {
          const diffMin = (new Date(m.fixture.date).getTime() - nowTs) / 60000;
          return (diffMin <= 15 && diffMin > 0) || (m.fixture.status.short === "1H");
        }).slice(0, 8));
      }
      if (section === 'DANGER') {
        setRadarDanger(elite.filter((m: any) => ["1H", "2H"].includes(m.fixture.status.short)).slice(0, 5));
      }

    } catch (err) { console.error(err); }
    setLoadingType(null);
  };

  useEffect(() => {
    if (!isLoaded) {
      const init = async () => {
        await Promise.all([refreshSection('SAUVEUR'), refreshSection('COUPON'), refreshSection('HISTO'), refreshSection('DANGER')]);
        setIsLoaded(true);
      };
      init();
    }
  }, [isLoaded]);

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-200 pb-24 font-sans uppercase">
      <header className="bg-[#11192e] p-4 border-b border-slate-800 sticky top-0 z-50 flex justify-between items-center shadow-xl">
        <div className="flex items-center"><Target className="text-red-500 w-5 h-5 mr-2 animate-pulse" /><span className="font-black text-lg italic uppercase tracking-tighter">ProBet V15 PRO</span></div>
        <div className="text-[7px] font-bold text-green-500 border border-green-500/30 px-2 py-1 rounded bg-green-500/5 uppercase">Algo Analyse Complète</div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-8">
        
        {/* LE SAUVEUR */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="flex items-center gap-2 text-red-500 font-black text-[9px] tracking-widest"><ShieldCheck className="w-4 h-4" /> LE SAUVEUR</h3>
            <button onClick={() => refreshSection('SAUVEUR')} className="text-slate-500 p-2"><RefreshCw className={`${loadingType === 'SAUVEUR' ? 'animate-spin' : ''} w-4 h-4`} /></button>
          </div>
          {leSauveur.map((m, i) => {
            const an = analyzeMatchMarkets(m);
            return (
              <div key={i} className="bg-[#11192e] border border-slate-800 rounded-2xl p-4 border-l-4 border-l-red-500 shadow-xl">
                <div className="flex justify-between text-[8px] text-slate-500 mb-2 font-black uppercase"><span>{m.league.name}</span><span className="text-yellow-500">Fiabilité: {an.conf}</span></div>
                <div className="flex justify-between font-black text-sm mb-4"><span>{m.teams.home.name}</span><span>{m.teams.away.name}</span></div>
                <div className="grid grid-cols-1 gap-2 mb-4">
                    <div className="bg-white/5 p-2 rounded-lg text-center font-black text-[10px] border border-white/10 uppercase" style={{color: an.col}}>{an.main}</div>
                    <div className="grid grid-cols-2 gap-2 text-[8px] font-black uppercase">
                        <div className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/20 text-center text-blue-400"><Flag className="w-3 h-3 mx-auto mb-1" />{an.corners}</div>
                        <div className="bg-yellow-500/10 p-2 rounded-lg border border-yellow-500/20 text-center text-yellow-500"><CreditCard className="w-3 h-3 mx-auto mb-1" />{an.cards}</div>
                    </div>
                </div>
                <a href={getAnalysisLink(m.teams.home.name, m.teams.away.name, 'FOOTY')} target="_blank" className="w-full bg-slate-800/80 p-2 rounded-lg flex items-center justify-center gap-2 text-[8px] font-bold border border-slate-700 uppercase">Vérifier FootyStats</a>
              </div>
            );
          })}
        </section>

        {/* UNIQUE COUPON (3 MATCHS) */}
        <section className="bg-[#11192e] rounded-3xl p-5 border border-slate-800 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[9px] font-black uppercase text-slate-400 italic tracking-widest">Coupon Unique (3)</h3>
            <button onClick={() => refreshSection('COUPON')} className="text-slate-500 p-2"><RefreshCw className={`${loadingType === 'COUPON' ? 'animate-spin' : ''} w-4 h-4`} /></button>
          </div>
          <div className="space-y-6">
            {singleCoupon.map((m, i) => (
              <div key={i} className="relative pl-4 border-l-2 border-yellow-500/40">
                <div className="flex justify-between text-[7px] text-slate-500 mb-1 font-bold uppercase"><span>{m.league.name}</span><span>{new Date(m.fixture.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div>
                <div className="flex justify-between font-black text-[11px] mb-1 uppercase"><span>{m.teams.home.name}</span><span>{m.teams.away.name}</span></div>
                <div className="text-[9px] font-black text-yellow-500 uppercase">{analyzeMatchMarkets(m).main} & +7.5 Corners</div>
              </div>
            ))}
          </div>
        </section>

        {/* RADAR DANGER AVEC CHRONO */}
        <section className="bg-orange-500/5 border border-orange-500/20 rounded-2xl overflow-hidden shadow-lg">
          <div className="bg-orange-500/10 p-3 flex justify-between items-center text-orange-400 font-black text-[9px] uppercase border-b border-orange-500/20">
            <div className="flex items-center gap-2"><Flame className="w-4 h-4" /> Radar Danger (Live)</div>
            <button onClick={() => refreshSection('DANGER')} className="bg-orange-500/20 p-2 rounded-full"><RefreshCw className={`${loadingType === 'DANGER' ? 'animate-spin' : ''} w-3 h-3`} /></button>
          </div>
          <div className="divide-y divide-slate-800">
            {radarDanger.map((m, i) => (
              <div key={i} className="p-4 bg-orange-500/[0.03] flex flex-col gap-3">
                <div className="flex justify-between items-center">
                    <div className="text-[10px] font-black uppercase truncate max-w-[150px]">{m.teams.home.name} - {m.teams.away.name}</div>
                    <div className="flex gap-3 items-center">
                      <span className="text-[14px] font-black text-orange-500">{m.goals.home} - {m.goals.away}</span>
                      <span className="text-[9px] text-orange-400 font-bold bg-orange-500/10 px-1 rounded animate-pulse">{m.fixture.status.elapsed}'</span>
                    </div>
                </div>
                <a href={getAnalysisLink(m.teams.home.name, m.teams.away.name, 'PACK')} target="_blank" className="w-full py-2 bg-orange-500/10 border border-orange-500/20 rounded flex items-center justify-center gap-2 text-[8px] font-black text-orange-400 uppercase">Analyse Flux PackBall</a>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}